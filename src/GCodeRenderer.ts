/**
 * GCode Renderer - Renders parsed G-code as Three.js objects
 * Supports lines and tube rendering, multi-color, and path type coloring
 * 
 * Uses merged geometry per color per layer to eliminate z-fighting
 */
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GCodeLayer, GCodePath, PathType, PATH_TYPE_COLORS, BoundingBox } from './GCodeParser';
import { ExtrusionGeometry } from './ExtrusionGeometry';

export interface RenderOptions {
    /** Render as 3D tubes instead of lines (default: false) */
    renderTubes?: boolean;
    /** Line width in pixels for line rendering (default: 2) */
    lineWidth?: number;
    /** Extrusion width for tube rendering (default: 0.4) */
    extrusionWidth?: number;
    /** Line/layer height for tube rendering (default: 0.2) */
    lineHeight?: number;
    /** Number of radial segments for tubes (default: 4 for performance) */
    radialSegments?: number;
    /** Color scheme: 'pathType', 'height', 'tool' (default: 'pathType') */
    colorScheme?: 'pathType' | 'height' | 'tool';
    /** Colors for each tool (T0, T1, etc.) */
    toolColors?: string[];
    /** Custom colors for path types (color theme) */
    customColors?: Record<string, string>;
    /** Whether to show travel moves (default: false) */
    showTravel?: boolean;
    /** Travel move color (default: red) */
    travelColor?: string;
    /** Canvas width for line material resolution */
    canvasWidth?: number;
    /** Canvas height for line material resolution */
    canvasHeight?: number;
}

export interface RenderedLayer {
    index: number;
    zHeight: number;
    object: THREE.Group;
    visible: boolean;
    extrusionLines: THREE.Object3D[];
    travelLines: THREE.Object3D[];
}

export class GCodeRenderer {
    private options: Omit<Required<RenderOptions>, 'customColors'> & { customColors?: Record<string, string> };
    private lineMaterials: Map<string, LineMaterial> = new Map();
    private tubeMaterials: Map<string, THREE.MeshLambertMaterial> = new Map();

    constructor(options: RenderOptions = {}) {
        this.options = {
            renderTubes: options.renderTubes ?? false,
            lineWidth: options.lineWidth ?? 2,
            extrusionWidth: options.extrusionWidth ?? 0.4,
            lineHeight: options.lineHeight ?? 0.2,
            radialSegments: options.radialSegments ?? 4,
            colorScheme: options.colorScheme ?? 'pathType',
            toolColors: options.toolColors ?? ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#a29bfe', '#fd79a8'],
            customColors: options.customColors,
            showTravel: options.showTravel ?? false,
            travelColor: options.travelColor ?? '#ff0000',
            canvasWidth: options.canvasWidth ?? 1920,
            canvasHeight: options.canvasHeight ?? 1080
        };
    }

    /**
     * Render layers to Three.js objects
     * Uses single merged mesh per color per layer to eliminate z-fighting
     */
    render(layers: GCodeLayer[], boundingBox: BoundingBox): RenderedLayer[] {
        const renderedLayers: RenderedLayer[] = [];
        const totalLayers = layers.length;

        // Calculate center offset
        const center = new THREE.Vector3();
        center.addVectors(boundingBox.min, boundingBox.max).multiplyScalar(0.5);

        for (const layer of layers) {
            const layerGroup = new THREE.Group();
            layerGroup.name = `layer_${layer.index}`;

            const extrusionLines: THREE.Object3D[] = [];
            const travelLines: THREE.Object3D[] = [];

            if (this.options.renderTubes) {
                // Collect all geometries for this layer by color
                const geometriesByColor: Record<string, ExtrusionGeometry[]> = {};

                for (const path of layer.paths) {
                    if (path.vertices.length < 6) continue;
                    if (path.pathType === 'travel' && !this.options.showTravel) continue;
                    if (!path.isExtrusion) continue;

                    const color = this.getPathColor(path, layer.index, totalLayers);

                    // Convert vertices to Vector3 array
                    const points: THREE.Vector3[] = [];
                    for (let i = 0; i < path.vertices.length; i += 3) {
                        points.push(new THREE.Vector3(
                            path.vertices[i] - center.x,
                            path.vertices[i + 1] - center.y,
                            path.vertices[i + 2] - center.z
                        ));
                    }

                    if (points.length < 2) continue;

                    const geometry = new ExtrusionGeometry(
                        points,
                        path.extrusionWidth || this.options.extrusionWidth,
                        path.lineHeight || this.options.lineHeight,
                        this.options.radialSegments
                    );

                    if (geometry.attributes['position']?.count > 0) {
                        if (!geometriesByColor[color]) {
                            geometriesByColor[color] = [];
                        }
                        geometriesByColor[color].push(geometry);
                    }
                }

                // Create one merged mesh per color for this layer
                for (const color in geometriesByColor) {
                    const geometries = geometriesByColor[color];
                    if (geometries.length === 0) continue;

                    // Merge all geometries of the same color into one
                    const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false);

                    // Dispose individual geometries
                    for (const geom of geometries) {
                        geom.dispose();
                    }

                    if (!mergedGeometry) continue;

                    const material = this.getTubeMaterial(color);
                    const mesh = new THREE.Mesh(mergedGeometry, material);
                    mesh.userData['color'] = color;
                    mesh.userData['isExtrusion'] = true;

                    layerGroup.add(mesh);
                    extrusionLines.push(mesh);
                }
            } else {
                // Line rendering - keep individual objects
                for (const path of layer.paths) {
                    if (path.vertices.length < 6) continue;
                    if (path.pathType === 'travel' && !this.options.showTravel) continue;

                    const color = this.getPathColor(path, layer.index, totalLayers);
                    const object = this.createLine(path, color, center);

                    object.userData['pathType'] = path.pathType;
                    object.userData['tool'] = path.tool;
                    object.userData['isExtrusion'] = path.isExtrusion;

                    layerGroup.add(object);

                    if (path.isExtrusion) {
                        extrusionLines.push(object);
                    } else {
                        travelLines.push(object);
                    }
                }
            }

            renderedLayers.push({
                index: layer.index,
                zHeight: layer.zHeight,
                object: layerGroup,
                visible: true,
                extrusionLines,
                travelLines
            });
        }

