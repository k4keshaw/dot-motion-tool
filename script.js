const cfg = {
  cols: 20,
  rows: 2,
  dotSize: 10,
  gridScale: 100,
  randomSize: false,
  dotColor: "#ffffff",
  bgColor: "#101010",
  noiseType: "perlin",
  noiseScale: 100,
  minOpacity: 12,
  maxOpacity: 100,
  opacityContrast: 100,
  speed: 5,
  playing: true,
  t: 0
};

const els = {
  grid: document.getElementById("grid"),
  cols: document.getElementById("cols"),
  rows: document.getElementById("rows"),
  scale: document.getElementById("scale"),
  dotSize: document.getElementById("dotSize"),
  speed: document.getElementById("speed"),
  noiseType: document.getElementById("noiseType"),
  noiseScale: document.getElementById("noiseScale"),
  minOpacity: document.getElementById("minOpacity"),
  maxOpacity: document.getElementById("maxOpacity"),
  opacityContrast: document.getElementById("opacityContrast"),
  randomSize: document.getElementById("randomSize"),
  dotColor: document.getElementById("dotColor"),
  bgColor: document.getElementById("bgColor"),
  playPause: document.getElementById("playPause"),
  exportCSS: document.getElementById("exportCSS"),
  exportReact: document.getElementById("exportReact"),
  exportSVG: document.getElementById("exportSVG"),
  exportGIF: document.getElementById("exportGIF"),
  colsVal: document.getElementById("colsVal"),
  rowsVal: document.getElementById("rowsVal"),
  scaleVal: document.getElementById("scaleVal"),
  dotSizeVal: document.getElementById("dotSizeVal"),
  speedVal: document.getElementById("speedVal"),
  noiseScaleVal: document.getElementById("noiseScaleVal"),
  minOpacityVal: document.getElementById("minOpacityVal"),
  maxOpacityVal: document.getElementById("maxOpacityVal"),
  opacityContrastVal: document.getElementById("opacityContrastVal")
};

function syncLabels() {
  els.colsVal.textContent = cfg.cols;
  els.rowsVal.textContent = cfg.rows;
  els.scaleVal.textContent = `${cfg.gridScale}%`;
  els.dotSizeVal.textContent = cfg.dotSize;
  els.speedVal.textContent = cfg.speed;
  els.noiseScaleVal.textContent = `${cfg.noiseScale}%`;
  els.minOpacityVal.textContent = `${cfg.minOpacity}%`;
  els.maxOpacityVal.textContent = `${cfg.maxOpacity}%`;
  els.opacityContrastVal.textContent = `${cfg.opacityContrast}%`;
}

function applyGridScale() {
  els.grid.style.transform = `scale(${cfg.gridScale / 100})`;
}

function applyBackgroundColor() {
  document.querySelector(".preview").style.backgroundColor = cfg.bgColor;
}

function buildGrid() {
  els.grid.innerHTML = "";
  els.grid.style.gridTemplateColumns = `repeat(${cfg.cols}, ${cfg.dotSize + 6}px)`;
  applyGridScale();

  for (let i = 0; i < cfg.cols * cfg.rows; i++) {
    const dot = document.createElement("span");
    const size = cfg.randomSize
      ? cfg.dotSize * (0.65 + seededNoise(i, 0) * 0.7)
      : cfg.dotSize;

    dot.className = "dot";
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.backgroundColor = cfg.dotColor;

    els.grid.appendChild(dot);
  }
}

function seededNoise(x, y) {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
}

function perlinNoise(x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const xf = fract(x);
  const yf = fract(y);
  const u = fade(xf);
  const v = fade(yf);

  const top = lerp(
    gradientDot(x0, y0, xf, yf),
    gradientDot(x0 + 1, y0, xf - 1, yf),
    u
  );
  const bottom = lerp(
    gradientDot(x0, y0 + 1, xf, yf - 1),
    gradientDot(x0 + 1, y0 + 1, xf - 1, yf - 1),
    u
  );

  return clamp01(lerp(top, bottom, v) * 0.5 + 0.5);
}

