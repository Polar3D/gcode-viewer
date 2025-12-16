import * as three from 'three';

/**
 * @polar3d/gcode-viewer
 * A Three.js-based G-code viewer with layer-by-layer visualization
 */
type PathType = 'outer_perimeter' | 'inner_perimeter' | 'infill' | 'solid_infill' | 'top_solid_infill' | 'bottom_solid_infill' | 'bridge' | 'skirt' | 'brim' | 'support' | 'support_interface' | 'prime_tower' | 'wipe_tower' | 'travel' | 'unknown';
declare const PATH_TYPE_COLORS: Record<PathType, string>;
interface GCodeLayer {
    index: number;
    zHeight: number;
    visible: boolean;
}
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
    pathTypes: PathType[];
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
}
interface ParseResult {
    /** The Three.js group containing all layer objects */
    object: three.Group;
    /** Information extracted from the G-code */
    printInfo: GCodePrintInfo;
    /** Array of layer data */
    layers: LayerData[];
}
interface LayerData {
    index: number;
    zHeight: number;
    object: three.Group;
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
    parse(gcodeText: string): ParseResult;
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
    setPathTypeFilter(pathType: PathType | null): void;
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
     * Update line material resolution (call on window resize)
     */
    updateResolution(width: number, height: number): void;
}

/**
 * Parse path type from G-code comment
 */
declare function parsePathType(comment: string): PathType | null;
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

export { BRANDING_CSS, type BrandingInfo, type FilamentUsage, type GCodeLayer, type GCodePrintInfo, GCodeViewer, type GCodeViewerOptions, type LayerData, PATH_TYPE_COLORS, type ParseResult, type PathType, WHITELISTED_DOMAINS, createBrandingElement, getBranding, injectBranding, isWhitelistedDomain, parsePathType, parsePrintInfoFromLine };
