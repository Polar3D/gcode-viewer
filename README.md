# @polar3d/gcode-viewer

A lightweight, framework-agnostic G-code viewer built with Three.js. Parse and visualize G-code files with support for layer-by-layer viewing, **3D tube rendering**, color themes, and print information extraction.

## ⚠️ License & Attribution Requirement

**IMPORTANT**: This package requires visible attribution. This is required by the license and cannot be removed.

See [LICENSE](./LICENSE) for full terms.

## Features

- **🆕 3D Tube Rendering**: Realistic visualization with continuous tube geometry (eliminates z-fighting)
- **🆕 Color Themes**: 5 built-in color themes (Default, Ocean, Forest, Sunset, Monochrome) + custom colors
- **🆕 Standalone Parser & Renderer**: Use parser and renderer independently for custom integrations
- **🆕 G2/G3 Arc Support**: Full support for clockwise/counter-clockwise arc moves (I/J and R formats)
- **🆕 Thumbnail Extraction**: Extract embedded thumbnails from G-code files (PNG/QOI formats)
- **Layer-by-layer visualization**: Navigate through print layers with a simple API
- **Path type detection**: Automatically detects and colors different path types (perimeter, infill, support, etc.)
- **Multiple slicer support**: Works with PrusaSlicer, Cura, BambuSlicer, OrcaSlicer, Simplify3D, and IdeaMaker
- **Slicer detection**: Automatically detects which slicer generated the G-code
- **Multi-tool support**: Handles multi-extruder printers with tool changes
- **Print info extraction**: Extracts estimated time, filament usage, and dimensions
- **Color schemes**: Switch between path-type coloring and height-gradient coloring
- **Purge line filtering**: Automatically filters out purge/intro lines
- **Travel move toggle**: Show/hide travel moves

## Installation

```bash
npm install @polar3d/gcode-viewer three
```

## Usage

### Basic Usage

```typescript
import * as THREE from 'three';
import { GCodeViewer } from '@polar3d/gcode-viewer';

// Get your viewer container
const container = document.getElementById('viewer-container');
container.style.position = 'relative';

// Create viewer with container
const viewer = new GCodeViewer({
  container,
  lineWidth: 2,
  hidePurgeLines: true,
  colorScheme: 'pathType',
  showTravelMoves: false,
});

// Parse G-code
const gcodeText = await fetch('model.gcode').then(r => r.text());
const result = viewer.parse(gcodeText);

// Add to your Three.js scene
scene.add(result.object);
```

### 3D Tube Rendering (New in v2.0)

Enable realistic 3D visualization with continuous tube geometry:

```typescript
const viewer = new GCodeViewer({
  container,
  renderTubes: true,         // Enable 3D tube rendering
  extrusionWidth: 0.4,       // Extrusion width in mm
  lineHeight: 0.2,           // Layer height in mm
  radialSegments: 4,         // Tube quality (4-8 recommended)
});

const result = viewer.parse(gcodeText);
scene.add(result.object);
```

**Benefits of tube rendering:**
- More realistic visualization of extrusion paths
- No z-fighting flickering (continuous geometry)
- Better visual distinction between layers

### Standalone Parser & Renderer (New in v2.1)

For custom integrations, you can use the parser and renderer separately:

```typescript
import { GCodeParser, GCodeRenderer } from '@polar3d/gcode-viewer';
import * as THREE from 'three';

// Parse G-code
const parser = new GCodeParser();
const parseResult = parser.parse(gcodeText);

// Access parsed data
console.log('Total layers:', parseResult.layers.length);
console.log('Slicer:', parseResult.metadata.slicer);
console.log('Has thumbnails:', parseResult.thumbnails.length > 0);
console.log('Bounding box:', parseResult.boundingBox);

// Create renderer with your options
const renderer = new GCodeRenderer({
  renderTubes: true,
  extrusionWidth: 0.4,
  lineHeight: 0.2,
});

// Render parsed data
const object3D = renderer.render(parseResult.layers);
scene.add(object3D);
```

**Thumbnail Extraction:**

```typescript
const parser = new GCodeParser();
const result = parser.parse(gcodeText);

// Get thumbnails (PNG or QOI format)
for (const thumbnail of result.thumbnails) {
  console.log(`Thumbnail: ${thumbnail.width}x${thumbnail.height}`);
  console.log(`Format: ${thumbnail.format}`);
  
  // For PNG thumbnails, create data URL for display
  if (thumbnail.format === 'png') {
    const base64 = btoa(String.fromCharCode(...thumbnail.data));
    const dataUrl = `data:image/png;base64,${base64}`;
    // Use in img src
  }
}
```

**Metadata & Slicer Detection:**