        return renderedLayers;
    }

    /**
     * Create a Line2 object for a path
     */
    private createLine(path: GCodePath, color: string, center: THREE.Vector3): Line2 {
        // Convert vertices to centered positions
        const positions: number[] = [];
        for (let i = 0; i < path.vertices.length; i += 3) {
            positions.push(
                path.vertices[i] - center.x,
                path.vertices[i + 1] - center.y,
                path.vertices[i + 2] - center.z
            );
        }

        const geometry = new LineGeometry();
        geometry.setPositions(positions);

        const material = this.getLineMaterial(color);
        return new Line2(geometry, material);
    }

    /**
     * Get or create a line material for a color
     */
    private getLineMaterial(color: string): LineMaterial {
        if (!this.lineMaterials.has(color)) {
            const material = new LineMaterial({
                color: new THREE.Color(color).getHex(),
                linewidth: this.options.lineWidth,
                resolution: new THREE.Vector2(this.options.canvasWidth, this.options.canvasHeight)
            });
            this.lineMaterials.set(color, material);
        }
        return this.lineMaterials.get(color)!;
    }

    /**
     * Get or create a tube material for a color
     */
    private getTubeMaterial(color: string): THREE.MeshLambertMaterial {
        if (!this.tubeMaterials.has(color)) {
            const material = new THREE.MeshLambertMaterial({
                color: new THREE.Color(color),
                side: THREE.FrontSide
            });
            this.tubeMaterials.set(color, material);
        }
        return this.tubeMaterials.get(color)!;
    }

    /**
     * Determine color for a path based on color scheme
     */
    private getPathColor(path: GCodePath, layerIndex: number, totalLayers: number): string {
        switch (this.options.colorScheme) {
            case 'tool':
                return this.options.toolColors[path.tool % this.options.toolColors.length];

            case 'height':
                const hue = (layerIndex / Math.max(totalLayers - 1, 1)) * 0.7;
                return `hsl(${hue * 360}, 80%, 50%)`;

            case 'pathType':
            default:
                if (this.options.customColors && this.options.customColors[path.pathType]) {
                    return this.options.customColors[path.pathType];
                }
                return PATH_TYPE_COLORS[path.pathType] || PATH_TYPE_COLORS.unknown;
        }
    }

    /**
     * Update line material resolution (call on window resize)
     */
    updateResolution(width: number, height: number): void {
        this.options.canvasWidth = width;
        this.options.canvasHeight = height;

        for (const material of this.lineMaterials.values()) {
            material.resolution.set(width, height);
        }
    }

    /**
     * Update line width
     */
    setLineWidth(width: number): void {
        this.options.lineWidth = width;
        for (const material of this.lineMaterials.values()) {
            material.linewidth = width;
        }
    }

    /**
     * Dispose all materials
     */
    dispose(): void {
        for (const material of this.lineMaterials.values()) {
            material.dispose();
        }
        for (const material of this.tubeMaterials.values()) {
            material.dispose();
        }
        this.lineMaterials.clear();
        this.tubeMaterials.clear();
    }
}
