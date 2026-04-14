const cfg = {
  cols: 20,
  rows: 2,
  dotSize: 10,
  gridScale: 100,
  randomSize: false,
  dotColor: "#ffffff",
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
  randomSize: document.getElementById("randomSize"),
  dotColor: document.getElementById("dotColor"),
  playPause: document.getElementById("playPause"),
  exportCSS: document.getElementById("exportCSS"),
  exportReact: document.getElementById("exportReact"),
  colsVal: document.getElementById("colsVal"),
  rowsVal: document.getElementById("rowsVal"),
  scaleVal: document.getElementById("scaleVal"),
  dotSizeVal: document.getElementById("dotSizeVal"),
  speedVal: document.getElementById("speedVal")
};

function syncLabels() {
  els.colsVal.textContent = cfg.cols;
  els.rowsVal.textContent = cfg.rows;
  els.scaleVal.textContent = `${cfg.gridScale}%`;
  els.dotSizeVal.textContent = cfg.dotSize;
  els.speedVal.textContent = cfg.speed;
}

function applyGridScale() {
  els.grid.style.transform = `scale(${cfg.gridScale / 100})`;
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

function smoothNoise(x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const xf = smoothStep(fract(x));
  const yf = smoothStep(fract(y));
  const top = lerp(seededNoise(x0, y0), seededNoise(x0 + 1, y0), xf);
  const bottom = lerp(seededNoise(x0, y0 + 1), seededNoise(x0 + 1, y0 + 1), xf);

  return lerp(top, bottom, yf);
}

function getOpacity(col, row, time) {
  const noise = smoothNoise(col * 0.8 + time, row * 1.6 + time * 0.35);
  return 0.12 + noise * 0.88;
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

  els.randomSize.onchange = event => {
    cfg.randomSize = event.target.checked;
    buildGrid();
  };

  els.dotColor.oninput = event => {
    cfg.dotColor = event.target.value;
    buildGrid();
  };

  els.playPause.onclick = () => {
    cfg.playing = !cfg.playing;
    els.playPause.textContent = cfg.playing ? "Pause" : "Play";
  };

  els.exportCSS.onclick = () => download("dot-motion.css", createCSSExport());
  els.exportReact.onclick = () => download("DotMotion.jsx", createReactExport());
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
      const phase = smoothNoise(col * 0.8, row * 1.6);

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
  const dotRules = getExportDots().map((dot, index) => {
    const sizeRules = cfg.randomSize
      ? `\n  width: ${dot.size}px;\n  height: ${dot.size}px;`
      : "";

    return `.dot-motion-dot:nth-child(${index + 1}) {${sizeRules}\n  animation-delay: ${dot.delay}s;\n}`;
  }).join("\n\n");

  return `/* Usage:
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
  background: transparent;
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
    opacity: 0.12;
  }

  50% {
    opacity: 1;
  }
}
`;
}

function createReactExport() {
  const duration = getAnimationDuration();
  const dots = JSON.stringify(getExportDots(), null, 2);

  return `import React from "react";

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
          background: transparent;
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
            opacity: 0.12;
          }

          50% {
            opacity: 1;
          }
        }
      \`}</style>
    </div>
  );
}
`;
}

function download(name, content) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  const link = document.createElement("a");

  link.href = url;
  link.download = name;
  link.click();

  URL.revokeObjectURL(url);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

function fract(value) {
  return value - Math.floor(value);
}

syncLabels();
bindControls();
buildGrid();
tick();
