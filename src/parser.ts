import { PathType } from './types';

/**
 * Parse path type from G-code comment
 */
export function parsePathType(comment: string): PathType | null {
  const lowerComment = comment.toLowerCase().trim();

  // PrusaSlicer / SuperSlicer / BambuSlicer / OrcaSlicer style
  // Format: ;TYPE:External perimeter or ; TYPE:Solid infill
  if (lowerComment.includes('type:')) {
    const typeMatch = lowerComment.match(/type:\s*(.+?)(?:$|;)/);
    if (typeMatch) {
      const type = typeMatch[1].trim().toLowerCase();
      // Check specific types first (more specific before less specific)
      if (type === 'external perimeter' || type === 'outer wall' || type.includes('external'))
        return 'outer_perimeter';
      if (type === 'perimeter' || type === 'inner wall' || type.includes('inner'))
        return 'inner_perimeter';
      if (type === 'overhang perimeter') return 'outer_perimeter';
      if (type === 'top solid infill' || type === 'top surface') return 'top_solid_infill';
      if (type === 'bottom solid infill' || type === 'bottom surface') return 'bottom_solid_infill';
      if (type === 'solid infill' || type === 'solid layer') return 'solid_infill';
      if (type === 'sparse infill' || type === 'infill' || type === 'internal infill')
        return 'infill';
      if (type === 'bridge infill' || type === 'bridge' || type.includes('bridge')) return 'bridge';
      if (type === 'skirt' || type === 'skirt/brim') return 'skirt';
      if (type === 'brim') return 'brim';
      if (type === 'support interface' || type === 'support-interface') return 'support_interface';
      if (type === 'support material' || type === 'support' || type.includes('support'))
        return 'support';
      if (type === 'prime tower' || type === 'wipe tower' || type.includes('tower'))
        return 'prime_tower';
      if (type === 'gap fill') return 'inner_perimeter';
      if (type === 'ironing') return 'top_solid_infill';
      // Fallback for wall types
      if (type.includes('wall') || type.includes('perimeter')) return 'inner_perimeter';
      if (type.includes('fill') || type.includes('infill')) return 'infill';
    }
  }

  // Cura style comments
  // Format: ;TYPE:WALL-OUTER or ;TYPE:FILL
  if (lowerComment.startsWith('type:')) {
    const type = lowerComment.substring(5).trim();
    if (type === 'wall-outer') return 'outer_perimeter';
    if (type === 'wall-inner') return 'inner_perimeter';
    if (type === 'skin') return 'solid_infill';
    if (type === 'fill') return 'infill';
    if (type === 'skirt') return 'skirt';
    if (type === 'support') return 'support';
    if (type === 'support-interface') return 'support_interface';
    if (type === 'prime-tower') return 'prime_tower';
  }

  // Skip mesh/layer markers
  if (lowerComment.includes('mesh:') || lowerComment.match(/^layer:\d+/)) return null;

  // Additional Cura/other style without TYPE: prefix
  if (lowerComment.includes('wall-outer') || lowerComment.includes('outer wall'))
    return 'outer_perimeter';
  if (lowerComment.includes('wall-inner') || lowerComment.includes('inner wall'))
    return 'inner_perimeter';
  if (lowerComment.includes('skin') || lowerComment.includes('top/bottom')) return 'solid_infill';
  if (lowerComment === 'infill' || lowerComment.includes(' infill')) return 'infill';
  if (lowerComment.includes('skirt')) return 'skirt';
  if (lowerComment.includes('brim')) return 'brim';
  if (lowerComment.includes('support-interface')) return 'support_interface';
  if (lowerComment.includes('support')) return 'support';
  if (lowerComment.includes('prime-tower')) return 'prime_tower';

  // Simplify3D style
  // Format: ; perimeter or ; solid layer
  if (lowerComment === 'outer perimeter' || lowerComment.includes('outer perimeter'))
    return 'outer_perimeter';
  if (lowerComment === 'inner perimeter' || lowerComment === 'perimeter') return 'inner_perimeter';
  if (lowerComment === 'solid layer' || lowerComment.includes('solid layer')) return 'solid_infill';
  if (lowerComment === 'bridge' || lowerComment.includes('bridge')) return 'bridge';

  // IdeaMaker style
  if (lowerComment.includes('path type:')) {
    if (lowerComment.includes('outer')) return 'outer_perimeter';
    if (lowerComment.includes('inner')) return 'inner_perimeter';
    if (lowerComment.includes('fill')) return 'infill';
  }

  return null;
}

/**
 * Parse print info from G-code header comments
 */
export function parsePrintInfoFromLine(
  line: string,
  currentInfo: {
    estimatedTime: number | null;
    filamentLength: number | null;
    layerHeight: number | null;
  }
): {
  estimatedTime: number | null;
  filamentLength: number | null;
  layerHeight: number | null;
} {
  const lowerLine = line.toLowerCase();
  let { estimatedTime, filamentLength, layerHeight } = currentInfo;

  // Time estimates (various slicer formats)
  if (lowerLine.includes('time') || lowerLine.includes('estimated')) {
    // Format: ; estimated printing time = 1h 23m 45s
    const timeMatch = line.match(/(\d+)\s*h\s*(\d+)\s*m(?:\s*(\d+)\s*s)?/i);
    if (timeMatch) {
      estimatedTime =
        parseInt(timeMatch[1]) * 3600 +
        parseInt(timeMatch[2]) * 60 +
        (parseInt(timeMatch[3]) || 0);
    }
    // Format: ;TIME:1234 (seconds)
    const timeSecsMatch = line.match(/;TIME[:\s]*(\d+)/i);
    if (timeSecsMatch) {
      estimatedTime = parseInt(timeSecsMatch[1]);
    }
  }

  // Filament usage
  if (
    lowerLine.includes('filament') &&
    (lowerLine.includes('used') || lowerLine.includes('length') || lowerLine.includes('mm'))
  ) {
    // Format: ; filament used [mm] = 1234.56
    const filamentMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:mm|m\b)/i);
    if (filamentMatch) {
      let length = parseFloat(filamentMatch[1]);
      if (line.toLowerCase().includes(' m') && !line.toLowerCase().includes('mm')) {
        length *= 1000; // Convert m to mm
      }
      filamentLength = length;
    }
  }

  // Layer height
  if (lowerLine.includes('layer_height') || lowerLine.includes('layer height')) {
    const heightMatch = line.match(/(\d+(?:\.\d+)?)/);
    if (heightMatch) {
      const height = parseFloat(heightMatch[1]);
      if (height > 0 && height < 1) {
        // Reasonable layer height
        layerHeight = height;
      }
    }
  }

  return { estimatedTime, filamentLength, layerHeight };
}
