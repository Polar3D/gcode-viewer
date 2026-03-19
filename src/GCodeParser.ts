/**
 * G-code Parser with G2/G3 arc support, multi-color support, and thumbnail extraction
 * Based on gcode-preview library concepts
 */
import * as THREE from 'three';

// ============================================================================
// Types and Interfaces
// ============================================================================

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

export const PATH_TYPE_COLORS: Record<PathType, string> = {
    'outer_perimeter': '#00d4d4',      // Cyan
    'inner_perimeter': '#00cc66',      // Green
    'infill': '#ff8c00',               // Orange
    'solid_infill': '#ff4444',         // Red
    'top_solid_infill': '#ff69b4',     // Pink
    'bottom_solid_infill': '#9932cc',  // Purple
    'bridge': '#ffd700',               // Gold
    'skirt': '#87ceeb',                // Sky Blue
    'brim': '#87ceeb',                 // Sky Blue
    'support': '#a0a0a0',              // Gray
    'support_interface': '#c0c0c0',    // Light Gray
    'prime_tower': '#8b4513',          // Brown
    'wipe_tower': '#8b4513',           // Brown
    'travel': '#ff0000',               // Red (usually hidden)
    'unknown': '#ffffff'               // White
};

export interface GCodeCommand {
    src: string;
    gcode: string;
    params: GCodeParameters;
    comment?: string;
}

export interface GCodeParameters {
    x?: number;
    y?: number;
    z?: number;
    e?: number;
    f?: number;
    i?: number;  // Arc center X offset
    j?: number;  // Arc center Y offset
    r?: number;  // Arc radius
    t?: number;  // Tool number
    [key: string]: number | undefined;
}

export interface Thumbnail {
    size: string;
    width: number;
    height: number;
    chars: string;
    charLength: number;
    src: string;
    isValid: boolean;
}

export interface GCodeMetadata {
    thumbnails: Record<string, Thumbnail>;
    estimatedTime: number | null;
    filamentLength: number | null;
    filamentLengths: number[];  // Per-tool filament usage
    layerHeight: number | null;
    slicerName?: string;
    slicerVersion?: string;
}

export interface GCodeState {
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

export interface GCodePath {
    vertices: number[];
    pathType: PathType;
    tool: number;
    extrusionWidth: number;
    lineHeight: number;
    isExtrusion: boolean;
}

export interface GCodeLayer {
    index: number;
    zHeight: number;
    paths: GCodePath[];
}

export interface BoundingBox {
    min: THREE.Vector3;
    max: THREE.Vector3;
}

export interface ParseResult {
    layers: GCodeLayer[];
    metadata: GCodeMetadata;
    boundingBox: BoundingBox;
}

// ============================================================================
// G-code Parser
// ============================================================================

export class GCodeParser {
    private state: GCodeState;
    private metadata: GCodeMetadata;
    private layers: GCodeLayer[] = [];
    private currentLayer: GCodeLayer | null = null;
    private currentPath: GCodePath | null = null;
    private boundingBox: BoundingBox = {
        min: new THREE.Vector3(Infinity, Infinity, Infinity),
        max: new THREE.Vector3(-Infinity, -Infinity, -Infinity)
    };

    // Arc interpolation settings
    private arcSegmentsPerMm = 2;  // Number of segments per mm of arc

    // Current detected path type from comments (;TYPE:... etc.)
    private detectedPathType: PathType = 'unknown';

    constructor() {
        this.state = this.createInitialState();
        this.metadata = this.createInitialMetadata();
    }

    private createInitialState(): GCodeState {
        return {
            x: 0, y: 0, z: 0, e: 0, f: 1000,
            tool: 0,
            units: 'mm',
            absolutePositioning: true,
            absoluteExtrusion: true
        };
    }

    private createInitialMetadata(): GCodeMetadata {
        return {
            thumbnails: {},
            estimatedTime: null,
            filamentLength: null,
            filamentLengths: [],
            layerHeight: null
        };
    }