function fractalNoise(x, y) {
  let total = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let max = 0;

  for (let octave = 0; octave < 4; octave++) {
    total += perlinNoise(x * frequency, y * frequency) * amplitude;
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return total / max;
}

function turbulenceNoise(x, y) {
  let total = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let max = 0;

  for (let octave = 0; octave < 4; octave++) {
    total += Math.abs(perlinNoise(x * frequency, y * frequency) * 2 - 1) * amplitude;
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return total / max;
}

function ridgedNoise(x, y) {
  return 1 - turbulenceNoise(x, y);
}

function cellularNoise(x, y) {
  const cellX = Math.floor(x);
  const cellY = Math.floor(y);
  let minDist = Infinity;

  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      const px = cellX + ox + seededNoise(cellX + ox, cellY + oy);
      const py = cellY + oy + seededNoise(cellX + ox + 19.19, cellY + oy + 73.73);
      const dist = Math.hypot(x - px, y - py);

      minDist = Math.min(minDist, dist);
    }
  }

  return clamp01(minDist);
}

function getNoiseValue(col, row, time) {
  const scale = cfg.noiseScale / 100;
  const x = col * 0.8 * scale;
  const y = row * 1.6 * scale;

  switch (cfg.noiseType) {
    case "fbm":
      return fractalNoise(x + time, y + time * 0.35);
    case "turbulence":
      return turbulenceNoise(x + time, y + time * 0.35);
    case "ridged":
      return ridgedNoise(x + time, y + time * 0.35);
    case "cellular":
      return cellularNoise(x + time * 0.75, y + time * 0.25);
    default:
      return perlinNoise(x + time, y + time * 0.35);
  }
}

function getOpacity(col, row, time) {
  const noise = applyOpacityContrast(getNoiseValue(col, row, time));
  const min = Math.min(cfg.minOpacity, cfg.maxOpacity) / 100;
  const max = Math.max(cfg.minOpacity, cfg.maxOpacity) / 100;

  return min + noise * (max - min);
}

function applyOpacityContrast(value) {
  const contrast = cfg.opacityContrast / 100;
  const curved = 0.5 + (value - 0.5) * contrast;

  return clamp01(curved);
}

function tick() {
  if (cfg.playing) {
    const dots = els.grid.querySelectorAll(".dot");

    for (let row = 0; row < cfg.rows; row++) {
      for (let col = 0; col < cfg.cols; col++) {
        dots[row * cfg.cols + col].style.opacity = getOpacity(col, row, cfg.t);
      }
    }

    cfg.t += cfg.speed * 0.01;
  }

  requestAnimationFrame(tick);
}

function bindControls() {
  els.cols.oninput = event => {
    cfg.cols = Number(event.target.value);
    syncLabels();
    buildGrid();
  };

  els.rows.oninput = event => {
    cfg.rows = Number(event.target.value);
    syncLabels();
    buildGrid();
  };

  els.scale.oninput = event => {
    cfg.gridScale = Number(event.target.value);
    syncLabels();
    applyGridScale();
  };

  els.dotSize.oninput = event => {
    cfg.dotSize = Number(event.target.value);
    syncLabels();
    buildGrid();
  };

  els.speed.oninput = event => {
    cfg.speed = Number(event.target.value);
    syncLabels();
  };

  els.noiseType.onchange = event => {
    cfg.noiseType = event.target.value;
  };

  els.noiseScale.oninput = event => {
    cfg.noiseScale = Number(event.target.value);
    syncLabels();
  };

  els.minOpacity.oninput = event => {
    cfg.minOpacity = Number(event.target.value);
    syncLabels();
  };

  els.maxOpacity.oninput = event => {
    cfg.maxOpacity = Number(event.target.value);
    syncLabels();
  };

  els.opacityContrast.oninput = event => {
    cfg.opacityContrast = Number(event.target.value);
    syncLabels();
  };

  els.randomSize.onchange = event => {
    cfg.randomSize = event.target.checked;
    buildGrid();
  };

  els.dotColor.oninput = event => {
    cfg.dotColor = event.target.value;
    buildGrid();
  };

  els.bgColor.oninput = event => {
    cfg.bgColor = event.target.value;
    applyBackgroundColor();
  };

  els.playPause.onclick = () => {
    cfg.playing = !cfg.playing;
    els.playPause.textContent = cfg.playing ? "Pause" : "Play";
  };

  els.exportCSS.onclick = () => download("dot-motion.css", createCSSExport());
  els.exportReact.onclick = () => download("DotMotion.jsx", createReactExport());
  els.exportSVG.onclick = () => download("dot-motion.svg", createSVGExport(), "image/svg+xml");
  els.exportGIF.onclick = exportGIF;
}

