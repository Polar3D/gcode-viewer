import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import {
  PathType,
  PATH_TYPE_COLORS,
  GCodeViewerOptions,
  ResolvedGCodeViewerOptions,
  GCodePrintInfo,
  LayerData,
  ParseResult,
} from './types';
import { parsePathType, parsePrintInfoFromLine } from './parser';
import { injectBranding } from './branding';

interface PathSegment {
  vertices: number[];
  pathType: PathType;
}

interface LayerRawData {
  segments: PathSegment[];
  pathVertex: number[];
  z: number;
}

/**
 * GCodeViewer - A Three.js-based G-code viewer
 *
 * @example
 * ```typescript
 * import { GCodeViewer } from '@polar3d/gcode-viewer';
 *
 * // Container is required - branding is auto-injected per license
 * const container = document.getElementById('viewer-container');
 * const viewer = new GCodeViewer({ container });
 * const result = viewer.parse(gcodeText);
 *
 * // Add to your Three.js scene
 * scene.add(result.object);
 *
 * // Control layers
 * viewer.setMaxVisibleLayer(50);
 * viewer.setColorScheme('height');
 * ```
 */
export class GCodeViewer {
  private layers: LayerData[] = [];
  private gcodeGroup: THREE.Group | null = null;
  private pathTypeFilter: PathType | null = null;
  private options: ResolvedGCodeViewerOptions;
  private printInfo: GCodePrintInfo | null = null;
  private brandingInjected: boolean = false;

  constructor(options: GCodeViewerOptions = {}) {
    this.options = {
      lineWidth: options.lineWidth ?? 0.45,
      hidePurgeLines: options.hidePurgeLines ?? true,
      colorScheme: options.colorScheme ?? 'pathType',
      showTravelMoves: options.showTravelMoves ?? false,
      container: options.container,
    };
  }

  /**
   * Set the container element for branding injection
   * Call this before parse() if container wasn't provided in constructor
   */
  setContainer(container: HTMLElement): void {
    this.options.container = container;
  }

