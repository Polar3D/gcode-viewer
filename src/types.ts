/**
 * @polar3d/gcode-viewer
 * A Three.js-based G-code viewer with layer-by-layer visualization
 */

// Path types that can be identified in G-code
export type PathType =
  | 'outer_perimeter'
  | 'inner_perimeter'
  | 'infill'
  | 'solid_infill'
  | 'top_solid_infill'
  | 'bottom_solid_infill'
  | 'bridge'
  | 'skirt'
  | 'brim'
  | 'support'
  | 'support_interface'
  | 'prime_tower'
  | 'wipe_tower'
  | 'travel'
  | 'unknown';

// Colors for each path type
export const PATH_TYPE_COLORS: Record<PathType, string> = {
  outer_perimeter: '#00CED1', // Cyan/Teal
  inner_perimeter: '#32CD32', // Lime Green
  infill: '#FFA500', // Orange
  solid_infill: '#FF6B6B', // Coral/Red
  top_solid_infill: '#FF6B6B', // Same as solid
  bottom_solid_infill: '#FF6B6B', // Same as solid
  bridge: '#40E0D0', // Turquoise
  skirt: '#6495ED', // Cornflower Blue
  brim: '#6495ED', // Same as skirt
  support: '#DDA0DD', // Plum
  support_interface: '#DA70D6', // Orchid
  prime_tower: '#B8860B', // Dark Goldenrod
  wipe_tower: '#B8860B', // Same as prime tower
  travel: '#888888', // Gray
  unknown: '#E8E8E8', // Light gray (User Sequence)
};

export interface GCodeLayer {
  index: number;
  zHeight: number;
  visible: boolean;
}

export interface FilamentUsage {
  index: number;
  length: number; // in mm
  color?: string;
}

export interface GCodePrintInfo {
  size: { x: number; y: number; z: number } | null;
  estimatedTime: number | null; // in seconds
  filamentLength: number | null; // in mm
  filaments: FilamentUsage[];
  layerCount: number;
  layerHeight: number | null;
  pathTypes: PathType[];
}

export interface GCodeViewerOptions {
  /** Line width for extruded paths in world units/mm (default: 0.45, typical nozzle width) */
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

/** Internal type for resolved options */
export interface ResolvedGCodeViewerOptions {
  lineWidth: number;
  hidePurgeLines: boolean;
  colorScheme: 'pathType' | 'height';
  showTravelMoves: boolean;
  container?: HTMLElement;
}

export interface ParseResult {
  /** The Three.js group containing all layer objects */
  object: import('three').Group;
  /** Information extracted from the G-code */
  printInfo: GCodePrintInfo;
  /** Array of layer data */
  layers: LayerData[];
}

export interface LayerData {
  index: number;
  zHeight: number;
  object: import('three').Group;
  visible: boolean;
}

/** Domains where branding is not required (Polar3D owned properties) */
export const WHITELISTED_DOMAINS = [
  'polar3d.com',
  'www.polar3d.com',
];
