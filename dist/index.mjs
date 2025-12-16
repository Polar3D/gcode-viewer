// src/GCodeViewer.ts
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

// src/types.ts
var PATH_TYPE_COLORS = {
  outer_perimeter: "#00CED1",
  // Cyan/Teal
  inner_perimeter: "#32CD32",
  // Lime Green
  infill: "#FFA500",
  // Orange
  solid_infill: "#FF6B6B",
  // Coral/Red
  top_solid_infill: "#FF6B6B",
  // Same as solid
  bottom_solid_infill: "#FF6B6B",
  // Same as solid
  bridge: "#40E0D0",
  // Turquoise
  skirt: "#6495ED",
  // Cornflower Blue
  brim: "#6495ED",
  // Same as skirt
  support: "#DDA0DD",
  // Plum
  support_interface: "#DA70D6",
  // Orchid
  prime_tower: "#B8860B",
  // Dark Goldenrod
  wipe_tower: "#B8860B",
  // Same as prime tower
  travel: "#888888",
  // Gray
  unknown: "#E8E8E8"
  // Light gray (User Sequence)
};
var WHITELISTED_DOMAINS = [
  "polar3d.com",
  "www.polar3d.com"
];

// src/parser.ts
function parsePathType(comment) {
  const lowerComment = comment.toLowerCase().trim();
  if (lowerComment.includes("type:")) {
    const typeMatch = lowerComment.match(/type:\s*(.+?)(?:$|;)/);
    if (typeMatch) {
      const type = typeMatch[1].trim().toLowerCase();
      if (type === "external perimeter" || type === "outer wall" || type.includes("external"))
        return "outer_perimeter";
      if (type === "perimeter" || type === "inner wall" || type.includes("inner"))
        return "inner_perimeter";
      if (type === "overhang perimeter") return "outer_perimeter";
      if (type === "top solid infill" || type === "top surface") return "top_solid_infill";
      if (type === "bottom solid infill" || type === "bottom surface") return "bottom_solid_infill";
      if (type === "solid infill" || type === "solid layer") return "solid_infill";
      if (type === "sparse infill" || type === "infill" || type === "internal infill")
        return "infill";
      if (type === "bridge infill" || type === "bridge" || type.includes("bridge")) return "bridge";
      if (type === "skirt" || type === "skirt/brim") return "skirt";
      if (type === "brim") return "brim";
      if (type === "support interface" || type === "support-interface") return "support_interface";
      if (type === "support material" || type === "support" || type.includes("support"))
        return "support";
      if (type === "prime tower" || type === "wipe tower" || type.includes("tower"))
        return "prime_tower";
      if (type === "gap fill") return "inner_perimeter";
      if (type === "ironing") return "top_solid_infill";
      if (type.includes("wall") || type.includes("perimeter")) return "inner_perimeter";
      if (type.includes("fill") || type.includes("infill")) return "infill";
    }
  }
  if (lowerComment.startsWith("type:")) {
    const type = lowerComment.substring(5).trim();
    if (type === "wall-outer") return "outer_perimeter";
    if (type === "wall-inner") return "inner_perimeter";
    if (type === "skin") return "solid_infill";
    if (type === "fill") return "infill";
    if (type === "skirt") return "skirt";
    if (type === "support") return "support";
    if (type === "support-interface") return "support_interface";
    if (type === "prime-tower") return "prime_tower";
  }
  if (lowerComment.includes("mesh:") || lowerComment.match(/^layer:\d+/)) return null;
  if (lowerComment.includes("wall-outer") || lowerComment.includes("outer wall"))
    return "outer_perimeter";
  if (lowerComment.includes("wall-inner") || lowerComment.includes("inner wall"))
    return "inner_perimeter";
  if (lowerComment.includes("skin") || lowerComment.includes("top/bottom")) return "solid_infill";
  if (lowerComment === "infill" || lowerComment.includes(" infill")) return "infill";
  if (lowerComment.includes("skirt")) return "skirt";
  if (lowerComment.includes("brim")) return "brim";
  if (lowerComment.includes("support-interface")) return "support_interface";
  if (lowerComment.includes("support")) return "support";
  if (lowerComment.includes("prime-tower")) return "prime_tower";
  if (lowerComment === "outer perimeter" || lowerComment.includes("outer perimeter"))
    return "outer_perimeter";
  if (lowerComment === "inner perimeter" || lowerComment === "perimeter") return "inner_perimeter";
  if (lowerComment === "solid layer" || lowerComment.includes("solid layer")) return "solid_infill";
  if (lowerComment === "bridge" || lowerComment.includes("bridge")) return "bridge";
  if (lowerComment.includes("path type:")) {
    if (lowerComment.includes("outer")) return "outer_perimeter";
    if (lowerComment.includes("inner")) return "inner_perimeter";
    if (lowerComment.includes("fill")) return "infill";
  }
  return null;
}
function parsePrintInfoFromLine(line, currentInfo) {
  const lowerLine = line.toLowerCase();
  let { estimatedTime, filamentLength, layerHeight } = currentInfo;
  if (lowerLine.includes("time") || lowerLine.includes("estimated")) {
    const timeMatch = line.match(/(\d+)\s*h\s*(\d+)\s*m(?:\s*(\d+)\s*s)?/i);
    if (timeMatch) {
      estimatedTime = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + (parseInt(timeMatch[3]) || 0);
    }
    const timeSecsMatch = line.match(/;TIME[:\s]*(\d+)/i);
    if (timeSecsMatch) {
      estimatedTime = parseInt(timeSecsMatch[1]);
    }
  }
  if (lowerLine.includes("filament") && (lowerLine.includes("used") || lowerLine.includes("length") || lowerLine.includes("mm"))) {
    const filamentMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:mm|m\b)/i);
    if (filamentMatch) {
      let length = parseFloat(filamentMatch[1]);
      if (line.toLowerCase().includes(" m") && !line.toLowerCase().includes("mm")) {
        length *= 1e3;
      }
      filamentLength = length;
    }
  }
  if (lowerLine.includes("layer_height") || lowerLine.includes("layer height")) {
    const heightMatch = line.match(/(\d+(?:\.\d+)?)/);
    if (heightMatch) {
      const height = parseFloat(heightMatch[1]);
      if (height > 0 && height < 1) {
        layerHeight = height;
      }
    }
  }
  return { estimatedTime, filamentLength, layerHeight };
}