  /**
   * Parse G-code text and create layer-organized 3D objects
   * Automatically injects "Powered by Polar3D" branding if container is set
   */
  parse(gcodeText: string): ParseResult {
    // Auto-inject branding if container is provided
    if (this.options.container && !this.brandingInjected) {
      injectBranding(this.options.container);
      this.brandingInjected = true;
    }

    const hidePurgeLines = this.options.hidePurgeLines;
    const state = {
      x: 0,
      y: 0,
      z: 0,
      e: 0,
      f: 0,
      extruding: false,
      relative: false,
      relativeE: false,
    };

    // Layer data with path type segments
    const layersData: Map<number, LayerRawData> = new Map();

    let currentPathType: PathType = 'unknown';

    // Track detected path types
    const detectedPathTypes = new Set<PathType>();

    // Print info extraction
    let estimatedTime: number | null = null;
    let filamentLength: number | null = null;
    let layerHeight: number | null = null;

    // Track model bounds
    let modelMinX = Infinity,
      modelMaxX = -Infinity;
    let modelMinY = Infinity,
      modelMaxY = -Infinity;
    let modelMinZ = Infinity,
      modelMaxZ = -Infinity;
    const allExtrudedPoints: { x: number; y: number; z: number }[] = [];

    // Helper functions
    const getOrCreateLayer = (z: number): LayerRawData => {
      const roundedZ = Math.round(z * 10000) / 10000;
      if (!layersData.has(roundedZ)) {
        layersData.set(roundedZ, { segments: [], pathVertex: [], z: roundedZ });
      }
      return layersData.get(roundedZ)!;
    };

    const addSegment = (
      p1: { x: number; y: number; z: number },
      p2: { x: number; y: number; z: number },
      isExtruding: boolean,
      pathType: PathType
    ) => {
      const layer = getOrCreateLayer(p2.z);
      if (isExtruding) {
        // Find or create segment for this path type
        let segment = layer.segments.find((s) => s.pathType === pathType);
        if (!segment) {
          segment = { vertices: [], pathType };
          layer.segments.push(segment);
        }
        segment.vertices.push(p1.x, p1.y, p1.z);
        segment.vertices.push(p2.x, p2.y, p2.z);

        allExtrudedPoints.push({ x: p1.x, y: p1.y, z: p1.z });
        allExtrudedPoints.push({ x: p2.x, y: p2.y, z: p2.z });

        detectedPathTypes.add(pathType);
      } else {
        layer.pathVertex.push(p1.x, p1.y, p1.z);
        layer.pathVertex.push(p2.x, p2.y, p2.z);
      }
    };

    const absolute = (v1: number, v2: number) => (state.relative ? v1 + v2 : v2);
    const absoluteE = (v1: number, v2: number) => (state.relativeE ? v1 + v2 : v2);

    // Parse G-code lines
    const lines = gcodeText.split('\n');

    for (const lineText of lines) {
      const trimmedLine = lineText.trim();

      // Check for comments to extract path type and print info
      const commentIndex = trimmedLine.indexOf(';');
      if (commentIndex !== -1) {
        const comment = trimmedLine.substring(commentIndex + 1);
        const info = parsePrintInfoFromLine(trimmedLine, {
          estimatedTime,
          filamentLength,
          layerHeight,
        });
        estimatedTime = info.estimatedTime;
        filamentLength = info.filamentLength;
        layerHeight = info.layerHeight;

        const newPathType = parsePathType(comment);
        if (newPathType) {
          currentPathType = newPathType;
        }
      }

      // Remove comments for command parsing
      const cleanLine = trimmedLine.replace(/;.*/g, '').trim();
      const tokens = cleanLine.split(/\s+/);
      if (tokens.length === 0 || !tokens[0]) continue;

      const cmd = tokens[0].toUpperCase();
      const args: { [key: string]: number } = {};

      tokens.slice(1).forEach((token) => {
        if (token && token[0]) {
          const key = token[0].toLowerCase();
          const value = parseFloat(token.substring(1));
          if (!isNaN(value)) {
            args[key] = value;
          }
        }
      });

      // G0/G1 - Linear Movement
      if (cmd === 'G0' || cmd === 'G1') {
        const line = {
          x: args['x'] !== undefined ? absolute(state.x, args['x']) : state.x,
          y: args['y'] !== undefined ? absolute(state.y, args['y']) : state.y,
          z: args['z'] !== undefined ? absolute(state.z, args['z']) : state.z,
          e: args['e'] !== undefined ? absoluteE(state.e, args['e']) : state.e,
          f: args['f'] !== undefined ? absolute(state.f, args['f']) : state.f,
        };

        const extrusionDelta = state.relativeE ? args['e'] || 0 : line.e - state.e;
        const isExtruding = extrusionDelta > 0;

        addSegment(state, line, isExtruding, currentPathType);

        Object.assign(state, line);
        state.extruding = isExtruding;
      }
      // G28 - Home
      else if (cmd === 'G28') {
        state.x = args['x'] !== undefined ? 0 : state.x;
        state.y = args['y'] !== undefined ? 0 : state.y;
        state.z = args['z'] !== undefined ? 0 : state.z;
      }
      // G90 - Absolute positioning
      else if (cmd === 'G90') {
        state.relative = false;
      }
      // G91 - Relative positioning
      else if (cmd === 'G91') {
        state.relative = true;
      }
      // G92 - Set position
      else if (cmd === 'G92') {
        state.x = args['x'] !== undefined ? args['x'] : state.x;
        state.y = args['y'] !== undefined ? args['y'] : state.y;
        state.z = args['z'] !== undefined ? args['z'] : state.z;
        state.e = args['e'] !== undefined ? args['e'] : state.e;
      }
      // M82 - Absolute extrusion
      else if (cmd === 'M82') {
        state.relativeE = false;
      }
      // M83 - Relative extrusion
      else if (cmd === 'M83') {
        state.relativeE = true;
      }
    }

    // Calculate model bounds and filter purge lines
    if (hidePurgeLines && allExtrudedPoints.length > 0) {
      // First pass: calculate rough bounds
      for (const pt of allExtrudedPoints) {
        modelMinX = Math.min(modelMinX, pt.x);
        modelMaxX = Math.max(modelMaxX, pt.x);
        modelMinY = Math.min(modelMinY, pt.y);
        modelMaxY = Math.max(modelMaxY, pt.y);
        modelMinZ = Math.min(modelMinZ, pt.z);
        modelMaxZ = Math.max(modelMaxZ, pt.z);
      }

      const modelCenterX = (modelMinX + modelMaxX) / 2;
      const modelCenterY = (modelMinY + modelMaxY) / 2;
      const modelSizeX = modelMaxX - modelMinX;
      const modelSizeY = modelMaxY - modelMinY;

      const distanceThreshold = Math.max(modelSizeX, modelSizeY) * 0.4;
      const corePoints = allExtrudedPoints.filter((pt) => {
        const distFromCenter = Math.sqrt(
          Math.pow(pt.x - modelCenterX, 2) + Math.pow(pt.y - modelCenterY, 2)
        );
        return distFromCenter < distanceThreshold;
      });

      let coreMinX = modelMinX,
        coreMaxX = modelMaxX;
      let coreMinY = modelMinY,
        coreMaxY = modelMaxY;

      if (corePoints.length > allExtrudedPoints.length * 0.5) {
        coreMinX = Infinity;
        coreMaxX = -Infinity;
        coreMinY = Infinity;
        coreMaxY = -Infinity;
        for (const pt of corePoints) {
          coreMinX = Math.min(coreMinX, pt.x);
          coreMaxX = Math.max(coreMaxX, pt.x);
          coreMinY = Math.min(coreMinY, pt.y);
          coreMaxY = Math.max(coreMaxY, pt.y);
        }
      }

      const coreSizeX = coreMaxX - coreMinX;
      const coreSizeY = coreMaxY - coreMinY;
      const purgeMargin = Math.max(coreSizeX, coreSizeY) * 0.15;

      // Filter purge lines from each layer's segments
      for (const [, layerData] of layersData) {
        for (const segment of layerData.segments) {
          const filteredVertices: number[] = [];

          for (let i = 0; i < segment.vertices.length; i += 6) {
            const x1 = segment.vertices[i];
            const y1 = segment.vertices[i + 1];
            const x2 = segment.vertices[i + 3];
            const y2 = segment.vertices[i + 4];

            const segmentLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

            const pt1InCore =
              x1 >= coreMinX - purgeMargin &&
              x1 <= coreMaxX + purgeMargin &&
              y1 >= coreMinY - purgeMargin &&
              y1 <= coreMaxY + purgeMargin;
            const pt2InCore =
              x2 >= coreMinX - purgeMargin &&
              x2 <= coreMaxX + purgeMargin &&
              y2 >= coreMinY - purgeMargin &&
              y2 <= coreMaxY + purgeMargin;

            const nearEdge =
              (y1 < 15 && y2 < 15) ||
              (x1 < 15 && x2 < 15) ||
              ((y1 < 20 || y2 < 20) && segmentLength > 20);
            const isLongPurgeLine = nearEdge && segmentLength > 30;

            const isDiagonalFromCorner =
              ((x1 < 30 && y1 < 30) || (x2 < 30 && y2 < 30)) && segmentLength > 15;

            if (pt1InCore && pt2InCore && !isLongPurgeLine && !isDiagonalFromCorner) {
              filteredVertices.push(...segment.vertices.slice(i, i + 6));
            }
          }

          segment.vertices = filteredVertices;
        }
      }

      // Recalculate bounds after filtering
      let finalMinX = Infinity,
        finalMaxX = -Infinity;
      let finalMinY = Infinity,
        finalMaxY = -Infinity;
      let finalMinZ = Infinity,
        finalMaxZ = -Infinity;

      for (const [, layerData] of layersData) {
        for (const segment of layerData.segments) {
          for (let i = 0; i < segment.vertices.length; i += 3) {
            const x = segment.vertices[i];
            const y = segment.vertices[i + 1];
            const zVal = segment.vertices[i + 2];
            finalMinX = Math.min(finalMinX, x);
            finalMaxX = Math.max(finalMaxX, x);
            finalMinY = Math.min(finalMinY, y);
            finalMaxY = Math.max(finalMaxY, y);
            finalMinZ = Math.min(finalMinZ, zVal);
            finalMaxZ = Math.max(finalMaxZ, zVal);
          }
        }
      }

      // Update model bounds for print info
      modelMinX = finalMinX;
      modelMaxX = finalMaxX;
      modelMinY = finalMinY;
      modelMaxY = finalMaxY;
      modelMinZ = finalMinZ;
      modelMaxZ = finalMaxZ;

      // Center offset
      const centerX = (finalMinX + finalMaxX) / 2;
      const centerY = (finalMinY + finalMaxY) / 2;
      const centerZ = finalMinZ;

      // Offset all vertices
      for (const [, layerData] of layersData) {
        for (const segment of layerData.segments) {
          for (let i = 0; i < segment.vertices.length; i += 3) {
            segment.vertices[i] -= centerX;
            segment.vertices[i + 1] -= centerY;
            segment.vertices[i + 2] -= centerZ;
          }
        }
        for (let i = 0; i < layerData.pathVertex.length; i += 3) {
          layerData.pathVertex[i] -= centerX;
          layerData.pathVertex[i + 1] -= centerY;
          layerData.pathVertex[i + 2] -= centerZ;
        }
      }

      // Update bounds after centering
      modelMinX -= centerX;
      modelMaxX -= centerX;
      modelMinY -= centerY;
      modelMaxY -= centerY;
      modelMinZ -= centerZ;
      modelMaxZ -= centerZ;
    }

    // Create THREE.js objects
    this.gcodeGroup = new THREE.Group();
    this.layers = [];

    const sortedZHeights = Array.from(layersData.keys()).sort((a, b) => a - b);
    const totalLayers = sortedZHeights.length;

    sortedZHeights.forEach((z, index) => {
      const layerData = layersData.get(z)!;
      const layerGroup = new THREE.Group();
      layerGroup.name = `layer_${index}_z${z.toFixed(3)}`;

      // Create line for each path type segment
      for (const segment of layerData.segments) {
        if (segment.vertices.length > 0) {
          const lineGeometry = new LineGeometry();
          lineGeometry.setPositions(segment.vertices);

          const color = new THREE.Color(PATH_TYPE_COLORS[segment.pathType] || '#888888');

          const lineMaterial = new LineMaterial({
            color: color.getHex(),
            linewidth: this.options.lineWidth,
            worldUnits: true,
            dashed: false,
            alphaToCoverage: false,
          });
          lineMaterial.resolution.set(window.innerWidth, window.innerHeight);

          const line = new Line2(lineGeometry, lineMaterial);
          line.computeLineDistances();
          line.name = `extruded_${segment.pathType}`;
          line.userData['pathType'] = segment.pathType;
          layerGroup.add(line);
        }
      }

      // Create travel path geometry
      if (layerData.pathVertex.length > 0) {
        const pathGeometry = new LineGeometry();
        pathGeometry.setPositions(layerData.pathVertex);

        const pathMaterial = new LineMaterial({
          color: 0x888888,
          linewidth: 0.1,
          worldUnits: true,
          transparent: true,
          opacity: 0.4,
        });
        pathMaterial.resolution.set(window.innerWidth, window.innerHeight);

        const pathLine = new Line2(pathGeometry, pathMaterial);
        pathLine.computeLineDistances();
        pathLine.name = 'travel';
        pathLine.userData['pathType'] = 'travel';
        pathLine.visible = this.options.showTravelMoves;
        layerGroup.add(pathLine);
      }

      layerGroup.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
      this.gcodeGroup!.add(layerGroup);

      this.layers.push({
        index,
        zHeight: z,
        object: layerGroup,
        visible: true,
      });
    });

    // Calculate and store print info
    const sizeX = modelMaxX - modelMinX;
    const sizeY = modelMaxY - modelMinY;
    const sizeZ = modelMaxZ - modelMinZ;

    // Estimate layer height from z-heights
    if (!layerHeight && sortedZHeights.length > 1) {
      layerHeight = sortedZHeights[1] - sortedZHeights[0];
    }

    this.printInfo = {
      size: sizeX > 0 && sizeY > 0 && sizeZ > 0 ? { x: sizeX, y: sizeY, z: sizeZ } : null,
      estimatedTime,
      filamentLength,
      filaments: [],
      layerCount: totalLayers,
      layerHeight,
      pathTypes: Array.from(detectedPathTypes).sort(),
    };

    // Apply initial color scheme
    if (this.options.colorScheme === 'height') {
      this.setColorScheme('height');
    }

    return {
      object: this.gcodeGroup,
      printInfo: this.printInfo,
      layers: this.layers,
    };
  }

