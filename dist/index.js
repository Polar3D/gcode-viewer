"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BRANDING_CSS: () => BRANDING_CSS,
  COLOR_THEMES: () => COLOR_THEMES,
  ExtrusionGeometry: () => ExtrusionGeometry,
  GCodeParser: () => GCodeParser,
  GCodeRenderer: () => GCodeRenderer,
  GCodeViewer: () => GCodeViewer,
  PATH_TYPE_COLORS: () => PATH_TYPE_COLORS2,
  WHITELISTED_DOMAINS: () => WHITELISTED_DOMAINS,
  createBrandingElement: () => createBrandingElement,
  getBranding: () => getBranding,
  injectBranding: () => injectBranding,
  isWhitelistedDomain: () => isWhitelistedDomain,
  parsePathType: () => parsePathType,
  parsePrintInfoFromLine: () => parsePrintInfoFromLine
});
module.exports = __toCommonJS(index_exports);

// src/GCodeViewer.ts
var THREE = __toESM(require("three"));
var import_Line2 = require("three/examples/jsm/lines/Line2.js");
var import_LineMaterial = require("three/examples/jsm/lines/LineMaterial.js");
var import_LineGeometry = require("three/examples/jsm/lines/LineGeometry.js");
var BufferGeometryUtils = __toESM(require("three/examples/jsm/utils/BufferGeometryUtils.js"));

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
var COLOR_THEMES = [
  {
    id: "default",
    name: "Default",
    colors: {}
    // Uses PATH_TYPE_COLORS
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: {
      outer_perimeter: "#006994",
      inner_perimeter: "#40E0D0",
      infill: "#5F9EA0",
      solid_infill: "#20B2AA",
      top_solid_infill: "#48D1CC",
      bottom_solid_infill: "#008B8B",
      bridge: "#00CED1",
      skirt: "#87CEEB",
      brim: "#87CEEB",
      support: "#B0C4DE",
      support_interface: "#ADD8E6",
      prime_tower: "#4682B4",
      wipe_tower: "#4682B4",
      travel: "#1E90FF",
      unknown: "#E0FFFF"
    }
  },
  {
    id: "forest",
    name: "Forest",
    colors: {
      outer_perimeter: "#228B22",
      inner_perimeter: "#32CD32",
      infill: "#8FBC8F",
      solid_infill: "#2E8B57",
      top_solid_infill: "#00FA9A",
      bottom_solid_infill: "#006400",
      bridge: "#9ACD32",
      skirt: "#6B8E23",
      brim: "#6B8E23",
      support: "#8B4513",
      support_interface: "#A0522D",
      prime_tower: "#556B2F",
      wipe_tower: "#556B2F",
      travel: "#90EE90",
      unknown: "#F0FFF0"
    }
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: {
      outer_perimeter: "#FF4500",
      inner_perimeter: "#FF6347",
      infill: "#FF8C00",
      solid_infill: "#DC143C",
      top_solid_infill: "#FF69B4",
      bottom_solid_infill: "#8B0000",
      bridge: "#FFD700",
      skirt: "#FFA07A",
      brim: "#FFA07A",
      support: "#DDA0DD",
      support_interface: "#EE82EE",
      prime_tower: "#CD853F",
      wipe_tower: "#CD853F",
      travel: "#FF1493",
      unknown: "#FFF0F5"
    }
  },
  {
    id: "monochrome",
    name: "Monochrome",
    colors: {
      outer_perimeter: "#333333",
      inner_perimeter: "#555555",
      infill: "#777777",
      solid_infill: "#444444",
      top_solid_infill: "#666666",
      bottom_solid_infill: "#222222",
      bridge: "#888888",
      skirt: "#999999",
      brim: "#999999",
      support: "#AAAAAA",
      support_interface: "#BBBBBB",
      prime_tower: "#505050",
      wipe_tower: "#505050",
      travel: "#CCCCCC",
      unknown: "#DDDDDD"
    }
  }
];
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

