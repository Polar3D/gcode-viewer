// Main export
export { GCodeViewer } from './GCodeViewer';

// Types
export {
  PathType,
  PATH_TYPE_COLORS,
  GCodeLayer,
  FilamentUsage,
  GCodePrintInfo,
  GCodeViewerOptions,
  ParseResult,
  LayerData,
  WHITELISTED_DOMAINS,
} from './types';

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