  /**
   * Set which layers are visible (0 to maxLayer)
   */
  setMaxVisibleLayer(maxLayer: number): void {
    if (!this.layers.length) return;

    const clampedMax = Math.max(0, Math.min(maxLayer, this.layers.length - 1));

    this.layers.forEach((layer, index) => {
      layer.visible = index <= clampedMax;
      layer.object.visible = layer.visible;
    });
  }

  /**
   * Set visibility range (fromLayer to toLayer)
   */
  setLayerRange(fromLayer: number, toLayer: number): void {
    if (!this.layers.length) return;

    const from = Math.max(0, Math.min(fromLayer, this.layers.length - 1));
    const to = Math.max(0, Math.min(toLayer, this.layers.length - 1));

    this.layers.forEach((layer, index) => {
      layer.visible = index >= from && index <= to;
      layer.object.visible = layer.visible;
    });
  }

  /**
   * Show only a single layer
   */
  showSingleLayer(layerIndex: number): void {
    if (!this.layers.length) return;

    const index = Math.max(0, Math.min(layerIndex, this.layers.length - 1));

    this.layers.forEach((layer, i) => {
      layer.visible = i === index;
      layer.object.visible = layer.visible;
    });
  }

  /**
   * Show all layers
   */
  showAllLayers(): void {
    this.layers.forEach((layer) => {
      layer.visible = true;
      layer.object.visible = true;
    });
  }