function getAnimationDuration() {
  return Math.max(0.4, 12 / cfg.speed);
}

function getExportDots() {
  const duration = getAnimationDuration();
  const liveDots = els.grid.querySelectorAll(".dot");
  const dots = [];

  for (let row = 0; row < cfg.rows; row++) {
    for (let col = 0; col < cfg.cols; col++) {
      const index = row * cfg.cols + col;
      const size = parseFloat(liveDots[index]?.style.width) || cfg.dotSize;
      const phase = applyOpacityContrast(getNoiseValue(col, row, 0));

      dots.push({
        size: Number(size.toFixed(2)),
        delay: Number((-phase * duration).toFixed(3))
      });
    }
  }

  return dots;
}

function createMarkup() {
  return Array.from({ length: cfg.rows * cfg.cols }, () => '  <span class="dot-motion-dot"></span>')
    .join("\n");
}

function createCSSExport() {
  const duration = getAnimationDuration();
  const minOpacity = Math.min(cfg.minOpacity, cfg.maxOpacity) / 100;
  const maxOpacity = Math.max(cfg.minOpacity, cfg.maxOpacity) / 100;
  const dotRules = getExportDots().map((dot, index) => {
    const sizeRules = cfg.randomSize
      ? `\n  width: ${dot.size}px;\n  height: ${dot.size}px;`
      : "";

    return `.dot-motion-dot:nth-child(${index + 1}) {${sizeRules}\n  animation-delay: ${dot.delay}s;\n}`;
  }).join("\n\n");

  return `/* Noise: ${cfg.noiseType}, scale: ${cfg.noiseScale}%, opacity: ${cfg.minOpacity}%-${cfg.maxOpacity}%, contrast: ${cfg.opacityContrast}%
Background: ${cfg.bgColor}

Usage:
<div class="dot-motion-grid">
${createMarkup()}
</div>
*/

.dot-motion-grid {
  display: grid;
  grid-template-columns: repeat(${cfg.cols}, ${cfg.dotSize + 6}px);
  gap: 10px;
  padding: 40px;
  width: max-content;
  background: ${cfg.bgColor};
  transform: scale(${cfg.gridScale / 100});
  transform-origin: center;
}

.dot-motion-dot {
  display: block;
  width: ${cfg.dotSize}px;
  height: ${cfg.dotSize}px;
  border-radius: 50%;
  background: ${cfg.dotColor};
  animation: dot-motion-opacity ${duration.toFixed(3)}s ease-in-out infinite both;
}

${dotRules}

@keyframes dot-motion-opacity {
  0%, 100% {
    opacity: ${minOpacity};
  }

  50% {
    opacity: ${maxOpacity};
  }
}
`;
}

function createReactExport() {
  const duration = getAnimationDuration();
  const minOpacity = Math.min(cfg.minOpacity, cfg.maxOpacity) / 100;
  const maxOpacity = Math.max(cfg.minOpacity, cfg.maxOpacity) / 100;
  const dots = JSON.stringify(getExportDots(), null, 2);

  return `import React from "react";

// Noise: ${cfg.noiseType}, scale: ${cfg.noiseScale}%, opacity: ${cfg.minOpacity}%-${cfg.maxOpacity}%, contrast: ${cfg.opacityContrast}%
// Background: ${cfg.bgColor}
const dots = ${dots};

export default function DotMotion({ className = "", style }) {
  return (
    <div
      className={\`dot-motion-grid \${className}\`.trim()}
      style={style}
      aria-hidden="true"
    >
      {dots.map((dot, index) => (
        <span
          className="dot-motion-dot"
          key={index}
          style={{
            width: dot.size,
            height: dot.size,
            animationDelay: \`\${dot.delay}s\`
          }}
        />
      ))}

      <style>{\`
        .dot-motion-grid {
          display: grid;
          grid-template-columns: repeat(${cfg.cols}, ${cfg.dotSize + 6}px);
          gap: 10px;
          padding: 40px;
          width: max-content;
          background: ${cfg.bgColor};
          transform: scale(${cfg.gridScale / 100});
          transform-origin: center;
        }

        .dot-motion-dot {
          display: block;
          border-radius: 50%;
          background: ${cfg.dotColor};
          animation: dot-motion-opacity ${duration.toFixed(3)}s ease-in-out infinite both;
        }

        @keyframes dot-motion-opacity {
          0%, 100% {
            opacity: ${minOpacity};
          }

          50% {
            opacity: ${maxOpacity};
          }
        }
      \`}</style>
    </div>
  );
}
`;
}

