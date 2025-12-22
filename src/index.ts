// Main export - integrated viewer
export { GCodeViewer } from './GCodeViewer';

// Standalone Parser & Renderer (for advanced usage with Angular services, etc.)
export { GCodeParser } from './GCodeParser';
export type {
  PathType,
  GCodeCommand,
  GCodeParameters,
  Thumbnail,
  GCodeMetadata,
  GCodeState,
  GCodePath,
  GCodeLayer,
  BoundingBox,
  ParseResult,
} from './GCodeParser';
export { PATH_TYPE_COLORS } from './GCodeParser';

export { GCodeRenderer } from './GCodeRenderer';
export type { RenderOptions, RenderedLayer } from './GCodeRenderer';

// Geometry (for advanced usage)
export { ExtrusionGeometry } from './ExtrusionGeometry';
export type { ExtrusionGeometryParameters } from './ExtrusionGeometry';

// Types from integrated viewer
export type {
  GCodeViewerOptions,
  CustomColors,
  ColorTheme,
} from './types';
export { COLOR_THEMES } from './types';

// Legacy types (for backward compatibility)
export type {
  FilamentUsage,
  GCodePrintInfo,
  ParseResult as ViewerParseResult,
  LayerData,
} from './types';
export { WHITELISTED_DOMAINS } from './types';

// Parser utilities (for advanced usage)
export { parsePathType, parsePrintInfoFromLine } from './parser';

// Branding (REQUIRED per LICENSE for non-whitelisted domains)
export {
  getBranding,
  createBrandingElement,
  injectBranding,
  isWhitelistedDomain,
  BRANDING_CSS,
} from './branding';
export type { BrandingInfo } from './branding';