```typescript
const result = parser.parse(gcodeText);

// Access metadata
console.log('Slicer:', result.metadata.slicer);
console.log('Estimated time:', result.metadata.estimatedTime);
console.log('Filament used:', result.metadata.filamentUsed);
console.log('Layer height:', result.metadata.layerHeight);
console.log('Nozzle diameter:', result.metadata.nozzleDiameter);

// Bounding box for camera setup
const bbox = result.boundingBox;
console.log('Print size:', bbox.max.x - bbox.min.x, 'x', bbox.max.y - bbox.min.y, 'x', bbox.max.z - bbox.min.z);
```

**G2/G3 Arc Support:**

The parser automatically handles G2 (clockwise) and G3 (counter-clockwise) arc commands:

```gcode
G2 X10 Y10 I5 J0   ; Arc using I/J center offsets
G3 X20 Y20 R5      ; Arc using R radius
```

Arcs are interpolated into smooth curves for accurate visualization.

### Color Themes (New in v2.0)

Apply different color themes to your visualization:

```typescript
import { GCodeViewer, COLOR_THEMES } from '@polar3d/gcode-viewer';

const viewer = new GCodeViewer({
  container,
  renderTubes: true,
  customColors: COLOR_THEMES[1].colors,  // Ocean theme
});

// Or set theme dynamically
viewer.setCustomColors(COLOR_THEMES[2].colors);  // Forest theme
```

**Available themes:**
| Theme | Description |
|-------|-------------|
| `default` | Original vibrant colors |
| `ocean` | Cool blue/teal tones |
| `forest` | Natural green/brown tones |
| `sunset` | Warm red/orange/pink tones |
| `monochrome` | Grayscale |

**Custom colors:**

```typescript
viewer.setCustomColors({
  outer_perimeter: '#FF0000',
  inner_perimeter: '#00FF00',
  infill: '#0000FF',
  // ... other path types
});
```

### Alternative: Set Container Later

```typescript
const viewer = new GCodeViewer();

// Set container before parsing
viewer.setContainer(document.getElementById('viewer-container'));

const result = viewer.parse(gcodeText);
```

### React Example

```tsx
import { useRef, useEffect } from 'react';
import { GCodeViewer } from '@polar3d/gcode-viewer';

function GCodeViewerComponent({ gcodeText }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<GCodeViewer | null>(null);

  useEffect(() => {
    if (containerRef.current && gcodeText) {
      // Create viewer with container and tube rendering
      viewerRef.current = new GCodeViewer({ 
        container: containerRef.current,
        renderTubes: true,
      });
      const result = viewerRef.current.parse(gcodeText);
      // ... add to Three.js scene
    }
    
    return () => {
      viewerRef.current?.dispose();
    };
  }, [gcodeText]);

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'relative', width: '100%', height: '100%' }}
    />
  );
}
```

### Angular Example

```typescript
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { GCodeViewer } from '@polar3d/gcode-viewer';

@Component({
  template: `<div #viewerContainer class="viewer-container"></div>`,
  styles: [`.viewer-container { position: relative; width: 100%; height: 100%; }`]
})
export class ViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('viewerContainer') containerRef: ElementRef;
  private viewer: GCodeViewer;

  ngAfterViewInit() {
    // Create viewer with container and tube rendering
    this.viewer = new GCodeViewer({ 
      container: this.containerRef.nativeElement,
      renderTubes: true,
    });
  }

  loadGCode(gcodeText: string) {
    const result = this.viewer.parse(gcodeText);
    // ... add to Three.js scene
  }
  
  ngOnDestroy() {
    this.viewer?.dispose();
  }
}
```

## Layer Navigation

```typescript
// Show only first 50 layers
viewer.setMaxVisibleLayer(49);

// Show layer range
viewer.setLayerRange(10, 50);

// Show single layer
viewer.showSingleLayer(25);

// Show all layers
viewer.showAllLayers();

// Get total layer count
const totalLayers = viewer.getTotalLayers();
```

## Visualization Options

```typescript
// Toggle travel moves
viewer.setTravelMovesVisible(true);

// Change color scheme
viewer.setColorScheme('height');  // or 'pathType'

// Filter by path type
viewer.setPathTypeFilter('infill');  // Only show infill
viewer.setPathTypeFilter(null);      // Show all