function createSVGExport() {
  const duration = getAnimationDuration();
  const minOpacity = Math.min(cfg.minOpacity, cfg.maxOpacity) / 100;
  const maxOpacity = Math.max(cfg.minOpacity, cfg.maxOpacity) / 100;
  const dots = getExportDots();
  const padding = 40;
  const cell = cfg.dotSize + 6;
  const width = padding * 2 + cfg.cols * cell - 6;
  const height = padding * 2 + cfg.rows * cell - 6;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = cfg.gridScale / 100;
  const circles = dots.map((dot, index) => {
    const col = index % cfg.cols;
    const row = Math.floor(index / cfg.cols);
    const cx = padding + col * cell + cfg.dotSize / 2;
    const cy = padding + row * cell + cfg.dotSize / 2;
    const radius = dot.size / 2;

    return `  <circle class="dot" cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${radius.toFixed(2)}" style="animation-delay:${dot.delay}s" />`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Dot motion animation">
  <style>
    .bg {
      fill: ${cfg.bgColor};
    }

    .dot {
      fill: ${cfg.dotColor};
      animation: dot-motion-opacity ${duration.toFixed(3)}s ease-in-out infinite both;
    }

    @keyframes dot-motion-opacity {
      0%, 100% {
        opacity: ${minOpacity};
      }

      50% {
        opacity: ${maxOpacity};
      }
    }
  </style>
  <rect class="bg" width="100%" height="100%" />
  <g transform="translate(${centerX.toFixed(2)} ${centerY.toFixed(2)}) scale(${scale}) translate(${-centerX.toFixed(2)} ${-centerY.toFixed(2)})">
${circles}
  </g>
</svg>
`;
}

function exportGIF() {
  const frameCount = 36;
  const frameDelay = 6;
  const frames = createGIFFrames(frameCount);
  const bytes = encodeGIF(frames, frameDelay);

  download("dot-motion.gif", new Uint8Array(bytes), "image/gif");
}

function createGIFFrames(frameCount) {
  const padding = 40;
  const cell = cfg.dotSize + 6;
  const baseWidth = padding * 2 + cfg.cols * cell - 6;
  const baseHeight = padding * 2 + cfg.rows * cell - 6;
  const scale = cfg.gridScale / 100;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const width = Math.max(1, Math.round(baseWidth * scale));
  const height = Math.max(1, Math.round(baseHeight * scale));
  const bg = hexToRgb(cfg.bgColor);
  const dot = hexToRgb(cfg.dotColor);
  const palette = createOpacityPalette(bg, dot);
  const frames = [];

  canvas.width = width;
  canvas.height = height;

  for (let frame = 0; frame < frameCount; frame++) {
    const progress = frame / frameCount;
    const loopSpan = Math.PI * 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = cfg.bgColor;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = cfg.dotColor;

    for (let row = 0; row < cfg.rows; row++) {
      for (let col = 0; col < cfg.cols; col++) {
        const index = row * cfg.cols + col;
        const size = cfg.randomSize
          ? cfg.dotSize * (0.65 + seededNoise(index, 0) * 0.7)
          : cfg.dotSize;
        const opacity = getLoopedOpacity(col, row, progress, loopSpan);
        const x = (padding + col * cell + cfg.dotSize / 2) * scale;
        const y = (padding + row * cell + cfg.dotSize / 2) * scale;
        const radius = (size / 2) * scale;

        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    frames.push(quantizeFrame(ctx.getImageData(0, 0, width, height).data, width, height, palette));
  }

  return {
    width,
    height,
    palette,
    indices: frames
  };
}

function getLoopedOpacity(col, row, progress, loopSpan) {
  const current = getOpacity(col, row, progress * loopSpan);
  const wrapped = getOpacity(col, row, (progress - 1) * loopSpan);

  return lerp(current, wrapped, progress);
}

function createOpacityPalette(bg, dot) {
  const palette = [];

  for (let i = 0; i < 64; i++) {
    const opacity = i / 63;

    palette.push([
      Math.round(bg.r + (dot.r - bg.r) * opacity),
      Math.round(bg.g + (dot.g - bg.g) * opacity),
      Math.round(bg.b + (dot.b - bg.b) * opacity)
    ]);
  }

  return palette;
}

function quantizeFrame(data, width, height, palette) {
  const indices = new Uint8Array(width * height);

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    indices[p] = nearestPaletteIndex(data[i], data[i + 1], data[i + 2], palette);
  }

  return indices;
}

function nearestPaletteIndex(r, g, b, palette) {
  let best = 0;
  let bestDistance = Infinity;

  for (let i = 0; i < palette.length; i++) {
    const pr = palette[i][0];
    const pg = palette[i][1];
    const pb = palette[i][2];
    const distance = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;

    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  }

  return best;
}

function encodeGIF(frames, delay) {
  const bytes = [];
  const colorTableSize = 64;
  const colorTableCode = 5;

  writeString(bytes, "GIF89a");
  writeShort(bytes, frames.width);
  writeShort(bytes, frames.height);
  bytes.push(0x80 | 0x70 | colorTableCode);
  bytes.push(0);
  bytes.push(0);

  for (let i = 0; i < colorTableSize; i++) {
    const color = frames.palette[i] || [0, 0, 0];
    bytes.push(color[0], color[1], color[2]);
  }

  writeString(bytes, "\x21\xff\x0bNETSCAPE2.0\x03\x01");
  writeShort(bytes, 0);
  bytes.push(0);

  frames.indices.forEach(indices => {
    bytes.push(0x21, 0xf9, 0x04, 0x00);
    writeShort(bytes, delay);
    bytes.push(0x00, 0x00);

    bytes.push(0x2c);
    writeShort(bytes, 0);
    writeShort(bytes, 0);
    writeShort(bytes, frames.width);
    writeShort(bytes, frames.height);
    bytes.push(0x00);

    bytes.push(6);
    writeSubBlocks(bytes, lzwEncode(indices, 6));
  });

  bytes.push(0x3b);
  return bytes;
}

function lzwEncode(indices, minCodeSize) {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let nextCode = endCode + 1;
  let codeSize = minCodeSize + 1;
  const output = [];
  let bitBuffer = 0;
  let bitCount = 0;
  const dictionary = new Map();

  function writeCode(code) {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;

    while (bitCount >= 8) {
      output.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  }

  function resetDictionary() {
    dictionary.clear();
    for (let i = 0; i < clearCode; i++) {
      dictionary.set(String(i), i);
    }
    nextCode = endCode + 1;
    codeSize = minCodeSize + 1;
  }

  resetDictionary();
  writeCode(clearCode);

  let phrase = String(indices[0]);

  for (let i = 1; i < indices.length; i++) {
    const current = String(indices[i]);
    const combined = `${phrase},${current}`;

    if (dictionary.has(combined)) {
      phrase = combined;
    } else {
      writeCode(dictionary.get(phrase));

      if (nextCode < 4096) {
        dictionary.set(combined, nextCode++);
        if (nextCode === (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      } else {
        writeCode(clearCode);
        resetDictionary();
      }

      phrase = current;
    }
  }

  writeCode(dictionary.get(phrase));
  writeCode(endCode);

  if (bitCount > 0) {
    output.push(bitBuffer & 0xff);
  }

  return output;
}

function writeSubBlocks(bytes, data) {
  for (let i = 0; i < data.length; i += 255) {
    const block = data.slice(i, i + 255);
    bytes.push(block.length, ...block);
  }

  bytes.push(0);
}

function writeString(bytes, value) {
  for (let i = 0; i < value.length; i++) {
    bytes.push(value.charCodeAt(i));
  }
}

function writeShort(bytes, value) {
  bytes.push(value & 0xff, (value >> 8) & 0xff);
}

function download(name, content, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");

  link.href = url;
  link.download = name;
  link.click();

  URL.revokeObjectURL(url);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function gradientDot(ix, iy, x, y) {
  const angle = seededNoise(ix, iy) * Math.PI * 2;
  const gx = Math.cos(angle);
  const gy = Math.sin(angle);

  return gx * x + gy * y;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function fract(value) {
  return value - Math.floor(value);
}

syncLabels();
bindControls();
buildGrid();
applyBackgroundColor();
tick();
