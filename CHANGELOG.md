# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-12-22

### Added

- **Standalone Parser & Renderer**: Export separate `GCodeParser` and `GCodeRenderer` classes for advanced usage
  - Allows integration with Angular services or other frameworks
  - Full control over parsing and rendering pipeline

- **G2/G3 Arc Support**: Parser now handles arc moves (G2 clockwise, G3 counter-clockwise)
  - Supports both I/J offset and R radius formats
  - Configurable arc segment resolution
  - Helical arc support (arcs with Z movement)

- **Thumbnail Extraction**: Extract embedded preview thumbnails from G-code
  - Supports PrusaSlicer, OrcaSlicer, BambuStudio thumbnail format
  - Returns base64-encoded image data ready for display

- **Slicer Detection**: Automatically detects slicer software
  - Identifies PrusaSlicer, Cura, OrcaSlicer, BambuStudio, Simplify3D, IdeaMaker
  - Extracts slicer version when available

- **Multi-Tool Support**: Track tool changes (T0-T7) throughout print
  - Per-tool filament usage tracking
  - Tool-based color scheme option

- **New Exports**:
  - `GCodeParser` - Standalone parser class
  - `GCodeRenderer` - Standalone renderer class  
  - `Thumbnail` - Thumbnail data interface
  - `GCodeMetadata` - Extended metadata with thumbnails, slicer info
  - `BoundingBox` - Bounding box type
  - `ParseResult` - Parser result type
  - `RenderOptions` - Renderer options interface
  - `RenderedLayer` - Rendered layer data interface

### Changed

- Improved path type detection with more slicer format support
- Better metadata extraction (estimated time, filament usage, layer height)

## [2.0.0] - 2025-12-22

### Added

- **3D Tube Rendering**: New `renderTubes` option enables realistic visualization with continuous tube geometry
  - Uses `ExtrusionGeometry` class that creates smooth tubes without z-fighting
  - Configurable with `extrusionWidth`, `lineHeight`, and `radialSegments` options
  - Merged geometry per color per layer for optimal performance
  
- **Color Themes**: 5 built-in color themes for customizing visualization
  - `default` - Original vibrant colors
  - `ocean` - Cool blue/teal tones
  - `forest` - Natural green/brown tones  
  - `sunset` - Warm red/orange/pink tones
  - `monochrome` - Grayscale
  - New `COLOR_THEMES` export for easy theme access
  - New `CustomColors` type for custom color definitions
  
- **New Methods**:
  - `setCustomColors(colors)` - Dynamically change path type colors
  - `dispose()` - Clean up materials and resources

- **New Exports**:
  - `ExtrusionGeometry` - Continuous tube geometry class
  - `ExtrusionGeometryParameters` - Type for geometry parameters
  - `CustomColors` - Type for custom color mapping
  - `ColorTheme` - Type for color theme definition
  - `COLOR_THEMES` - Array of built-in color themes

### Changed

- `GCodeViewerOptions` now includes tube rendering and color theme options
- Line rendering now uses cached materials for better performance
- Updated documentation with tube rendering and color theme examples

### Fixed

- **Z-fighting elimination**: Tube rendering uses continuous geometry that completely eliminates z-fighting flickering between adjacent extrusion segments

## [1.0.11] - Previous

- Initial stable release
- Layer-by-layer visualization
- Path type detection and coloring
- Multiple slicer support (PrusaSlicer, Cura, BambuSlicer, OrcaSlicer, Simplify3D, IdeaMaker)
- Print info extraction
- Path-type and height color schemes
- Purge line filtering
- Travel move toggle