// Set custom colors (color theme)
viewer.setCustomColors({ outer_perimeter: '#FF0000' });
```

## Path Types

| Path Type | Color | Description |
|-----------|-------|-------------|
| `outer_perimeter` | #00CED1 | Outer walls |
| `inner_perimeter` | #32CD32 | Inner walls |
| `infill` | #FFA500 | Internal fill |
| `solid_infill` | #FF6B6B | Solid top/bottom layers |
| `top_surface` | #FF69B4 | Top surfaces |
| `bridge` | #40E0D0 | Bridging |
| `skirt` | #6495ED | Skirt/brim |
| `support` | #DDA0DD | Support material |
| `travel` | #888888 | Travel moves |

## API Reference

### GCodeViewer

#### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `HTMLElement` | - | Container for branding |
| `lineWidth` | `number` | `2` | Width of extruded lines (line mode) |
| `hidePurgeLines` | `boolean` | `true` | Filter out purge/intro lines |
| `colorScheme` | `'pathType' \| 'height'` | `'pathType'` | Initial color scheme |
| `showTravelMoves` | `boolean` | `false` | Show travel moves |
| `renderTubes` | `boolean` | `false` | **New:** Enable 3D tube rendering |
| `extrusionWidth` | `number` | `0.4` | **New:** Extrusion width in mm (tube mode) |
| `lineHeight` | `number` | `0.2` | **New:** Layer height in mm (tube mode) |
| `radialSegments` | `number` | `4` | **New:** Tube quality segments |
| `customColors` | `CustomColors` | - | **New:** Custom path type colors |

#### Methods

| Method | Description |
|--------|-------------|
| `setContainer(element)` | Set container (before parse) |
| `parse(gcodeText)` | Parse G-code |
| `setMaxVisibleLayer(n)` | Show layers 0 to n |
| `setLayerRange(from, to)` | Show layer range |
| `showSingleLayer(n)` | Show only layer n |
| `showAllLayers()` | Show all layers |
| `setTravelMovesVisible(bool)` | Toggle travel moves |
| `setColorScheme(scheme)` | Set 'pathType' or 'height' |
| `setPathTypeFilter(type)` | Filter by path type |
| `setCustomColors(colors)` | **New:** Set custom colors for path types |
| `getTotalLayers()` | Get layer count |
| `getPrintInfo()` | Get print information |
| `dispose()` | **New:** Clean up materials and resources |

### GCodeParser (New in v2.1)

Standalone parser for custom integrations.

```typescript
import { GCodeParser } from '@polar3d/gcode-viewer';
const parser = new GCodeParser();
const result = parser.parse(gcodeText);
```

#### Parse Result

| Property | Type | Description |
|----------|------|-------------|
| `layers` | `Layer[]` | Array of parsed layers with segments |
| `thumbnails` | `Thumbnail[]` | Extracted thumbnail images |
| `metadata` | `GCodeMetadata` | Print metadata and slicer info |
| `boundingBox` | `BoundingBox` | Min/max coordinates of the print |

#### Thumbnail Object

| Property | Type | Description |
|----------|------|-------------|
| `width` | `number` | Thumbnail width in pixels |
| `height` | `number` | Thumbnail height in pixels |
| `format` | `'png' \| 'qoi'` | Image format |
| `data` | `Uint8Array` | Raw image data |

#### GCodeMetadata Object

| Property | Type | Description |
|----------|------|-------------|
| `slicer` | `string` | Detected slicer name |
| `estimatedTime` | `number` | Print time in seconds |
| `filamentUsed` | `number` | Filament usage in mm |
| `layerHeight` | `number` | Layer height in mm |
| `nozzleDiameter` | `number` | Nozzle diameter in mm |

### GCodeRenderer (New in v2.1)

Standalone renderer for custom integrations.

```typescript
import { GCodeRenderer } from '@polar3d/gcode-viewer';

const renderer = new GCodeRenderer({
  renderTubes: true,
  extrusionWidth: 0.4,
  lineHeight: 0.2,
});

const object3D = renderer.render(parsedLayers);
```

#### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `renderTubes` | `boolean` | `false` | Enable 3D tube rendering |
| `extrusionWidth` | `number` | `0.4` | Extrusion width in mm |
| `lineHeight` | `number` | `0.2` | Layer height in mm |
| `radialSegments` | `number` | `4` | Tube quality segments |
| `colorScheme` | `'pathType' \| 'height'` | `'pathType'` | Color scheme |
| `customColors` | `CustomColors` | - | Custom path type colors |

#### Methods

| Method | Description |
|--------|-------------|
| `render(layers)` | Render layers to THREE.Group |
| `setColorScheme(scheme)` | Set color scheme |
| `setCustomColors(colors)` | Set custom colors |
| `dispose()` | Clean up resources |

### Exported Types

```typescript
import type {
  GCodeParser,
  GCodeRenderer,
  GCodeViewer,
  Thumbnail,
  GCodeMetadata,
  BoundingBox,
  Layer,
  Segment,
  CustomColors,
  ColorTheme,
  COLOR_THEMES,
} from '@polar3d/gcode-viewer';
```


## License

This package is licensed under a custom license that requires attribution.

**"Powered by Polar3D" branding is automatically displayed when using this package.** The branding cannot be removed without violating the license terms.

See [LICENSE](./LICENSE) for full details.

---

Made with ❤️ by [Polar3D](https://polar3d.com)
