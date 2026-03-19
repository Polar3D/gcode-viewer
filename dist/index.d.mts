import * as THREE from 'three';
import { BufferGeometry, Vector3 } from 'three';

/**
 * @polar3d/gcode-viewer
 * A Three.js-based G-code viewer with layer-by-layer visualization
 */
type PathType$1 = 'outer_perimeter' | 'inner_perimeter' | 'infill' | 'solid_infill' | 'top_solid_infill' | 'bottom_solid_infill' | 'bridge' | 'skirt' | 'brim' | 'support' | 'support_interface' | 'prime_tower' | 'wipe_tower' | 'travel' | 'unknown';
/** Custom colors for path types - used for color themes */
type CustomColors = Partial<Record<PathType$1, string>>;
/** Pre-defined color themes */
interface ColorTheme {
    id: string;
    name: string;
    colors: CustomColors;
}
/** Built-in color themes */
declare const COLOR_THEMES: ColorTheme[];
interface FilamentUsage {
    index: number;
    length: number;
    color?: string;
}
interface GCodePrintInfo {
    size: {
        x: number;
        y: number;
        z: number;
    } | null;
    estimatedTime: number | null;
    filamentLength: number | null;
    filaments: FilamentUsage[];
    layerCount: number;
    layerHeight: number | null;
    pathTypes: PathType$1[];
}
interface GCodeViewerOptions {
    /** Line width for extruded paths (default: 2) */
    lineWidth?: number;
    /** Whether to hide purge/prime lines (default: true) */
    hidePurgeLines?: boolean;
    /** Initial color scheme: 'pathType' or 'height' (default: 'pathType') */
    colorScheme?: 'pathType' | 'height';
    /** Whether travel moves are visible by default (default: false) */
    showTravelMoves?: boolean;
    /**
     * Container element for the viewer. When provided, "Powered by Polar3D"
     * branding will be automatically injected (required by license).
     */
    container?: HTMLElement;
    /**
     * Render as 3D tubes instead of lines (default: false)
     * Provides more realistic visualization of extrusion paths
     */
    renderTubes?: boolean;
    /** Extrusion width for tube rendering in mm (default: 0.4) */
    extrusionWidth?: number;
    /** Line/layer height for tube rendering in mm (default: 0.2) */
    lineHeight?: number;
    /** Number of radial segments for tubes (default: 4 for performance) */
    radialSegments?: number;
    /** Custom colors for path types - allows color theme customization */
    customColors?: CustomColors;
}
interface ParseResult$1 {
    /** The Three.js group containing all layer objects */
    object: THREE.Group;
    /** Information extracted from the G-code */
    printInfo: GCodePrintInfo;
    /** Array of layer data */
    layers: LayerData[];
}
interface LayerData {
    index: number;
    zHeight: number;
    object: THREE.Group;
    visible: boolean;
}
/** Domains where branding is not required (Polar3D owned properties) */
declare const WHITELISTED_DOMAINS: string[];

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
declare class GCodeViewer {
    private layers;
    private gcodeGroup;
    private pathTypeFilter;
    private options;
    private printInfo;
    private brandingInjected;
    private lineMaterials;
    private tubeMaterials;
    constructor(options?: GCodeViewerOptions);
    /**
     * Set the container element for branding injection
     * Call this before parse() if container wasn't provided in constructor
     */
    setContainer(container: HTMLElement): void;
    /**
     * Parse G-code text and create layer-organized 3D objects
     * Automatically injects "Powered by Polar3D" branding if container is set
     */
    parse(gcodeText: string): ParseResult$1;
    /**
     * Set which layers are visible (0 to maxLayer)
     */
    setMaxVisibleLayer(maxLayer: number): void;
    /**
     * Set visibility range (fromLayer to toLayer)
     */
    setLayerRange(fromLayer: number, toLayer: number): void;
    /**
     * Show only a single layer
     */
    showSingleLayer(layerIndex: number): void;
    /**
     * Show all layers
     */
    showAllLayers(): void;
    /**
     * Toggle travel moves visibility
     */
    setTravelMovesVisible(visible: boolean): void;
    /**
     * Filter by path type (null to show all)
     */
    setPathTypeFilter(pathType: PathType$1 | null): void;
    private applyPathTypeFilter;
    /**
     * Get total number of layers
     */
    getTotalLayers(): number;
    /**
     * Get layer info by index
     */
    getLayer(index: number): LayerData | undefined;
    /**
     * Get print info
     */
    getPrintInfo(): GCodePrintInfo | null;
    /**
     * Check if G-code is loaded
     */
    isLoaded(): boolean;
    /**
     * Reset/clear the viewer
     */
    reset(): void;
    /**
     * Set layer color scheme
     */
    setColorScheme(scheme: 'pathType' | 'height'): void;
    /**
     * Set custom colors for path types (color theme)
     */
    setCustomColors(customColors: CustomColors | undefined): void;
    /**
     * Get color for a path type based on current settings
     */
    private getPathColor;
    /**
     * Get or create a line material for a color
     */
    private getLineMaterial;
    /**
     * Get or create a tube material for a color
     */
    private getTubeMaterial;
    /**
     * Update line material resolution (call on window resize)
     */
    updateResolution(width: number, height: number): void;
    /**
     * Dispose all materials and resources
     */
    dispose(): void;
}

