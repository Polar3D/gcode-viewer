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

// Default colors for each path type
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

/** Custom colors for path types - used for color themes */
export type CustomColors = Partial<Record<PathType, string>>;

/** Pre-defined color themes */
export interface ColorTheme {
  id: string;
  name: string;
  colors: CustomColors;
}

/** Built-in color themes */
export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'default',
    name: 'Default',
    colors: {} // Uses PATH_TYPE_COLORS
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      outer_perimeter: '#006994',
      inner_perimeter: '#40E0D0',
      infill: '#5F9EA0',
      solid_infill: '#20B2AA',
      top_solid_infill: '#48D1CC',
      bottom_solid_infill: '#008B8B',
      bridge: '#00CED1',
      skirt: '#87CEEB',
      brim: '#87CEEB',
      support: '#B0C4DE',
      support_interface: '#ADD8E6',
      prime_tower: '#4682B4',
      wipe_tower: '#4682B4',
      travel: '#1E90FF',
      unknown: '#E0FFFF'
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      outer_perimeter: '#228B22',
      inner_perimeter: '#32CD32',
      infill: '#8FBC8F',
      solid_infill: '#2E8B57',
      top_solid_infill: '#00FA9A',
      bottom_solid_infill: '#006400',
      bridge: '#9ACD32',
      skirt: '#6B8E23',
      brim: '#6B8E23',
      support: '#8B4513',
      support_interface: '#A0522D',
      prime_tower: '#556B2F',
      wipe_tower: '#556B2F',
      travel: '#90EE90',
      unknown: '#F0FFF0'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      outer_perimeter: '#FF4500',
      inner_perimeter: '#FF6347',
      infill: '#FF8C00',
      solid_infill: '#DC143C',
      top_solid_infill: '#FF69B4',
      bottom_solid_infill: '#8B0000',
      bridge: '#FFD700',
      skirt: '#FFA07A',
      brim: '#FFA07A',
      support: '#DDA0DD',
      support_interface: '#EE82EE',
      prime_tower: '#CD853F',
      wipe_tower: '#CD853F',
      travel: '#FF1493',
      unknown: '#FFF0F5'
    }
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: {
      outer_perimeter: '#333333',
      inner_perimeter: '#555555',
      infill: '#777777',
      solid_infill: '#444444',
      top_solid_infill: '#666666',
      bottom_solid_infill: '#222222',
      bridge: '#888888',
      skirt: '#999999',
      brim: '#999999',
      support: '#AAAAAA',
      support_interface: '#BBBBBB',
      prime_tower: '#505050',
      wipe_tower: '#505050',
      travel: '#CCCCCC',
      unknown: '#DDDDDD'
    }
  }
];

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

/** Internal type for resolved options */
export interface ResolvedGCodeViewerOptions {
  lineWidth: number;
  hidePurgeLines: boolean;
  colorScheme: 'pathType' | 'height';
  showTravelMoves: boolean;
  container?: HTMLElement;
  renderTubes: boolean;
  extrusionWidth: number;
  lineHeight: number;
  radialSegments: number;
  customColors?: CustomColors;
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
