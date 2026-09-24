/**
 * Reading G-code out of the container it arrives in.
 *
 * FlashForge `.gx` files are not plain text: they open with a binary header
 * and an embedded BMP thumbnail, and the G-code body starts further in. Decode
 * such a file with `gcodeTextFromBuffer()` before handing it to the parser.
 */

const XGCODE_SIGNATURE = 'xgcode';

// The header stores the offset of the G-code body as a little-endian uint32
const XGCODE_BODY_OFFSET_POS = 0x14;

/**
 * Whether a buffer holds a FlashForge `.gx` ("xgcode") file.
 */
export function isGXBuffer(buffer: ArrayBuffer): boolean {
    if (buffer.byteLength < XGCODE_SIGNATURE.length) return false;
    const head = new TextDecoder('ascii').decode(new Uint8Array(buffer, 0, XGCODE_SIGNATURE.length));
    return head === XGCODE_SIGNATURE;
}

/**
 * Byte offset where the G-code body starts. 0 for a plain G-code file, and for
 * a `.gx` whose header offset is missing or out of range.
 */
export function gcodeBodyOffset(buffer: ArrayBuffer): number {
    if (!isGXBuffer(buffer) || buffer.byteLength < XGCODE_BODY_OFFSET_POS + 4) return 0;
    const offset = new DataView(buffer).getUint32(XGCODE_BODY_OFFSET_POS, true);
    return offset > 0 && offset < buffer.byteLength ? offset : 0;
}

/**
 * Decode a downloaded G-code file (`.gcode`, `.g` or `.gx`) into text for
 * `GCodeParser.parse()`. Strips a `.gx` binary header when present; line
 * numbers are handled by the parser itself.
 */
export function gcodeTextFromBuffer(buffer: ArrayBuffer): string {
    const offset = gcodeBodyOffset(buffer);
    const body = offset ? buffer.slice(offset) : buffer;
    // Slicer comments can carry non-ASCII bytes; never throw on a stray one
    return new TextDecoder('utf-8', { fatal: false }).decode(body);
}
