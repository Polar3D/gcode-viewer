# @polar3d/gcode-viewer

A lightweight, framework-agnostic G-code viewer built with Three.js. Parse and visualize G-code files with support for layer-by-layer viewing, path type coloring, and print information extraction.

## ⚠️ License & Attribution Requirement

**IMPORTANT**: This package requires visible attribution. This is required by the license and cannot be removed.

See [LICENSE](./LICENSE) for full terms.

## Features

- **Layer-by-layer visualization**: Navigate through print layers with a simple API
- **Path type detection**: Automatically detects and colors different path types (perimeter, infill, support, etc.)
- **Multiple slicer support**: Works with PrusaSlicer, Cura, BambuSlicer, OrcaSlicer, Simplify3D, and IdeaMaker
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
      // Create viewer with container
      viewerRef.current = new GCodeViewer({ 
        container: containerRef.current 
      });
      const result = viewerRef.current.parse(gcodeText);
      // ... add to Three.js scene
    }
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
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { GCodeViewer } from '@polar3d/gcode-viewer';

@Component({
  template: `<div #viewerContainer class="viewer-container"></div>`,
  styles: [`.viewer-container { position: relative; width: 100%; height: 100%; }`]
})
export class ViewerComponent implements AfterViewInit {
  @ViewChild('viewerContainer') containerRef: ElementRef;
  private viewer: GCodeViewer;

  ngAfterViewInit() {
    // Create viewer with container
    this.viewer = new GCodeViewer({ 
      container: this.containerRef.nativeElement 
    });
  }

  loadGCode(gcodeText: string) {
    const result = this.viewer.parse(gcodeText);
    // ... add to Three.js scene
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
| `container` | `HTMLElement` | - |
| `lineWidth` | `number` | `2` | Width of extruded lines |
| `hidePurgeLines` | `boolean` | `true` | Filter out purge/intro lines |
| `colorScheme` | `'pathType' \| 'height'` | `'pathType'` | Initial color scheme |
| `showTravelMoves` | `boolean` | `false` | Show travel moves |

#### Methods

| Method | Description |
|--------|-------------|
| `setContainer(element)` | Set container  (before parse) |
| `parse(gcodeText)` | Parse G-code |
| `setMaxVisibleLayer(n)` | Show layers 0 to n |
| `setLayerRange(from, to)` | Show layer range |
| `showSingleLayer(n)` | Show only layer n |
| `showAllLayers()` | Show all layers |
| `setTravelMovesVisible(bool)` | Toggle travel moves |
| `setColorScheme(scheme)` | Set 'pathType' or 'height' |
| `setPathTypeFilter(type)` | Filter by path type |
| `getTotalLayers()` | Get layer count |
| `getPrintInfo()` | Get print information |


## License

This package is licensed under a custom license that requires attribution.

**"Powered by Polar3D" branding is automatically displayed when using this package.** The branding cannot be removed without violating the license terms.

See [LICENSE](./LICENSE) for full details.

---

Made with ❤️ by [Polar3D](https://polar3d.com)