    /**
     * Parse G-code text and return layers and metadata
     */
    parse(gcodeText: string): ParseResult {
        this.reset();
        const lines = gcodeText.split('\n');

        // First pass: extract metadata and thumbnails
        this.parseMetadata(lines);

        // Second pass: parse commands
        for (const line of lines) {
            this.parseLine(line);
        }

        // Finalize current layer
        if (this.currentLayer && this.currentLayer.paths.length > 0) {
            this.layers.push(this.currentLayer);
        }

        return {
            layers: this.layers,
            metadata: this.metadata,
            boundingBox: this.boundingBox
        };
    }

    private reset(): void {
        this.state = this.createInitialState();
        this.metadata = this.createInitialMetadata();
        this.layers = [];
        this.currentLayer = null;
        this.currentPath = null;
        this.detectedPathType = 'unknown';
        this.boundingBox = {
            min: new THREE.Vector3(Infinity, Infinity, Infinity),
            max: new THREE.Vector3(-Infinity, -Infinity, -Infinity)
        };
    }

    // ============================================================================
    // Metadata & Thumbnail Parsing
    // ============================================================================

    private parseMetadata(lines: string[]): void {
        let currentThumbnail: Thumbnail | null = null;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith(';')) continue;

            const comment = trimmed.substring(1).trim();

            // Check for thumbnail begin
            const thumbBeginMatch = comment.match(/thumbnail begin (\d+)x(\d+) (\d+)/);
            if (thumbBeginMatch) {
                const [, width, height, charLength] = thumbBeginMatch;
                currentThumbnail = {
                    size: `${width}x${height}`,
                    width: parseInt(width, 10),
                    height: parseInt(height, 10),
                    charLength: parseInt(charLength, 10),
                    chars: '',
                    src: '',
                    isValid: false
                };
                continue;
            }

            // Check for thumbnail end
            if (comment.includes('thumbnail end') && currentThumbnail) {
                // Validate and store thumbnail
                const base64regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
                currentThumbnail.isValid =
                    currentThumbnail.chars.length === currentThumbnail.charLength &&
                    base64regex.test(currentThumbnail.chars);

                if (currentThumbnail.isValid) {
                    currentThumbnail.src = `data:image/png;base64,${currentThumbnail.chars}`;
                    this.metadata.thumbnails[currentThumbnail.size] = currentThumbnail;
                }
                currentThumbnail = null;
                continue;
            }

            // Accumulate thumbnail data
            if (currentThumbnail) {
                currentThumbnail.chars += comment.trim();
                continue;
            }