  /**
   * Toggle travel moves visibility
   */
  setTravelMovesVisible(visible: boolean): void {
    this.layers.forEach((layer) => {
      layer.object.traverse((child) => {
        if (child.userData['pathType'] === 'travel' || child.name === 'travel') {
          child.visible = visible && layer.visible;
        }
      });
    });
  }

  /**
   * Filter by path type (null to show all)
   */
  setPathTypeFilter(pathType: PathType | null): void {
    this.pathTypeFilter = pathType;
    this.applyPathTypeFilter();
  }

  private applyPathTypeFilter(): void {
    this.layers.forEach((layer) => {
      layer.object.traverse((child) => {
        if (child instanceof Line2 && child.userData['pathType']) {
          const isTravel = child.userData['pathType'] === 'travel';
          if (isTravel) return; // Travel handled separately

          if (this.pathTypeFilter === null) {
            // Show all path types
            child.visible = layer.visible;
          } else {
            // Show only selected path type
            child.visible = layer.visible && child.userData['pathType'] === this.pathTypeFilter;
          }
        }
      });
    });
  }

  /**
   * Get total number of layers
   */
  getTotalLayers(): number {
    return this.layers.length;
  }

  /**
   * Get layer info by index
   */
  getLayer(index: number): LayerData | undefined {
    return this.layers[index];
  }