/**
 * G-code Parser with G2/G3 arc support, multi-color support, and thumbnail extraction
 * Based on gcode-preview library concepts
 */

type PathType = 'outer_perimeter' | 'inner_perimeter' | 'infill' | 'solid_infill' | 'top_solid_infill' | 'bottom_solid_infill' | 'bridge' | 'skirt' | 'brim' | 'support' | 'support_interface' | 'prime_tower' | 'wipe_tower' | 'travel' | 'unknown';
declare const PATH_TYPE_COLORS: Record<PathType, string>;
interface GCodeCommand {
    src: string;
    gcode: string;
    params: GCodeParameters;
    comment?: string;
}
interface GCodeParameters {
    x?: number;
    y?: number;
    z?: number;
    e?: number;
    f?: number;
    i?: number;
    j?: number;
    r?: number;
    t?: number;
    [key: string]: number | undefined;
}
interface Thumbnail {
    size: string;
    width: number;
    height: number;
    chars: string;
    charLength: number;
    src: string;
    isValid: boolean;
}
interface GCodeMetadata {
    thumbnails: Record<string, Thumbnail>;
    estimatedTime: number | null;
    filamentLength: number | null;
    filamentLengths: number[];
    layerHeight: number | null;
    slicerName?: string;
    slicerVersion?: string;
}
interface GCodeState {
    x: number;
    y: number;
    z: number;
    e: number;
    f: number;
    tool: number;
    units: 'mm' | 'in';
    absolutePositioning: boolean;
    absoluteExtrusion: boolean;
}
interface GCodePath {
    vertices: number[];
    pathType: PathType;
    tool: number;
    extrusionWidth: number;
    lineHeight: number;
    isExtrusion: boolean;
}
interface GCodeLayer {
    index: number;
    zHeight: number;
    paths: GCodePath[];
}
interface BoundingBox {
    min: THREE.Vector3;
    max: THREE.Vector3;
}
interface ParseResult {
    layers: GCodeLayer[];
    metadata: GCodeMetadata;
    boundingBox: BoundingBox;
}
declare class GCodeParser {
    private state;
    private metadata;
    private layers;
    private currentLayer;
    private currentPath;
    private boundingBox;
    private arcSegmentsPerMm;
    private detectedPathType;
    constructor();
    private createInitialState;
    private createInitialMetadata;
    /**
     * Parse G-code text and return layers and metadata
     */
    parse(gcodeText: string): ParseResult;
    private reset;
    private parseMetadata;
    private parseDurationMatch;
    private parseMetadataLine;
    private parseLine;
    private parseCommand;
    private executeCommand;
    private handleLinearMove;
    /**
     * Handle G2/G3 arc moves
     */
    private handleArcMove;
    private handleHoming;
    private handleSetPosition;
    private handleToolChange;
    private startNewLayer;
    private startNewPath;
    private finalizePath;
    private parsePathTypeFromComment;
    private mapPathType;
    private updateBoundingBox;
}

/**
 * GCode Renderer - Renders parsed G-code as Three.js objects
 * Supports lines and tube rendering, multi-color, and path type coloring
 *
 * Uses merged geometry per color per layer to eliminate z-fighting
 */