            // Parse other metadata
            this.parseMetadataLine(comment);
        }
    }

    private parseDurationMatch(match: RegExpMatchArray | null): number | null {
        if (!match) {
            return null;
        }
        const days = parseInt(match[1] || '0', 10);
        const hours = parseInt(match[2] || '0', 10);
        const minutes = parseInt(match[3] || '0', 10);
        const seconds = parseInt(match[4] || '0', 10);
        const total = days * 86400 + hours * 3600 + minutes * 60 + seconds;
        return total > 0 ? total : null;
    }

    private parseMetadataLine(comment: string): void {
        const lowerComment = comment.toLowerCase();

        // Estimated time (multiple formats)
        // Bambu Studio / OrcaSlicer: "estimated printing time (normal mode) = 6h 54m 12s" or "= 54m 12s" or "= 6h 54m"
        // Bambu Studio (Bambu printers): "model printing time: 4h 10m 49s" or "total estimated time: 6h 55m 0s"
        // Cura: "TIME:24852"
        // PrusaSlicer: "estimated printing time = 6h 54m 12s"
        if (!this.metadata.estimatedTime) {
            // Pattern for h/m/s with optional components (handles Bambu, Prusa, OrcaSlicer)
            const hmsMatch = comment.match(/(?:estimated printing time|model printing time|total estimated time)[^=:]*[=:]\s*(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i);
            const hmsTotal = this.parseDurationMatch(hmsMatch);
            if (hmsTotal !== null) {
                this.metadata.estimatedTime = hmsTotal;
            }

            // Cura format: "TIME:24852" (raw seconds)
            if (!this.metadata.estimatedTime) {
                const timeMatch = comment.match(/TIME:(\d+)/i);
                if (timeMatch) {
                    this.metadata.estimatedTime = parseInt(timeMatch[1]);
                }
            }

            // Generic "print time" format
            if (!this.metadata.estimatedTime) {
                const printTimeMatch = comment.match(/print time[^:]*:\s*(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i);
                const printTimeTotal = this.parseDurationMatch(printTimeMatch);
                if (printTimeTotal !== null) {
                    this.metadata.estimatedTime = printTimeTotal;
                }
            }
        }

        // Filament usage
        const filamentMatch = comment.match(/filament used[^=]*=\s*([\d.]+)\s*m/i);
        if (filamentMatch) {
            this.metadata.filamentLength = parseFloat(filamentMatch[1]) * 1000; // Convert m to mm
        }

        // Layer height
        const layerHeightMatch = comment.match(/layer_height\s*=\s*([\d.]+)/i);
        if (layerHeightMatch) {
            this.metadata.layerHeight = parseFloat(layerHeightMatch[1]);
        }

        // Slicer info
        if (lowerComment.includes('prusaslicer') || lowerComment.includes('slic3r')) {
            const versionMatch = comment.match(/(PrusaSlicer|Slic3r)[^\d]*([\d.]+)/i);
            if (versionMatch) {
                this.metadata.slicerName = versionMatch[1];
                this.metadata.slicerVersion = versionMatch[2];
            }
        } else if (lowerComment.includes('cura')) {
            const versionMatch = comment.match(/Cura[^\d]*([\d.]+)/i);
            if (versionMatch) {
                this.metadata.slicerName = 'Cura';
                this.metadata.slicerVersion = versionMatch[1];
            }
        } else if (lowerComment.includes('orcaslicer')) {
            const versionMatch = comment.match(/OrcaSlicer[^\d]*([\d.]+)/i);
            if (versionMatch) {
                this.metadata.slicerName = 'OrcaSlicer';
                this.metadata.slicerVersion = versionMatch[1];
            }
        } else if (lowerComment.includes('bambustudio')) {
            const versionMatch = comment.match(/BambuStudio[^\d]*([\d.]+)/i);
            if (versionMatch) {
                this.metadata.slicerName = 'BambuStudio';
                this.metadata.slicerVersion = versionMatch[1];
            }
        }
    }

    // ============================================================================
    // Command Parsing
    // ============================================================================

    private parseLine(line: string): void {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(';')) {
            // Check for path type change in comments
            if (trimmed.startsWith(';')) {
                const pathType = this.parsePathTypeFromComment(trimmed.substring(1));
                if (pathType && pathType !== 'travel') {
                    this.detectedPathType = pathType;
                }
            }
            return;
        }

        const cmd = this.parseCommand(trimmed);
        if (!cmd) return;

        this.executeCommand(cmd);
    }

    private parseCommand(line: string): GCodeCommand | null {
        const parts = line.split(';');
        const cmdPart = parts[0].trim();
        const comment = parts[1]?.trim();

        if (!cmdPart) return null;

        // Parse command and parameters
        const tokens = cmdPart.split(/\s+/);
        const gcodeMatch = tokens[0].match(/([A-Za-z])(\d+\.?\d*)/);
        if (!gcodeMatch) return null;

        const gcode = `${gcodeMatch[1].toLowerCase()}${parseFloat(gcodeMatch[2])}`;
        const params: GCodeParameters = {};

        for (let i = 1; i < tokens.length; i++) {
            const paramMatch = tokens[i].match(/([A-Za-z])([-\d.]+)/);
            if (paramMatch) {
                params[paramMatch[1].toLowerCase()] = parseFloat(paramMatch[2]);
            }
        }

        return { src: line, gcode, params, comment };
    }

    private executeCommand(cmd: GCodeCommand): void {
        const { gcode, params, comment } = cmd;

        // Check for path type in inline comment
        if (comment) {
            const pathType = this.parsePathTypeFromComment(comment);
            if (pathType && pathType !== 'travel') {
                this.detectedPathType = pathType;
            }
        }

        switch (gcode) {
            case 'g0':
            case 'g1':
                this.handleLinearMove(params);
                break;
            case 'g2':
                this.handleArcMove(params, true);  // Clockwise
                break;
            case 'g3':
                this.handleArcMove(params, false); // Counter-clockwise
                break;
            case 'g20':
                this.state.units = 'in';
                break;
            case 'g21':
                this.state.units = 'mm';
                break;
            case 'g28':
                this.handleHoming(params);
                break;
            case 'g90':
                this.state.absolutePositioning = true;
                break;
            case 'g91':
                this.state.absolutePositioning = false;
                break;
            case 'g92':
                this.handleSetPosition(params);
                break;
            case 't0': case 't1': case 't2': case 't3':
            case 't4': case 't5': case 't6': case 't7':
                this.handleToolChange(parseInt(gcode.substring(1)));
                break;
            case 'm82':
                this.state.absoluteExtrusion = true;
                break;
            case 'm83':
                this.state.absoluteExtrusion = false;
                break;
        }
    }

    // ============================================================================
    // Move Handlers
    // ============================================================================

    private handleLinearMove(params: GCodeParameters): void {
        const { state } = this;

        // Calculate target position
        let x = params.x ?? state.x;
        let y = params.y ?? state.y;
        let z = params.z ?? state.z;

        if (!state.absolutePositioning) {
            x = state.x + (params.x ?? 0);
            y = state.y + (params.y ?? 0);
            z = state.z + (params.z ?? 0);
        }

        // Handle feedrate
        if (params.f !== undefined) {
            state.f = params.f;
        }

        // Check for Z change (layer change)
        if (z !== state.z && z > state.z) {
            this.startNewLayer(z);
        }

        // Determine if this is an extrusion move
        const isExtrusion = params.e !== undefined && params.e > 0;

        // Add point to current path
        const existingPath = this.currentPath;
        if (existingPath) {
            const shouldStartNewPath = existingPath.isExtrusion !== isExtrusion ||
                (isExtrusion && this.detectedPathType !== 'unknown' && existingPath.pathType !== this.detectedPathType);

            if (shouldStartNewPath) {
                const pathType = isExtrusion ? this.detectedPathType : 'travel';
                this.startNewPath(pathType, isExtrusion);
                if (this.currentPath) {
                    this.currentPath.vertices.push(state.x, state.y, state.z);
                    this.currentPath.vertices.push(x, y, z);
                    if (isExtrusion) {
                        this.updateBoundingBox(x, y, z);
                    }
                }
            } else {
                if (existingPath.vertices.length === 0) {
                    existingPath.vertices.push(state.x, state.y, state.z);
                }
                existingPath.vertices.push(x, y, z);
                if (isExtrusion) {
                    this.updateBoundingBox(x, y, z);
                }
            }
        } else {
            const pathType = isExtrusion ? this.detectedPathType : 'travel';
            this.startNewPath(pathType, isExtrusion);
            if (this.currentPath) {
                this.currentPath.vertices.push(state.x, state.y, state.z);
                this.currentPath.vertices.push(x, y, z);
                if (isExtrusion) {
                    this.updateBoundingBox(x, y, z);
                }
            }
        }

        // Update state
        state.x = x;
        state.y = y;
        state.z = z;
        if (params.e !== undefined) {
            state.e = state.absoluteExtrusion ? params.e : state.e + params.e;
        }
    }

    /**
     * Handle G2/G3 arc moves
     */
    private handleArcMove(params: GCodeParameters, clockwise: boolean): void {
        const { state } = this;

        let x = params.x ?? state.x;
        let y = params.y ?? state.y;
        let z = params.z ?? state.z;
        let { i, j, r } = params;

        const isExtrusion = params.e !== undefined && params.e > 0;

        const shouldStartNewPath = !this.currentPath ||
            this.currentPath.isExtrusion !== isExtrusion ||
            (isExtrusion && this.detectedPathType !== 'unknown' && this.currentPath.pathType !== this.detectedPathType);

        if (shouldStartNewPath) {
            const pathType = isExtrusion ? this.detectedPathType : 'travel';
            this.startNewPath(pathType, isExtrusion);
        }

        // Handle radius mode (R parameter)
        if (r !== undefined) {
            const deltaX = x - state.x;
            const deltaY = y - state.y;

            const minR = Math.sqrt(Math.pow(deltaX / 2, 2) + Math.pow(deltaY / 2, 2));
            r = Math.max(Math.abs(r), minR);

            const dSquared = Math.pow(deltaX, 2) + Math.pow(deltaY, 2);
            const hSquared = Math.pow(r, 2) - dSquared / 4;
            let hDivD = Math.sqrt(Math.max(0, hSquared / dSquared));

            if ((clockwise && r < 0) || (!clockwise && r > 0)) {
                hDivD = -hDivD;
            }

            i = deltaX / 2 + deltaY * hDivD;
            j = deltaY / 2 - deltaX * hDivD;
        }

        i = i ?? 0;
        j = j ?? 0;

        const wholeCircle = state.x === x && state.y === y;
        const centerX = state.x + i;
        const centerY = state.y + j;

        const arcRadius = Math.sqrt(i * i + j * j);
        const arcCurrentAngle = Math.atan2(-j, -i);
        const finalTheta = Math.atan2(y - centerY, x - centerX);

        let totalArc: number;
        if (wholeCircle) {
            totalArc = 2 * Math.PI;
        } else {
            totalArc = clockwise
                ? arcCurrentAngle - finalTheta
                : finalTheta - arcCurrentAngle;
            if (totalArc < 0) {
                totalArc += 2 * Math.PI;
            }
        }

        let totalSegments = Math.ceil((arcRadius * totalArc) * this.arcSegmentsPerMm);
        if (state.units === 'in') {
            totalSegments *= 25.4;
        }
        totalSegments = Math.max(1, Math.min(totalSegments, 360));

        let arcAngleIncrement = totalArc / totalSegments;
        if (clockwise) {
            arcAngleIncrement = -arcAngleIncrement;
        }

        const zDist = (z - state.z);
        const zStep = zDist / totalSegments;

        if (this.currentPath && this.currentPath.vertices.length === 0) {
            this.currentPath.vertices.push(state.x, state.y, state.z);
        }

        let currentAngle = arcCurrentAngle;
        let pz = state.z;

        for (let seg = 0; seg < totalSegments - 1; seg++) {
            currentAngle += arcAngleIncrement;
            const px = centerX + arcRadius * Math.cos(currentAngle);
            const py = centerY + arcRadius * Math.sin(currentAngle);
            pz += zStep;

            if (this.currentPath) {
                this.currentPath.vertices.push(px, py, pz);
            }

            if (isExtrusion) {
                this.updateBoundingBox(px, py, pz);
            }
        }

        if (this.currentPath) {
            this.currentPath.vertices.push(x, y, z);
        }

        if (isExtrusion) {
            this.updateBoundingBox(x, y, z);
        }

        state.x = x;
        state.y = y;
        state.z = z;
        if (params.e !== undefined) {
            state.e = state.absoluteExtrusion ? params.e : state.e + params.e;
        }
    }

    private handleHoming(params: GCodeParameters): void {
        if (params.x !== undefined || Object.keys(params).length === 0) {
            this.state.x = 0;
        }
        if (params.y !== undefined || Object.keys(params).length === 0) {
            this.state.y = 0;
        }
        if (params.z !== undefined || Object.keys(params).length === 0) {
            this.state.z = 0;
        }
    }

    private handleSetPosition(params: GCodeParameters): void {
        if (params.x !== undefined) this.state.x = params.x;
        if (params.y !== undefined) this.state.y = params.y;
        if (params.z !== undefined) this.state.z = params.z;
        if (params.e !== undefined) this.state.e = params.e;
    }

    private handleToolChange(tool: number): void {
        this.state.tool = tool;
        if (this.currentPath) {
            this.startNewPath(this.currentPath.pathType, this.currentPath.isExtrusion);
        }
    }

    // ============================================================================
    // Layer & Path Management
    // ============================================================================

    private startNewLayer(zHeight: number): void {
        this.finalizePath();

        if (this.currentLayer && this.currentLayer.paths.length > 0) {
            this.layers.push(this.currentLayer);
        }

        this.currentLayer = {
            index: this.layers.length,
            zHeight,
            paths: []
        };
    }

    private startNewPath(pathType: PathType, isExtrusion: boolean): void {
        this.finalizePath();

        this.currentPath = {
            vertices: [],
            pathType,
            tool: this.state.tool,
            extrusionWidth: 0.4,
            lineHeight: 0.2,
            isExtrusion
        };
    }

    private finalizePath(): void {
        if (this.currentPath && this.currentPath.vertices.length >= 6) {
            if (!this.currentLayer) {
                this.currentLayer = {
                    index: 0,
                    zHeight: this.state.z,
                    paths: []
                };
            }
            this.currentLayer.paths.push(this.currentPath);
        }
        this.currentPath = null;
    }

    // ============================================================================
    // Utility Methods
    // ============================================================================

    private parsePathTypeFromComment(comment: string): PathType | null {
        const lowerComment = comment.toLowerCase().trim();

        if (lowerComment.startsWith('type:')) {
            const typeStr = lowerComment.substring(5).trim();
            return this.mapPathType(typeStr);
        }

        if (lowerComment.startsWith('feature:')) {
            const typeStr = lowerComment.substring(8).trim();
            return this.mapPathType(typeStr);
        }

        if (lowerComment.startsWith('feature ')) {
            const typeStr = lowerComment.substring(8).trim();
            return this.mapPathType(typeStr);
        }

        const featureMatch = lowerComment.match(/;\s*feature:\s*(.+)/i);
        if (featureMatch) {
            return this.mapPathType(featureMatch[1].trim());
        }

        return null;
    }

    private mapPathType(typeStr: string): PathType {
        const lower = typeStr.toLowerCase().replace(/[_\s-]/g, '');

        const mappings: Record<string, PathType> = {
            // PrusaSlicer / OrcaSlicer / BambuStudio
            'externalperimeter': 'outer_perimeter',
            'outerwall': 'outer_perimeter',
            'perimeter': 'inner_perimeter',
            'innerwall': 'inner_perimeter',
            'internalinfill': 'infill',
            'sparseinfill': 'infill',
            'solidinfill': 'solid_infill',
            'topsolidinfill': 'top_solid_infill',
            'topsurface': 'top_solid_infill',
            'bottomsolidinfill': 'bottom_solid_infill',
            'bottomsurface': 'bottom_solid_infill',
            'bridgeinfill': 'bridge',
            'bridge': 'bridge',
            'overhangperimeter': 'bridge',
            'skirt': 'skirt',
            'skirtbrim': 'skirt',
            'brim': 'brim',
            'supportmaterial': 'support',
            'support': 'support',
            'supportmaterialinterface': 'support_interface',
            'supportinterface': 'support_interface',
            'primetower': 'prime_tower',
            'wipetower': 'wipe_tower',

            // Cura
            'wallouter': 'outer_perimeter',
            'wallinner': 'inner_perimeter',
            'skin': 'top_solid_infill',
            'topskin': 'top_solid_infill',
            'bottomskin': 'bottom_solid_infill',
            'fill': 'infill',
            'infill': 'infill',
            'supportroof': 'support_interface',
            'supportfloor': 'support_interface',

            // Simplify3D
            'outermostperimeter': 'outer_perimeter',
            'innerperimeter': 'inner_perimeter',
            'densesupport': 'support_interface',
            'oozeshield': 'skirt',
            'raft': 'support',

            // Generic
            'travel': 'travel',
            'move': 'travel',
            'retract': 'travel'
        };

        return mappings[lower] || 'unknown';
    }

    private updateBoundingBox(x: number, y: number, z: number): void {
        this.boundingBox.min.x = Math.min(this.boundingBox.min.x, x);
        this.boundingBox.min.y = Math.min(this.boundingBox.min.y, y);
        this.boundingBox.min.z = Math.min(this.boundingBox.min.z, z);
        this.boundingBox.max.x = Math.max(this.boundingBox.max.x, x);
        this.boundingBox.max.y = Math.max(this.boundingBox.max.y, y);
        this.boundingBox.max.z = Math.max(this.boundingBox.max.z, z);
    }
}