  /**
   * Get print info
   */
  getPrintInfo(): GCodePrintInfo | null {
    return this.printInfo;
  }

  /**
   * Check if G-code is loaded
   */
  isLoaded(): boolean {
    return this.layers.length > 0;
  }

  /**
   * Reset/clear the viewer
   */
  reset(): void {
    this.layers = [];
    this.gcodeGroup = null;
    this.pathTypeFilter = null;
    this.printInfo = null;
    // Note: branding stays injected - don't remove it
  }

  /**
   * Set layer color scheme
   */
  setColorScheme(scheme: 'pathType' | 'height'): void {
    const totalLayers = this.layers.length;

    if (scheme === 'height') {
      // Color layers by height gradient
      this.layers.forEach((layer, index) => {
        const heightRatio = index / Math.max(1, totalLayers - 1);
        const color = new THREE.Color();
        const hue = 0.6 - heightRatio * 0.55;
        color.setHSL(hue < 0 ? hue + 1 : hue, 0.8, 0.55);

        layer.object.traverse((child) => {
          if (
            child instanceof Line2 &&
            child.userData['pathType'] &&
            child.userData['pathType'] !== 'travel'
          ) {
            (child.material as LineMaterial).color = color;
          }
        });
      });
    } else {
      // Color by path type
      this.layers.forEach((layer) => {
        layer.object.traverse((child) => {
          if (child instanceof Line2 && child.userData['pathType']) {
            const pathType = child.userData['pathType'] as PathType;
            const color = new THREE.Color(PATH_TYPE_COLORS[pathType] || '#888888');
            (child.material as LineMaterial).color = color;
          }
        });
      });
    }
  }

  /**
   * Update line material resolution (call on window resize)
   */
  updateResolution(width: number, height: number): void {
    this.layers.forEach((layer) => {
      layer.object.traverse((child) => {
        if (child instanceof Line2) {
          (child.material as LineMaterial).resolution.set(width, height);
        }
      });
    });
  }
}
