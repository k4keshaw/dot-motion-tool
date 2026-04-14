const cfg = {
  cols: 10,
  rows: 10,
  dotSize: 10,
  randomSize: false,
  dotColor: "#ffffff",
  bgColor: "#000000",
  loopDuration: 5,
  playing: true,
  t: 0,
  mode: "wave"
};

/* BUILD GRID */
function buildGrid() {
  const g = document.getElementById("grid");
  g.innerHTML = "";
  g.style.gridTemplateColumns =
    `repeat(${cfg.cols}, ${cfg.dotSize + 6}px)`;

  for (let i = 0; i < cfg.rows * cfg.cols; i++) {
    const d = document.createElement("div");
    d.className = "dot";

    let size = cfg.randomSize
      ? Math.random() * cfg.dotSize + 4
      : cfg.dotSize;

    d.style.width = size + "px";
    d.style.height = size + "px";
    d.style.background = cfg.dotColor;

    g.appendChild(d);
  }
}
buildGrid();

/* PATTERN ENGINE */
function getOpacity(c, r, t) {
  const cx = c / (cfg.cols - 1);
  const cy = r / (cfg.rows - 1);
  const dx = cx - 0.5;
  const dy = cy - 0.5;

  let v = 0;

  switch (cfg.mode) {
    case "wave":
      v = Math.sin(t - cx * 6 - dy * 6);
      break;
    case "ripple":
      v = Math.sin(t - Math.sqrt(dx * dx + dy * dy) * 10);
      break;
    case "diagonal":
      v = Math.sin(t - (cx + cy) * 6);
      break;
    case "noise":
      v = Math.sin(cx * 10 + t) * Math.cos(cy * 10 - t);
      break;
    case "pulse":
      v = Math.sin(t * 2) * Math.exp(-(dx * dx + dy * dy) * 10);
      break;
    case "spiral":
      v = Math.sin(t - Math.atan2(dy, dx) * 4);
      break;
  }

  return 0.1 + ((v + 1) / 2) * 0.9;
}

/* ANIMATION */
function tick() {
  if (cfg.playing) {
    const dots = document.querySelectorAll(".dot");

    for (let r = 0; r < cfg.rows; r++) {
      for (let c = 0; c < cfg.cols; c++) {
        const op = getOpacity(c, r, cfg.t);

        const d = dots[r * cfg.cols + c];
        d.style.opacity = op;
        d.style.transform = `scale(${0.5 + op})`;
      }
    }

    cfg.t += 0.05;
  }

  requestAnimationFrame(tick);
}
tick();

/* MODE SWITCH */
document.getElementById("modes").onclick = e => {
  if (e.target.tagName === "BUTTON") {
    cfg.mode = e.target.dataset.mode;

    document.querySelectorAll("#modes button")
      .forEach(b => b.classList.remove("active"));

    e.target.classList.add("active");
  }
};

/* CONTROLS */
document.getElementById("d").oninput = e => {
  cfg.dotSize = +e.target.value;
  buildGrid();
};

document.getElementById("randomSizeToggle").onchange = e => {
  cfg.randomSize = e.target.checked;
  buildGrid();
};

document.getElementById("dotColor").oninput = e => {
  cfg.dotColor = e.target.value;
  buildGrid();
};

document.getElementById("bgColor").oninput = e => {
  document.body.style.background = e.target.value;
};

document.getElementById("randomBtn").onclick = () => {
  cfg.cols = Math.floor(Math.random() * 10) + 5;
  cfg.rows = Math.floor(Math.random() * 10) + 5;
  buildGrid();
};

document.getElementById("playPause").onclick = () => {
  cfg.playing = !cfg.playing;
};

/* EXPORT JSON */
document.getElementById("exportJSON").onclick = () => {
  download("dot-config.json", JSON.stringify(cfg, null, 2));
};

/* EXPORT HTML (SHAREABLE) */
document.getElementById("exportHTML").onclick = () => {
  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;background:${cfg.bgColor}">
<div id="grid"></div>
<script>
const cfg = ${JSON.stringify(cfg)};
${getOpacity.toString()}
(${buildGrid.toString()})();
<\/script>
</body>
</html>
`;
  download("dot-animation.html", html);
};

/* DOWNLOAD */
function download(name, content) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content]));
  a.download = name;
  a.click();
}