// src/ExtrusionGeometry.ts
var import_three = require("three");
var ExtrusionGeometry = class extends import_three.BufferGeometry {
  constructor(points = [new import_three.Vector3()], lineWidth = 0.4, lineHeight = 0.2, radialSegments = 8) {
    super();
    this.type = "ExtrusionGeometry";
    this.parameters = {
      points,
      lineWidth,
      lineHeight,
      radialSegments,
      closed: false
    };
    if (points.length < 2) {
      return;
    }
    const vertex = new import_three.Vector3();
    const normal = new import_three.Vector3();
    const uv = new import_three.Vector2();
    const vertices = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    const halfWidth = lineWidth / 2;
    const halfHeight = lineHeight / 2;
    generateBufferData();
    this.setIndex(indices);
    this.setAttribute("position", new import_three.Float32BufferAttribute(vertices, 3));
    this.setAttribute("normal", new import_three.Float32BufferAttribute(normals, 3));
    this.setAttribute("uv", new import_three.Float32BufferAttribute(uvs, 2));
    function generateBufferData() {
      for (let i = 0; i < points.length; i++) {
        generateSegment(i);
      }
      generateSegment(points.length - 1);
      generateUVs();
      generateIndices();
    }
    function generateSegment(i) {
      const [P, N, B] = computeCornerAngles(i);
      for (let j = 0; j <= radialSegments; j++) {
        const v = j / radialSegments * Math.PI * 2;
        const sin = Math.sin(v);
        const cos = -Math.cos(v);
        normal.x = cos * N.x + sin * B.x;
        normal.y = cos * N.y + sin * B.y;
        normal.z = cos * N.z + sin * B.z;
        normal.normalize();
        normals.push(normal.x, normal.y, normal.z);
        vertex.x = P.x + halfWidth * normal.x;
        vertex.y = P.y + halfWidth * normal.y;
        vertex.z = P.z + halfHeight * normal.z;
        vertices.push(vertex.x, vertex.y, vertex.z);
      }
    }
    function generateIndices() {
      for (let j = 1; j < points.length; j++) {
        for (let i = 1; i <= radialSegments; i++) {
          const a = (radialSegments + 1) * (j - 1) + (i - 1);
          const b = (radialSegments + 1) * j + (i - 1);
          const c = (radialSegments + 1) * j + i;
          const d = (radialSegments + 1) * (j - 1) + i;
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }
    }
    function generateUVs() {
      for (let i = 0; i < points.length; i++) {
        for (let j = 0; j <= radialSegments; j++) {
          uv.x = i / points.length;
          uv.y = j / radialSegments;
          uvs.push(uv.x, uv.y);
        }
      }
    }
    function computeCornerAngles(i) {
      const P = points[i];
      const tangent = new import_three.Vector3();
      const N = new import_three.Vector3();
      const B = new import_three.Vector3();
      const vec = new import_three.Vector3();
      const prevPoint = points[i - 1] || P;
      const nextPoint = points[i + 1] || P;
      tangent.copy(P).sub(prevPoint).normalize().add(nextPoint.clone().sub(P).normalize()).normalize();
      if (tangent.lengthSq() < 1e-3) {
        tangent.set(0, 0, 1);
      }
      let min = Number.MAX_VALUE;
      const tx = Math.abs(tangent.x);
      const ty = Math.abs(tangent.y);
      const tz = Math.abs(tangent.z);
      if (tx <= min) {
        min = tx;
        N.set(1, 0, 0);
      }
      if (ty <= min) {
        min = ty;
        N.set(0, 1, 0);
      }
      if (tz <= min) {
        N.set(0, 0, 1);
      }
      vec.crossVectors(tangent, N).normalize();
      N.crossVectors(tangent, vec);
      B.crossVectors(tangent, N);
      return [P, N, B];
    }
  }
};

// src/GCodeViewer.ts
var GCodeViewer = class {
  constructor(options = {}) {
    this.layers = [];
    this.gcodeGroup = null;
    this.pathTypeFilter = null;
    this.printInfo = null;
    this.brandingInjected = false;
    this.lineMaterials = /* @__PURE__ */ new Map();
    this.tubeMaterials = /* @__PURE__ */ new Map();
    this.options = {
      lineWidth: options.lineWidth ?? 2,
      hidePurgeLines: options.hidePurgeLines ?? true,
      colorScheme: options.colorScheme ?? "pathType",
      showTravelMoves: options.showTravelMoves ?? false,
      container: options.container,
      renderTubes: options.renderTubes ?? false,
      extrusionWidth: options.extrusionWidth ?? 0.4,
      lineHeight: options.lineHeight ?? 0.2,
      radialSegments: options.radialSegments ?? 4,
      customColors: options.customColors
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
      if (this.options.renderTubes) {
        const geometriesByColor = /* @__PURE__ */ new Map();
        for (const segment of layerData.segments) {
          if (segment.vertices.length < 6) continue;
          const color = this.getPathColor(segment.pathType, index, totalLayers);
          const points = [];
          for (let i = 0; i < segment.vertices.length; i += 3) {
            points.push(new THREE.Vector3(
              segment.vertices[i],
              segment.vertices[i + 1],
              segment.vertices[i + 2]
            ));
          }
          if (points.length < 2) continue;
          const geometry = new ExtrusionGeometry(
            points,
            this.options.extrusionWidth,
            this.options.lineHeight,
            this.options.radialSegments
          );
          if (geometry.attributes["position"]?.count > 0) {
            if (!geometriesByColor.has(color)) {
              geometriesByColor.set(color, []);
            }
            geometriesByColor.get(color).push(geometry);
          }
        }
        for (const [color, geometries] of geometriesByColor) {
          if (geometries.length === 0) continue;
          const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false);
          for (const geom of geometries) {
            geom.dispose();
          }
          if (!mergedGeometry) continue;
          const material = this.getTubeMaterial(color);
          const mesh = new THREE.Mesh(mergedGeometry, material);
          mesh.userData["color"] = color;
          mesh.userData["isExtrusion"] = true;
          layerGroup.add(mesh);
        }
      } else {
        for (const segment of layerData.segments) {
          if (segment.vertices.length > 0) {
            const lineGeometry = new import_LineGeometry.LineGeometry();
            lineGeometry.setPositions(segment.vertices);
            const color = this.getPathColor(segment.pathType, index, totalLayers);
            const lineMaterial = this.getLineMaterial(color);
            const line = new import_Line2.Line2(lineGeometry, lineMaterial);
            line.computeLineDistances();
            line.name = `extruded_${segment.pathType}`;
            line.userData["pathType"] = segment.pathType;
            layerGroup.add(line);
          }
        }
      }
      if (layerData.pathVertex.length > 0) {
        const pathGeometry = new import_LineGeometry.LineGeometry();
        pathGeometry.setPositions(layerData.pathVertex);
        const pathMaterial = new import_LineMaterial.LineMaterial({
          color: 8947848,
          linewidth: 1,
          worldUnits: false,
          transparent: true,
          opacity: 0.4
        });
        pathMaterial.resolution.set(window.innerWidth, window.innerHeight);
        const pathLine = new import_Line2.Line2(pathGeometry, pathMaterial);
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
        if (child instanceof import_Line2.Line2 && child.userData["pathType"]) {
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
          if (child instanceof import_Line2.Line2 && child.userData["pathType"] && child.userData["pathType"] !== "travel") {
            child.material.color = color;
          }
          if (child instanceof THREE.Mesh && child.userData["isExtrusion"]) {
            child.material.color = color;
          }
        });
      });
    } else {
      this.layers.forEach((layer, index) => {
        layer.object.traverse((child) => {
          if (child instanceof import_Line2.Line2 && child.userData["pathType"]) {
            const pathType = child.userData["pathType"];
            const colorStr = this.getPathColor(pathType, index, totalLayers);
            const color = new THREE.Color(colorStr);
            child.material.color = color;
          }
          if (child instanceof THREE.Mesh && child.userData["isExtrusion"]) {
            const colorStr = child.userData["color"];
            if (colorStr) {
              const color = new THREE.Color(colorStr);
              child.material.color = color;
            }
          }
        });
      });
    }
    this.options.colorScheme = scheme;
  }
  /**
   * Set custom colors for path types (color theme)
   */
  setCustomColors(customColors) {
    this.options.customColors = customColors;
    this.lineMaterials.clear();
    this.tubeMaterials.clear();
  }
  /**
   * Get color for a path type based on current settings
   */
  getPathColor(pathType, _layerIndex, _totalLayers) {
    if (this.options.customColors && this.options.customColors[pathType]) {
      return this.options.customColors[pathType];
    }
    return PATH_TYPE_COLORS[pathType] || "#888888";
  }
  /**
   * Get or create a line material for a color
   */
  getLineMaterial(color) {
    if (!this.lineMaterials.has(color)) {
      const material = new import_LineMaterial.LineMaterial({
        color: new THREE.Color(color).getHex(),
        linewidth: this.options.lineWidth,
        worldUnits: false,
        dashed: false,
        alphaToCoverage: false
      });
      material.resolution.set(window.innerWidth, window.innerHeight);
      this.lineMaterials.set(color, material);
    }
    return this.lineMaterials.get(color);
  }
  /**
   * Get or create a tube material for a color
   */
  getTubeMaterial(color) {
    if (!this.tubeMaterials.has(color)) {
      const material = new THREE.MeshLambertMaterial({
        color: new THREE.Color(color),
        side: THREE.FrontSide
      });
      this.tubeMaterials.set(color, material);
    }
    return this.tubeMaterials.get(color);
  }
  /**
   * Update line material resolution (call on window resize)
   */
  updateResolution(width, height) {
    this.layers.forEach((layer) => {
      layer.object.traverse((child) => {
        if (child instanceof import_Line2.Line2) {
          child.material.resolution.set(width, height);
        }
      });
    });
    for (const material of this.lineMaterials.values()) {
      material.resolution.set(width, height);
    }
  }
  /**
   * Dispose all materials and resources
   */
  dispose() {
    for (const material of this.lineMaterials.values()) {
      material.dispose();
    }
    for (const material of this.tubeMaterials.values()) {
      material.dispose();
    }
    this.lineMaterials.clear();
    this.tubeMaterials.clear();
    this.reset();
  }
};