interface RenderOptions {
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
interface RenderedLayer {
    index: number;
    zHeight: number;
    object: THREE.Group;
    visible: boolean;
    extrusionLines: THREE.Object3D[];
    travelLines: THREE.Object3D[];
}
declare class GCodeRenderer {
    private options;
    private lineMaterials;
    private tubeMaterials;
    constructor(options?: RenderOptions);
    /**
     * Render layers to Three.js objects
     * Uses single merged mesh per color per layer to eliminate z-fighting
     */
    render(layers: GCodeLayer[], boundingBox: BoundingBox): RenderedLayer[];
    /**
     * Create a Line2 object for a path
     */
    private createLine;
    /**
     * Get or create a line material for a color
     */
    private getLineMaterial;
    /**
     * Get or create a tube material for a color
     */
    private getTubeMaterial;
    /**
     * Determine color for a path based on color scheme
     */
    private getPathColor;
    /**
     * Update line material resolution (call on window resize)
     */
    updateResolution(width: number, height: number): void;
    /**
     * Update line width
     */
    setLineWidth(width: number): void;
    /**
     * Dispose all materials
     */
    dispose(): void;
}

/**
 * ExtrusionGeometry - Creates 3D tube geometry from a path of points
 * Creates a continuous tube mesh without per-segment end caps to prevent z-fighting
 *
 * This implementation creates one ring of vertices per point and connects them with faces,
 * similar to TubeGeometry but optimized for 3D printing toolpaths.
 */

interface ExtrusionGeometryParameters {
    points: Vector3[];
    lineWidth: number;
    lineHeight: number;
    radialSegments: number;
    closed: boolean;
}
declare class ExtrusionGeometry extends BufferGeometry {
    parameters: ExtrusionGeometryParameters;
    readonly type = "ExtrusionGeometry";
    constructor(points?: Vector3[], lineWidth?: number, lineHeight?: number, radialSegments?: number);
}

/**
 * Parse path type from G-code comment
 */
declare function parsePathType(comment: string): PathType$1 | null;
/**
 * Parse print info from G-code header comments
 */
declare function parsePrintInfoFromLine(line: string, currentInfo: {
    estimatedTime: number | null;
    filamentLength: number | null;
    layerHeight: number | null;
}): {
    estimatedTime: number | null;
    filamentLength: number | null;
    layerHeight: number | null;
};

/**
 * Branding information for Polar3D G-Code Viewer
 *
 * IMPORTANT: Per the license agreement, this branding MUST be displayed
 * in a visible location when using this package. Removal or hiding of
 * this branding is a violation of the license terms.
 */
interface BrandingInfo {
    text: string;
    url: string;
    html: string;
    required: boolean;
}
/**
 * Check if current domain is whitelisted (Polar3D owned)
 */
declare function isWhitelistedDomain(): boolean;
/**
 * Get the required branding information
 */
declare function getBranding(): BrandingInfo;
/**
 * Create a branding DOM element - automatically injected for non-whitelisted domains
 */
declare function createBrandingElement(options?: {
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    className?: string;
}): HTMLElement;
/**
 * Inject branding into a container element (called automatically by GCodeViewer)
 * Only injects if not on a whitelisted domain
 */
declare function injectBranding(container: HTMLElement): HTMLElement | null;
/**
 * CSS styles for the branding element (for manual styling)
 */
declare const BRANDING_CSS = "\n.polar3d-branding {\n  position: absolute;\n  bottom: 8px;\n  left: 8px;\n  z-index: 1000;\n  padding: 4px 8px;\n  background: rgba(0, 0, 0, 0.7);\n  border-radius: 4px;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n}\n\n.polar3d-branding a {\n  color: #38bdf8;\n  text-decoration: none;\n  font-size: 11px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n\n.polar3d-branding a:hover {\n  color: #7dd3fc;\n}\n";

export { BRANDING_CSS, type BoundingBox, type BrandingInfo, COLOR_THEMES, type ColorTheme, type CustomColors, ExtrusionGeometry, type ExtrusionGeometryParameters, type FilamentUsage, type GCodeCommand, type GCodeLayer, type GCodeMetadata, type GCodeParameters, GCodeParser, type GCodePath, type GCodePrintInfo, GCodeRenderer, type GCodeState, GCodeViewer, type GCodeViewerOptions, type LayerData, PATH_TYPE_COLORS, type ParseResult, type PathType, type RenderOptions, type RenderedLayer, type Thumbnail, type ParseResult$1 as ViewerParseResult, WHITELISTED_DOMAINS, createBrandingElement, getBranding, injectBranding, isWhitelistedDomain, parsePathType, parsePrintInfoFromLine };