// src/branding.ts
function isWhitelistedDomain() {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase();
  return WHITELISTED_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith("." + domain)
  );
}
function getBranding() {
  return {
    text: "Powered by Polar3D",
    url: "https://polar3d.com",
    html: '<a href="https://polar3d.com" target="_blank" rel="noopener noreferrer" style="color: #0ea5e9; text-decoration: none; font-size: 12px;">Powered by <strong>Polar3D</strong></a>',
    required: !isWhitelistedDomain()
  };
}
function createBrandingElement(options) {
  const position = options?.position || "bottom-left";
  const container = document.createElement("div");
  container.className = options?.className || "polar3d-branding";
  container.setAttribute("data-polar3d-branding", "true");
  const positionStyles = {
    "bottom-left": "bottom: 8px; left: 8px;",
    "bottom-right": "bottom: 8px; right: 8px;",
    "top-left": "top: 8px; left: 8px;",
    "top-right": "top: 8px; right: 8px;"
  };
  container.style.cssText = `
    position: absolute;
    ${positionStyles[position]}
    z-index: 1000;
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    pointer-events: auto;
  `;
  const link = document.createElement("a");
  link.href = "https://polar3d.com";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.cssText = `
    color: #38bdf8;
    text-decoration: none;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 4px;
  `;
  link.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
    <span>Powered by <strong>Polar3D</strong></span>
  `;
  link.addEventListener("mouseenter", () => {
    link.style.color = "#7dd3fc";
  });
  link.addEventListener("mouseleave", () => {
    link.style.color = "#38bdf8";
  });
  container.appendChild(link);
  return container;
}
function injectBranding(container) {
  if (isWhitelistedDomain()) {
    return null;
  }
  if (container.querySelector("[data-polar3d-branding]")) {
    return null;
  }
  const computedStyle = window.getComputedStyle(container);
  if (computedStyle.position === "static") {
    container.style.position = "relative";
  }
  const branding = createBrandingElement({ position: "bottom-left" });
  container.appendChild(branding);
  return branding;
}
var BRANDING_CSS = `
.polar3d-branding {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 1000;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.polar3d-branding a {
  color: #38bdf8;
  text-decoration: none;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.polar3d-branding a:hover {
  color: #7dd3fc;
}
`;

// src/GCodeViewer.ts
var GCodeViewer = class {
  constructor(options = {}) {
    this.layers = [];
    this.gcodeGroup = null;
    this.pathTypeFilter = null;
    this.printInfo = null;
    this.brandingInjected = false;
    this.options = {
      lineWidth: options.lineWidth ?? 2,
      hidePurgeLines: options.hidePurgeLines ?? true,
      colorScheme: options.colorScheme ?? "pathType",
      showTravelMoves: options.showTravelMoves ?? false,
      container: options.container
    };
  }
  /**
   * Set the container element for branding injection
   * Call this before parse() if container wasn't provided in constructor
   */
  setContainer(container) {
    this.options.container = container;
  }
  /**
   * Parse G-code text and create layer-organized 3D objects
   * Automatically injects "Powered by Polar3D" branding if container is set
   */
  parse(gcodeText) {
    if (this.options.container && !this.brandingInjected) {
      injectBranding(this.options.container);
      this.brandingInjected = true;
    }
    const hidePurgeLines = this.options.hidePurgeLines;
    const state = {
      x: 0,
      y: 0,
      z: 0,
      e: 0,
      f: 0,
      extruding: false,
      relative: false,
      relativeE: false
    };
    const layersData = /* @__PURE__ */ new Map();
    let currentPathType = "unknown";
    const detectedPathTypes = /* @__PURE__ */ new Set();
    let estimatedTime = null;
    let filamentLength = null;
    let layerHeight = null;
    let modelMinX = Infinity, modelMaxX = -Infinity;
    let modelMinY = Infinity, modelMaxY = -Infinity;
    let modelMinZ = Infinity, modelMaxZ = -Infinity;
    const allExtrudedPoints = [];
    const getOrCreateLayer = (z) => {
      const roundedZ = Math.round(z * 1e4) / 1e4;
      if (!layersData.has(roundedZ)) {
        layersData.set(roundedZ, { segments: [], pathVertex: [], z: roundedZ });
      }
      return layersData.get(roundedZ);
    };
    const addSegment = (p1, p2, isExtruding, pathType) => {
      const layer = getOrCreateLayer(p2.z);
      if (isExtruding) {
        let segment = layer.segments.find((s) => s.pathType === pathType);
        if (!segment) {
          segment = { vertices: [], pathType };
          layer.segments.push(segment);
        }
        segment.vertices.push(p1.x, p1.y, p1.z);
        segment.vertices.push(p2.x, p2.y, p2.z);
        allExtrudedPoints.push({ x: p1.x, y: p1.y, z: p1.z });
        allExtrudedPoints.push({ x: p2.x, y: p2.y, z: p2.z });
        detectedPathTypes.add(pathType);
      } else {
        layer.pathVertex.push(p1.x, p1.y, p1.z);
        layer.pathVertex.push(p2.x, p2.y, p2.z);
      }
    };
    const absolute = (v1, v2) => state.relative ? v1 + v2 : v2;
    const absoluteE = (v1, v2) => state.relativeE ? v1 + v2 : v2;
    const lines = gcodeText.split("\n");
    for (const lineText of lines) {
      const trimmedLine = lineText.trim();
      const commentIndex = trimmedLine.indexOf(";");
      if (commentIndex !== -1) {
        const comment = trimmedLine.substring(commentIndex + 1);
        const info = parsePrintInfoFromLine(trimmedLine, {
          estimatedTime,
          filamentLength,
          layerHeight
        });
        estimatedTime = info.estimatedTime;
        filamentLength = info.filamentLength;
        layerHeight = info.layerHeight;
        const newPathType = parsePathType(comment);
        if (newPathType) {
          currentPathType = newPathType;
        }
      }
      const cleanLine = trimmedLine.replace(/;.*/g, "").trim();
      const tokens = cleanLine.split(/\s+/);
      if (tokens.length === 0 || !tokens[0]) continue;
      const cmd = tokens[0].toUpperCase();
      const args = {};
      tokens.slice(1).forEach((token) => {
        if (token && token[0]) {
          const key = token[0].toLowerCase();
          const value = parseFloat(token.substring(1));
          if (!isNaN(value)) {
            args[key] = value;
          }
        }
      });
      if (cmd === "G0" || cmd === "G1") {
        const line = {
          x: args["x"] !== void 0 ? absolute(state.x, args["x"]) : state.x,
          y: args["y"] !== void 0 ? absolute(state.y, args["y"]) : state.y,
          z: args["z"] !== void 0 ? absolute(state.z, args["z"]) : state.z,
          e: args["e"] !== void 0 ? absoluteE(state.e, args["e"]) : state.e,
          f: args["f"] !== void 0 ? absolute(state.f, args["f"]) : state.f
        };
        const extrusionDelta = state.relativeE ? args["e"] || 0 : line.e - state.e;
        const isExtruding = extrusionDelta > 0;
        addSegment(state, line, isExtruding, currentPathType);
        Object.assign(state, line);
        state.extruding = isExtruding;
      } else if (cmd === "G28") {
        state.x = args["x"] !== void 0 ? 0 : state.x;
        state.y = args["y"] !== void 0 ? 0 : state.y;
        state.z = args["z"] !== void 0 ? 0 : state.z;
      } else if (cmd === "G90") {
        state.relative = false;
      } else if (cmd === "G91") {
        state.relative = true;
      } else if (cmd === "G92") {
        state.x = args["x"] !== void 0 ? args["x"] : state.x;
        state.y = args["y"] !== void 0 ? args["y"] : state.y;
        state.z = args["z"] !== void 0 ? args["z"] : state.z;
        state.e = args["e"] !== void 0 ? args["e"] : state.e;
      } else if (cmd === "M82") {
        state.relativeE = false;
      } else if (cmd === "M83") {
        state.relativeE = true;
      }
    }
    if (hidePurgeLines && allExtrudedPoints.length > 0) {
      for (const pt of allExtrudedPoints) {
        modelMinX = Math.min(modelMinX, pt.x);
        modelMaxX = Math.max(modelMaxX, pt.x);
        modelMinY = Math.min(modelMinY, pt.y);
        modelMaxY = Math.max(modelMaxY, pt.y);
        modelMinZ = Math.min(modelMinZ, pt.z);
        modelMaxZ = Math.max(modelMaxZ, pt.z);
      }
      const modelCenterX = (modelMinX + modelMaxX) / 2;
      const modelCenterY = (modelMinY + modelMaxY) / 2;
      const modelSizeX = modelMaxX - modelMinX;
      const modelSizeY = modelMaxY - modelMinY;
      const distanceThreshold = Math.max(modelSizeX, modelSizeY) * 0.4;
      const corePoints = allExtrudedPoints.filter((pt) => {
        const distFromCenter = Math.sqrt(
          Math.pow(pt.x - modelCenterX, 2) + Math.pow(pt.y - modelCenterY, 2)
        );
        return distFromCenter < distanceThreshold;
      });
      let coreMinX = modelMinX, coreMaxX = modelMaxX;
      let coreMinY = modelMinY, coreMaxY = modelMaxY;
      if (corePoints.length > allExtrudedPoints.length * 0.5) {
        coreMinX = Infinity;
        coreMaxX = -Infinity;
        coreMinY = Infinity;
        coreMaxY = -Infinity;
        for (const pt of corePoints) {
          coreMinX = Math.min(coreMinX, pt.x);
          coreMaxX = Math.max(coreMaxX, pt.x);
          coreMinY = Math.min(coreMinY, pt.y);
          coreMaxY = Math.max(coreMaxY, pt.y);
        }
      }
      const coreSizeX = coreMaxX - coreMinX;
      const coreSizeY = coreMaxY - coreMinY;
      const purgeMargin = Math.max(coreSizeX, coreSizeY) * 0.15;
      for (const [, layerData] of layersData) {
        for (const segment of layerData.segments) {
          const filteredVertices = [];
          for (let i = 0; i < segment.vertices.length; i += 6) {
            const x1 = segment.vertices[i];
            const y1 = segment.vertices[i + 1];
            const x2 = segment.vertices[i + 3];
            const y2 = segment.vertices[i + 4];
            const segmentLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const pt1InCore = x1 >= coreMinX - purgeMargin && x1 <= coreMaxX + purgeMargin && y1 >= coreMinY - purgeMargin && y1 <= coreMaxY + purgeMargin;
            const pt2InCore = x2 >= coreMinX - purgeMargin && x2 <= coreMaxX + purgeMargin && y2 >= coreMinY - purgeMargin && y2 <= coreMaxY + purgeMargin;
            const nearEdge = y1 < 15 && y2 < 15 || x1 < 15 && x2 < 15 || (y1 < 20 || y2 < 20) && segmentLength > 20;
            const isLongPurgeLine = nearEdge && segmentLength > 30;
            const isDiagonalFromCorner = (x1 < 30 && y1 < 30 || x2 < 30 && y2 < 30) && segmentLength > 15;
            if (pt1InCore && pt2InCore && !isLongPurgeLine && !isDiagonalFromCorner) {
              filteredVertices.push(...segment.vertices.slice(i, i + 6));
            }
          }
          segment.vertices = filteredVertices;
        }
      }
      let finalMinX = Infinity, finalMaxX = -Infinity;
      let finalMinY = Infinity, finalMaxY = -Infinity;
      let finalMinZ = Infinity, finalMaxZ = -Infinity;
      for (const [, layerData] of layersData) {
        for (const segment of layerData.segments) {
          for (let i = 0; i < segment.vertices.length; i += 3) {
            const x = segment.vertices[i];
            const y = segment.vertices[i + 1];
            const zVal = segment.vertices[i + 2];
            finalMinX = Math.min(finalMinX, x);
            finalMaxX = Math.max(finalMaxX, x);
            finalMinY = Math.min(finalMinY, y);
            finalMaxY = Math.max(finalMaxY, y);
            finalMinZ = Math.min(finalMinZ, zVal);
            finalMaxZ = Math.max(finalMaxZ, zVal);
          }
        }
      }
      modelMinX = finalMinX;
      modelMaxX = finalMaxX;
      modelMinY = finalMinY;
      modelMaxY = finalMaxY;
      modelMinZ = finalMinZ;
      modelMaxZ = finalMaxZ;
      const centerX = (finalMinX + finalMaxX) / 2;
      const centerY = (finalMinY + finalMaxY) / 2;
      const centerZ = finalMinZ;
      for (const [, layerData] of layersData) {
        for (const segment of layerData.segments) {
          for (let i = 0; i < segment.vertices.length; i += 3) {
            segment.vertices[i] -= centerX;
            segment.vertices[i + 1] -= centerY;
            segment.vertices[i + 2] -= centerZ;
          }
        }
        for (let i = 0; i < layerData.pathVertex.length; i += 3) {
          layerData.pathVertex[i] -= centerX;
          layerData.pathVertex[i + 1] -= centerY;
          layerData.pathVertex[i + 2] -= centerZ;
        }
      }
      modelMinX -= centerX;
      modelMaxX -= centerX;
      modelMinY -= centerY;
      modelMaxY -= centerY;
      modelMinZ -= centerZ;
      modelMaxZ -= centerZ;
    }
    this.gcodeGroup = new THREE.Group();
    this.layers = [];
    const sortedZHeights = Array.from(layersData.keys()).sort((a, b) => a - b);
    const totalLayers = sortedZHeights.length;
    sortedZHeights.forEach((z, index) => {
      const layerData = layersData.get(z);
      const layerGroup = new THREE.Group();
      layerGroup.name = `layer_${index}_z${z.toFixed(3)}`;
      for (const segment of layerData.segments) {
        if (segment.vertices.length > 0) {
          const lineGeometry = new LineGeometry();
          lineGeometry.setPositions(segment.vertices);
          const color = new THREE.Color(PATH_TYPE_COLORS[segment.pathType] || "#888888");
          const lineMaterial = new LineMaterial({
            color: color.getHex(),
            linewidth: this.options.lineWidth,
            worldUnits: false,
            dashed: false,
            alphaToCoverage: false
          });
          lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
          const line = new Line2(lineGeometry, lineMaterial);
          line.computeLineDistances();
          line.name = `extruded_${segment.pathType}`;
          line.userData["pathType"] = segment.pathType;
          layerGroup.add(line);
        }
      }
      if (layerData.pathVertex.length > 0) {
        const pathGeometry = new LineGeometry();
        pathGeometry.setPositions(layerData.pathVertex);
        const pathMaterial = new LineMaterial({
          color: 8947848,
          linewidth: 1,
          worldUnits: false,
          transparent: true,
          opacity: 0.4
        });
        pathMaterial.resolution.set(window.innerWidth, window.innerHeight);
        const pathLine = new Line2(pathGeometry, pathMaterial);
        pathLine.computeLineDistances();
        pathLine.name = "travel";
        pathLine.userData["pathType"] = "travel";
        pathLine.visible = this.options.showTravelMoves;
        layerGroup.add(pathLine);
      }
      layerGroup.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
      this.gcodeGroup.add(layerGroup);
      this.layers.push({
        index,
        zHeight: z,
        object: layerGroup,
        visible: true
      });
    });
    const sizeX = modelMaxX - modelMinX;
    const sizeY = modelMaxY - modelMinY;
    const sizeZ = modelMaxZ - modelMinZ;
    if (!layerHeight && sortedZHeights.length > 1) {
      layerHeight = sortedZHeights[1] - sortedZHeights[0];
    }
    this.printInfo = {
      size: sizeX > 0 && sizeY > 0 && sizeZ > 0 ? { x: sizeX, y: sizeY, z: sizeZ } : null,
      estimatedTime,
      filamentLength,
      filaments: [],
      layerCount: totalLayers,
      layerHeight,
      pathTypes: Array.from(detectedPathTypes).sort()
    };
    if (this.options.colorScheme === "height") {
      this.setColorScheme("height");
    }
    return {
      object: this.gcodeGroup,
      printInfo: this.printInfo,
      layers: this.layers
    };
  }
  /**
   * Set which layers are visible (0 to maxLayer)
   */
  setMaxVisibleLayer(maxLayer) {
    if (!this.layers.length) return;
    const clampedMax = Math.max(0, Math.min(maxLayer, this.layers.length - 1));
    this.layers.forEach((layer, index) => {
      layer.visible = index <= clampedMax;
      layer.object.visible = layer.visible;
    });
  }
  /**
   * Set visibility range (fromLayer to toLayer)
   */
  setLayerRange(fromLayer, toLayer) {
    if (!this.layers.length) return;
    const from = Math.max(0, Math.min(fromLayer, this.layers.length - 1));
    const to = Math.max(0, Math.min(toLayer, this.layers.length - 1));
    this.layers.forEach((layer, index) => {
      layer.visible = index >= from && index <= to;
      layer.object.visible = layer.visible;
    });
  }
  /**
   * Show only a single layer
   */
  showSingleLayer(layerIndex) {
    if (!this.layers.length) return;
    const index = Math.max(0, Math.min(layerIndex, this.layers.length - 1));
    this.layers.forEach((layer, i) => {
      layer.visible = i === index;
      layer.object.visible = layer.visible;
    });
  }
  /**
   * Show all layers
   */
  showAllLayers() {
    this.layers.forEach((layer) => {
      layer.visible = true;
      layer.object.visible = true;
    });
  }
  /**
   * Toggle travel moves visibility
   */
  setTravelMovesVisible(visible) {
    this.layers.forEach((layer) => {
      layer.object.traverse((child) => {
        if (child.userData["pathType"] === "travel" || child.name === "travel") {
          child.visible = visible && layer.visible;
        }
      });
    });
  }
  /**
   * Filter by path type (null to show all)
   */
  setPathTypeFilter(pathType) {
    this.pathTypeFilter = pathType;
    this.applyPathTypeFilter();
  }
  applyPathTypeFilter() {
    this.layers.forEach((layer) => {
      layer.object.traverse((child) => {
        if (child instanceof Line2 && child.userData["pathType"]) {
          const isTravel = child.userData["pathType"] === "travel";
          if (isTravel) return;
          if (this.pathTypeFilter === null) {
            child.visible = layer.visible;
          } else {
            child.visible = layer.visible && child.userData["pathType"] === this.pathTypeFilter;
          }
        }
      });
    });
  }
  /**
   * Get total number of layers
   */
  getTotalLayers() {
    return this.layers.length;
  }
  /**
   * Get layer info by index
   */
  getLayer(index) {
    return this.layers[index];
  }
  /**
   * Get print info
   */
  getPrintInfo() {
    return this.printInfo;
  }
  /**
   * Check if G-code is loaded
   */
  isLoaded() {
    return this.layers.length > 0;
  }
  /**
   * Reset/clear the viewer
   */
  reset() {
    this.layers = [];
    this.gcodeGroup = null;
    this.pathTypeFilter = null;
    this.printInfo = null;
  }
  /**
   * Set layer color scheme
   */
  setColorScheme(scheme) {
    const totalLayers = this.layers.length;
    if (scheme === "height") {
      this.layers.forEach((layer, index) => {
        const heightRatio = index / Math.max(1, totalLayers - 1);
        const color = new THREE.Color();
        const hue = 0.6 - heightRatio * 0.55;
        color.setHSL(hue < 0 ? hue + 1 : hue, 0.8, 0.55);
        layer.object.traverse((child) => {
          if (child instanceof Line2 && child.userData["pathType"] && child.userData["pathType"] !== "travel") {
            child.material.color = color;
          }
        });
      });
    } else {
      this.layers.forEach((layer) => {
        layer.object.traverse((child) => {
          if (child instanceof Line2 && child.userData["pathType"]) {
            const pathType = child.userData["pathType"];
            const color = new THREE.Color(PATH_TYPE_COLORS[pathType] || "#888888");
            child.material.color = color;
          }
        });
      });
    }
  }
  /**
   * Update line material resolution (call on window resize)
   */
  updateResolution(width, height) {
    this.layers.forEach((layer) => {
      layer.object.traverse((child) => {
        if (child instanceof Line2) {
          child.material.resolution.set(width, height);
        }
      });
    });
  }
};
export {
  BRANDING_CSS,
  GCodeViewer,
  PATH_TYPE_COLORS,
  WHITELISTED_DOMAINS,
  createBrandingElement,
  getBranding,
  injectBranding,
  isWhitelistedDomain,
  parsePathType,
  parsePrintInfoFromLine
};