// src/GCodeParser.ts
var THREE2 = __toESM(require("three"));
var PATH_TYPE_COLORS2 = {
  "outer_perimeter": "#00d4d4",
  // Cyan
  "inner_perimeter": "#00cc66",
  // Green
  "infill": "#ff8c00",
  // Orange
  "solid_infill": "#ff4444",
  // Red
  "top_solid_infill": "#ff69b4",
  // Pink
  "bottom_solid_infill": "#9932cc",
  // Purple
  "bridge": "#ffd700",
  // Gold
  "skirt": "#87ceeb",
  // Sky Blue
  "brim": "#87ceeb",
  // Sky Blue
  "support": "#a0a0a0",
  // Gray
  "support_interface": "#c0c0c0",
  // Light Gray
  "prime_tower": "#8b4513",
  // Brown
  "wipe_tower": "#8b4513",
  // Brown
  "travel": "#ff0000",
  // Red (usually hidden)
  "unknown": "#ffffff"
  // White
};
var GCodeParser = class {
  constructor() {
    this.layers = [];
    this.currentLayer = null;
    this.currentPath = null;
    this.boundingBox = {
      min: new THREE2.Vector3(Infinity, Infinity, Infinity),
      max: new THREE2.Vector3(-Infinity, -Infinity, -Infinity)
    };
    // Arc interpolation settings
    this.arcSegmentsPerMm = 2;
    // Number of segments per mm of arc
    // Current detected path type from comments (;TYPE:... etc.)
    this.detectedPathType = "unknown";
    this.state = this.createInitialState();
    this.metadata = this.createInitialMetadata();
  }
  createInitialState() {
    return {
      x: 0,
      y: 0,
      z: 0,
      e: 0,
      f: 1e3,
      tool: 0,
      units: "mm",
      absolutePositioning: true,
      absoluteExtrusion: true
    };
  }
  createInitialMetadata() {
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
  parse(gcodeText) {
    this.reset();
    const lines = gcodeText.split("\n");
    this.parseMetadata(lines);
    for (const line of lines) {
      this.parseLine(line);
    }
    if (this.currentLayer && this.currentLayer.paths.length > 0) {
      this.layers.push(this.currentLayer);
    }
    return {
      layers: this.layers,
      metadata: this.metadata,
      boundingBox: this.boundingBox
    };
  }
  reset() {
    this.state = this.createInitialState();
    this.metadata = this.createInitialMetadata();
    this.layers = [];
    this.currentLayer = null;
    this.currentPath = null;
    this.detectedPathType = "unknown";
    this.boundingBox = {
      min: new THREE2.Vector3(Infinity, Infinity, Infinity),
      max: new THREE2.Vector3(-Infinity, -Infinity, -Infinity)
    };
  }
  // ============================================================================
  // Metadata & Thumbnail Parsing
  // ============================================================================
  parseMetadata(lines) {
    let currentThumbnail = null;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith(";")) continue;
      const comment = trimmed.substring(1).trim();
      const thumbBeginMatch = comment.match(/thumbnail begin (\d+)x(\d+) (\d+)/);
      if (thumbBeginMatch) {
        const [, width, height, charLength] = thumbBeginMatch;
        currentThumbnail = {
          size: `${width}x${height}`,
          width: parseInt(width, 10),
          height: parseInt(height, 10),
          charLength: parseInt(charLength, 10),
          chars: "",
          src: "",
          isValid: false
        };
        continue;
      }
      if (comment.includes("thumbnail end") && currentThumbnail) {
        const base64regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
        currentThumbnail.isValid = currentThumbnail.chars.length === currentThumbnail.charLength && base64regex.test(currentThumbnail.chars);
        if (currentThumbnail.isValid) {
          currentThumbnail.src = `data:image/png;base64,${currentThumbnail.chars}`;
          this.metadata.thumbnails[currentThumbnail.size] = currentThumbnail;
        }
        currentThumbnail = null;
        continue;
      }
      if (currentThumbnail) {
        currentThumbnail.chars += comment.trim();
        continue;
      }
      this.parseMetadataLine(comment);
    }
  }
  parseMetadataLine(comment) {
    const lowerComment = comment.toLowerCase();
    const timePatterns = [
      /estimated printing time[^=]*=\s*(\d+)h\s*(\d+)m\s*(\d+)s/i,
      /TIME:(\d+)/i,
      /print time[^:]*:\s*(\d+)h?\s*(\d*)m?\s*(\d*)s?/i
    ];
    for (const pattern of timePatterns) {
      const match = comment.match(pattern);
      if (match) {
        if (match.length === 4) {
          this.metadata.estimatedTime = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
        } else if (match.length === 2) {
          this.metadata.estimatedTime = parseInt(match[1]);
        }
        break;
      }
    }
    const filamentMatch = comment.match(/filament used[^=]*=\s*([\d.]+)\s*m/i);
    if (filamentMatch) {
      this.metadata.filamentLength = parseFloat(filamentMatch[1]) * 1e3;
    }
    const layerHeightMatch = comment.match(/layer_height\s*=\s*([\d.]+)/i);
    if (layerHeightMatch) {
      this.metadata.layerHeight = parseFloat(layerHeightMatch[1]);
    }
    if (lowerComment.includes("prusaslicer") || lowerComment.includes("slic3r")) {
      const versionMatch = comment.match(/(PrusaSlicer|Slic3r)[^\d]*([\d.]+)/i);
      if (versionMatch) {
        this.metadata.slicerName = versionMatch[1];
        this.metadata.slicerVersion = versionMatch[2];
      }
    } else if (lowerComment.includes("cura")) {
      const versionMatch = comment.match(/Cura[^\d]*([\d.]+)/i);
      if (versionMatch) {
        this.metadata.slicerName = "Cura";
        this.metadata.slicerVersion = versionMatch[1];
      }
    } else if (lowerComment.includes("orcaslicer")) {
      const versionMatch = comment.match(/OrcaSlicer[^\d]*([\d.]+)/i);
      if (versionMatch) {
        this.metadata.slicerName = "OrcaSlicer";
        this.metadata.slicerVersion = versionMatch[1];
      }
    } else if (lowerComment.includes("bambustudio")) {
      const versionMatch = comment.match(/BambuStudio[^\d]*([\d.]+)/i);
      if (versionMatch) {
        this.metadata.slicerName = "BambuStudio";
        this.metadata.slicerVersion = versionMatch[1];
      }
    }
  }
  // ============================================================================
  // Command Parsing
  // ============================================================================
  parseLine(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(";")) {
      if (trimmed.startsWith(";")) {
        const pathType = this.parsePathTypeFromComment(trimmed.substring(1));
        if (pathType && pathType !== "travel") {
          this.detectedPathType = pathType;
        }
      }
      return;
    }
    const cmd = this.parseCommand(trimmed);
    if (!cmd) return;
    this.executeCommand(cmd);
  }
  parseCommand(line) {
    const parts = line.split(";");
    const cmdPart = parts[0].trim();
    const comment = parts[1]?.trim();
    if (!cmdPart) return null;
    const tokens = cmdPart.split(/\s+/);
    const gcodeMatch = tokens[0].match(/([A-Za-z])(\d+\.?\d*)/);
    if (!gcodeMatch) return null;
    const gcode = `${gcodeMatch[1].toLowerCase()}${parseFloat(gcodeMatch[2])}`;
    const params = {};
    for (let i = 1; i < tokens.length; i++) {
      const paramMatch = tokens[i].match(/([A-Za-z])([-\d.]+)/);
      if (paramMatch) {
        params[paramMatch[1].toLowerCase()] = parseFloat(paramMatch[2]);
      }
    }
    return { src: line, gcode, params, comment };
  }
  executeCommand(cmd) {
    const { gcode, params, comment } = cmd;
    if (comment) {
      const pathType = this.parsePathTypeFromComment(comment);
      if (pathType && pathType !== "travel") {
        this.detectedPathType = pathType;
      }
    }
    switch (gcode) {
      case "g0":
      case "g1":
        this.handleLinearMove(params);
        break;
      case "g2":
        this.handleArcMove(params, true);
        break;
      case "g3":
        this.handleArcMove(params, false);
        break;
      case "g20":
        this.state.units = "in";
        break;
      case "g21":
        this.state.units = "mm";
        break;
      case "g28":
        this.handleHoming(params);
        break;
      case "g90":
        this.state.absolutePositioning = true;
        break;
      case "g91":
        this.state.absolutePositioning = false;
        break;
      case "g92":
        this.handleSetPosition(params);
        break;
      case "t0":
      case "t1":
      case "t2":
      case "t3":
      case "t4":
      case "t5":
      case "t6":
      case "t7":
        this.handleToolChange(parseInt(gcode.substring(1)));
        break;
      case "m82":
        this.state.absoluteExtrusion = true;
        break;
      case "m83":
        this.state.absoluteExtrusion = false;
        break;
    }
  }
  // ============================================================================
  // Move Handlers
  // ============================================================================
  handleLinearMove(params) {
    const { state } = this;
    let x = params.x ?? state.x;
    let y = params.y ?? state.y;
    let z = params.z ?? state.z;
    if (!state.absolutePositioning) {
      x = state.x + (params.x ?? 0);
      y = state.y + (params.y ?? 0);
      z = state.z + (params.z ?? 0);
    }
    if (params.f !== void 0) {
      state.f = params.f;
    }
    if (z !== state.z && z > state.z) {
      this.startNewLayer(z);
    }
    const isExtrusion = params.e !== void 0 && params.e > 0;
    const existingPath = this.currentPath;
    if (existingPath) {
      const shouldStartNewPath = existingPath.isExtrusion !== isExtrusion || isExtrusion && this.detectedPathType !== "unknown" && existingPath.pathType !== this.detectedPathType;
      if (shouldStartNewPath) {
        const pathType = isExtrusion ? this.detectedPathType : "travel";
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
      const pathType = isExtrusion ? this.detectedPathType : "travel";
      this.startNewPath(pathType, isExtrusion);
      if (this.currentPath) {
        this.currentPath.vertices.push(state.x, state.y, state.z);
        this.currentPath.vertices.push(x, y, z);
        if (isExtrusion) {
          this.updateBoundingBox(x, y, z);
        }
      }
    }
    state.x = x;
    state.y = y;
    state.z = z;
    if (params.e !== void 0) {
      state.e = state.absoluteExtrusion ? params.e : state.e + params.e;
    }
  }
  /**
   * Handle G2/G3 arc moves
   */
  handleArcMove(params, clockwise) {
    const { state } = this;
    let x = params.x ?? state.x;
    let y = params.y ?? state.y;
    let z = params.z ?? state.z;
    let { i, j, r } = params;
    const isExtrusion = params.e !== void 0 && params.e > 0;
    if (!this.currentPath || this.currentPath.isExtrusion !== isExtrusion) {
      const pathType = isExtrusion ? this.currentPath?.pathType || "unknown" : "travel";
      this.startNewPath(pathType, isExtrusion);
    }
    if (r !== void 0) {
      const deltaX = x - state.x;
      const deltaY = y - state.y;
      const minR = Math.sqrt(Math.pow(deltaX / 2, 2) + Math.pow(deltaY / 2, 2));
      r = Math.max(Math.abs(r), minR);
      const dSquared = Math.pow(deltaX, 2) + Math.pow(deltaY, 2);
      const hSquared = Math.pow(r, 2) - dSquared / 4;
      let hDivD = Math.sqrt(Math.max(0, hSquared / dSquared));
      if (clockwise && r < 0 || !clockwise && r > 0) {
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
    let totalArc;
    if (wholeCircle) {
      totalArc = 2 * Math.PI;
    } else {
      totalArc = clockwise ? arcCurrentAngle - finalTheta : finalTheta - arcCurrentAngle;
      if (totalArc < 0) {
        totalArc += 2 * Math.PI;
      }
    }
    let totalSegments = Math.ceil(arcRadius * totalArc * this.arcSegmentsPerMm);
    if (state.units === "in") {
      totalSegments *= 25.4;
    }
    totalSegments = Math.max(1, Math.min(totalSegments, 360));
    let arcAngleIncrement = totalArc / totalSegments;
    if (clockwise) {
      arcAngleIncrement = -arcAngleIncrement;
    }
    const zDist = z - state.z;
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
    if (params.e !== void 0) {
      state.e = state.absoluteExtrusion ? params.e : state.e + params.e;
    }
  }
  handleHoming(params) {
    if (params.x !== void 0 || Object.keys(params).length === 0) {
      this.state.x = 0;
    }
    if (params.y !== void 0 || Object.keys(params).length === 0) {
      this.state.y = 0;
    }
    if (params.z !== void 0 || Object.keys(params).length === 0) {
      this.state.z = 0;
    }
  }
  handleSetPosition(params) {
    if (params.x !== void 0) this.state.x = params.x;
    if (params.y !== void 0) this.state.y = params.y;
    if (params.z !== void 0) this.state.z = params.z;
    if (params.e !== void 0) this.state.e = params.e;
  }
  handleToolChange(tool) {
    this.state.tool = tool;
    if (this.currentPath) {
      this.startNewPath(this.currentPath.pathType, this.currentPath.isExtrusion);
    }
  }
  // ============================================================================
  // Layer & Path Management
  // ============================================================================
  startNewLayer(zHeight) {
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
  startNewPath(pathType, isExtrusion) {
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
  finalizePath() {
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
  parsePathTypeFromComment(comment) {
    const lowerComment = comment.toLowerCase().trim();
    if (lowerComment.startsWith("type:")) {
      const typeStr = lowerComment.substring(5).trim();
      return this.mapPathType(typeStr);
    }
    if (lowerComment.startsWith("feature:")) {
      const typeStr = lowerComment.substring(8).trim();
      return this.mapPathType(typeStr);
    }
    if (lowerComment.startsWith("feature ")) {
      const typeStr = lowerComment.substring(8).trim();
      return this.mapPathType(typeStr);
    }
    const featureMatch = lowerComment.match(/;\s*feature:\s*(.+)/i);
    if (featureMatch) {
      return this.mapPathType(featureMatch[1].trim());
    }
    return null;
  }
  mapPathType(typeStr) {
    const lower = typeStr.toLowerCase().replace(/[_\s-]/g, "");
    const mappings = {
      // PrusaSlicer / OrcaSlicer / BambuStudio
      "externalperimeter": "outer_perimeter",
      "outerwall": "outer_perimeter",
      "perimeter": "inner_perimeter",
      "innerwall": "inner_perimeter",
      "internalinfill": "infill",
      "sparseinfill": "infill",
      "solidinfill": "solid_infill",
      "topsolidinfill": "top_solid_infill",
      "topsurface": "top_solid_infill",
      "bottomsolidinfill": "bottom_solid_infill",
      "bottomsurface": "bottom_solid_infill",
      "bridgeinfill": "bridge",
      "bridge": "bridge",
      "overhangperimeter": "bridge",
      "skirt": "skirt",
      "skirtbrim": "skirt",
      "brim": "brim",
      "supportmaterial": "support",
      "support": "support",
      "supportmaterialinterface": "support_interface",
      "supportinterface": "support_interface",
      "primetower": "prime_tower",
      "wipetower": "wipe_tower",
      // Cura
      "wallouter": "outer_perimeter",
      "wallinner": "inner_perimeter",
      "skin": "top_solid_infill",
      "topskin": "top_solid_infill",
      "bottomskin": "bottom_solid_infill",
      "fill": "infill",
      "infill": "infill",
      "supportroof": "support_interface",
      "supportfloor": "support_interface",
      // Simplify3D
      "outermostperimeter": "outer_perimeter",
      "innerperimeter": "inner_perimeter",
      "densesupport": "support_interface",
      "oozeshield": "skirt",
      "raft": "support",
      // Generic
      "travel": "travel",
      "move": "travel",
      "retract": "travel"
    };
    return mappings[lower] || "unknown";
  }
  updateBoundingBox(x, y, z) {
    this.boundingBox.min.x = Math.min(this.boundingBox.min.x, x);
    this.boundingBox.min.y = Math.min(this.boundingBox.min.y, y);
    this.boundingBox.min.z = Math.min(this.boundingBox.min.z, z);
    this.boundingBox.max.x = Math.max(this.boundingBox.max.x, x);
    this.boundingBox.max.y = Math.max(this.boundingBox.max.y, y);
    this.boundingBox.max.z = Math.max(this.boundingBox.max.z, z);
  }
};

// src/GCodeRenderer.ts
var THREE3 = __toESM(require("three"));
var import_Line22 = require("three/examples/jsm/lines/Line2.js");
var import_LineMaterial2 = require("three/examples/jsm/lines/LineMaterial.js");
var import_LineGeometry2 = require("three/examples/jsm/lines/LineGeometry.js");
var BufferGeometryUtils2 = __toESM(require("three/examples/jsm/utils/BufferGeometryUtils.js"));
var GCodeRenderer = class {
  constructor(options = {}) {
    this.lineMaterials = /* @__PURE__ */ new Map();
    this.tubeMaterials = /* @__PURE__ */ new Map();
    this.options = {
      renderTubes: options.renderTubes ?? false,
      lineWidth: options.lineWidth ?? 2,
      extrusionWidth: options.extrusionWidth ?? 0.4,
      lineHeight: options.lineHeight ?? 0.2,
      radialSegments: options.radialSegments ?? 4,
      colorScheme: options.colorScheme ?? "pathType",
      toolColors: options.toolColors ?? ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dfe6e9", "#a29bfe", "#fd79a8"],
      customColors: options.customColors,
      showTravel: options.showTravel ?? false,
      travelColor: options.travelColor ?? "#ff0000",
      canvasWidth: options.canvasWidth ?? 1920,
      canvasHeight: options.canvasHeight ?? 1080
    };
  }
  /**
   * Render layers to Three.js objects
   * Uses single merged mesh per color per layer to eliminate z-fighting
   */
  render(layers, boundingBox) {
    const renderedLayers = [];
    const totalLayers = layers.length;
    const center = new THREE3.Vector3();
    center.addVectors(boundingBox.min, boundingBox.max).multiplyScalar(0.5);
    for (const layer of layers) {
      const layerGroup = new THREE3.Group();
      layerGroup.name = `layer_${layer.index}`;
      const extrusionLines = [];
      const travelLines = [];
      if (this.options.renderTubes) {
        const geometriesByColor = {};
        for (const path of layer.paths) {
          if (path.vertices.length < 6) continue;
          if (path.pathType === "travel" && !this.options.showTravel) continue;
          if (!path.isExtrusion) continue;
          const color = this.getPathColor(path, layer.index, totalLayers);
          const points = [];
          for (let i = 0; i < path.vertices.length; i += 3) {
            points.push(new THREE3.Vector3(
              path.vertices[i] - center.x,
              path.vertices[i + 1] - center.y,
              path.vertices[i + 2] - center.z
            ));
          }
          if (points.length < 2) continue;
          const geometry = new ExtrusionGeometry(
            points,
            path.extrusionWidth || this.options.extrusionWidth,
            path.lineHeight || this.options.lineHeight,
            this.options.radialSegments
          );
          if (geometry.attributes["position"]?.count > 0) {
            if (!geometriesByColor[color]) {
              geometriesByColor[color] = [];
            }
            geometriesByColor[color].push(geometry);
          }
        }
        for (const color in geometriesByColor) {
          const geometries = geometriesByColor[color];
          if (geometries.length === 0) continue;
          const mergedGeometry = BufferGeometryUtils2.mergeGeometries(geometries, false);
          for (const geom of geometries) {
            geom.dispose();
          }
          if (!mergedGeometry) continue;
          const material = this.getTubeMaterial(color);
          const mesh = new THREE3.Mesh(mergedGeometry, material);
          mesh.userData["color"] = color;
          mesh.userData["isExtrusion"] = true;
          layerGroup.add(mesh);
          extrusionLines.push(mesh);
        }
      } else {
        for (const path of layer.paths) {
          if (path.vertices.length < 6) continue;
          if (path.pathType === "travel" && !this.options.showTravel) continue;
          const color = this.getPathColor(path, layer.index, totalLayers);
          const object = this.createLine(path, color, center);
          object.userData["pathType"] = path.pathType;
          object.userData["tool"] = path.tool;
          object.userData["isExtrusion"] = path.isExtrusion;
          layerGroup.add(object);
          if (path.isExtrusion) {
            extrusionLines.push(object);
          } else {
            travelLines.push(object);
          }
        }
      }
      renderedLayers.push({
        index: layer.index,
        zHeight: layer.zHeight,
        object: layerGroup,
        visible: true,
        extrusionLines,
        travelLines
      });
    }
    return renderedLayers;
  }
  /**
   * Create a Line2 object for a path
   */
  createLine(path, color, center) {
    const positions = [];
    for (let i = 0; i < path.vertices.length; i += 3) {
      positions.push(
        path.vertices[i] - center.x,
        path.vertices[i + 1] - center.y,
        path.vertices[i + 2] - center.z
      );
    }
    const geometry = new import_LineGeometry2.LineGeometry();
    geometry.setPositions(positions);
    const material = this.getLineMaterial(color);
    return new import_Line22.Line2(geometry, material);
  }
  /**
   * Get or create a line material for a color
   */
  getLineMaterial(color) {
    if (!this.lineMaterials.has(color)) {
      const material = new import_LineMaterial2.LineMaterial({
        color: new THREE3.Color(color).getHex(),
        linewidth: this.options.lineWidth,
        resolution: new THREE3.Vector2(this.options.canvasWidth, this.options.canvasHeight)
      });
      this.lineMaterials.set(color, material);
    }
    return this.lineMaterials.get(color);
  }
  /**
   * Get or create a tube material for a color
   */
  getTubeMaterial(color) {
    if (!this.tubeMaterials.has(color)) {
      const material = new THREE3.MeshLambertMaterial({
        color: new THREE3.Color(color),
        side: THREE3.FrontSide
      });
      this.tubeMaterials.set(color, material);
    }
    return this.tubeMaterials.get(color);
  }
  /**
   * Determine color for a path based on color scheme
   */
  getPathColor(path, layerIndex, totalLayers) {
    switch (this.options.colorScheme) {
      case "tool":
        return this.options.toolColors[path.tool % this.options.toolColors.length];
      case "height":
        const hue = layerIndex / Math.max(totalLayers - 1, 1) * 0.7;
        return `hsl(${hue * 360}, 80%, 50%)`;
      case "pathType":
      default:
        if (this.options.customColors && this.options.customColors[path.pathType]) {
          return this.options.customColors[path.pathType];
        }
        return PATH_TYPE_COLORS2[path.pathType] || PATH_TYPE_COLORS2.unknown;
    }
  }
  /**
   * Update line material resolution (call on window resize)
   */
  updateResolution(width, height) {
    this.options.canvasWidth = width;
    this.options.canvasHeight = height;
    for (const material of this.lineMaterials.values()) {
      material.resolution.set(width, height);
    }
  }
  /**
   * Update line width
   */
  setLineWidth(width) {
    this.options.lineWidth = width;
    for (const material of this.lineMaterials.values()) {
      material.linewidth = width;
    }
  }
  /**
   * Dispose all materials
   */
  dispose() {
    for (const material of this.lineMaterials.values()) {
      material.dispose();
    }
    for (const material of this.tubeMaterials.values()) {
      material.dispose();
    }
    this.lineMaterials.clear();
    this.tubeMaterials.clear();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BRANDING_CSS,
  COLOR_THEMES,
  ExtrusionGeometry,
  GCodeParser,
  GCodeRenderer,
  GCodeViewer,
  PATH_TYPE_COLORS,
  WHITELISTED_DOMAINS,
  createBrandingElement,
  getBranding,
  injectBranding,
  isWhitelistedDomain,
  parsePathType,
  parsePrintInfoFromLine
});
