"use strict";

/**
 * Universal Canvas Helper for Floppa-Chatbot
 * Gracefully resolves @napi-rs/canvas or node-canvas
 */

let createCanvas = null;
let loadImage = null;
let isCanvasAvailable = false;

// 1. Try @napi-rs/canvas
try {
  const napi = require("@napi-rs/canvas");
  const cFunc = napi.createCanvas || napi.default?.createCanvas;
  const lFunc = napi.loadImage || napi.default?.loadImage;
  if (typeof cFunc === "function" && typeof lFunc === "function") {
    createCanvas = cFunc;
    loadImage = lFunc;
    isCanvasAvailable = true;
  }
} catch (_) {}

// 2. Try node-canvas (canvas)
if (!isCanvasAvailable) {
  try {
    const nodeCanvas = require("canvas");
    const cFunc = nodeCanvas.createCanvas || nodeCanvas.default?.createCanvas;
    const lFunc = nodeCanvas.loadImage || nodeCanvas.default?.loadImage;
    if (typeof cFunc === "function" && typeof lFunc === "function") {
      createCanvas = cFunc;
      loadImage = lFunc;
      isCanvasAvailable = true;
    }
  } catch (_) {}
}

async function renderJailEffect(imageSource) {
  if (!isCanvasAvailable || typeof createCanvas !== "function" || typeof loadImage !== "function") {
    throw new Error("Canvas is not available on this platform");
  }

  let img;
  if (typeof imageSource === "string" && imageSource.startsWith("http")) {
    const axios = require("axios");
    const res = await axios.get(imageSource, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    img = await loadImage(Buffer.from(res.data));
  } else if (Buffer.isBuffer(imageSource)) {
    img = await loadImage(imageSource);
  } else {
    img = await loadImage(imageSource);
  }

  const width = img.width || 512;
  const height = img.height || 512;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 1. Draw original image
  ctx.drawImage(img, 0, 0, width, height);

  // 2. Prison bars configuration
  const barCount = Math.max(5, Math.floor(width / 70));
  const barWidth = Math.max(8, Math.floor(width / 36));
  const spacing = width / (barCount + 1);

  // 3. Horizontal support crossbars (one at ~18%, one at ~82%)
  const horizY = [height * 0.18, height * 0.82];
  const horizHeight = Math.max(10, Math.floor(barWidth * 1.1));

  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  for (const y of horizY) {
    ctx.fillRect(0, y - horizHeight / 2 + 4, width, horizHeight);
  }
  for (const y of horizY) {
    ctx.fillStyle = "#2d3436";
    ctx.fillRect(0, y - horizHeight / 2, width, horizHeight);
    ctx.fillStyle = "#636e72";
    ctx.fillRect(0, y - horizHeight / 2 + 2, width, Math.max(2, Math.floor(horizHeight * 0.25)));
  }

  // 4. Vertical iron bars
  for (let i = 1; i <= barCount; i++) {
    const x = Math.round(i * spacing - barWidth / 2);

    // Drop shadow behind bar
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(x + Math.max(3, Math.floor(barWidth * 0.25)), 0, barWidth, height);

    // Main steel iron bar
    ctx.fillStyle = "#2d3436";
    ctx.fillRect(x, 0, barWidth, height);

    // Highlight stripe (specular cylinder shine)
    ctx.fillStyle = "#636e72";
    ctx.fillRect(x + Math.floor(barWidth * 0.2), 0, Math.max(2, Math.floor(barWidth * 0.25)), height);

    ctx.fillStyle = "#dfe6e9";
    ctx.fillRect(x + Math.floor(barWidth * 0.25), 0, Math.max(1, Math.floor(barWidth * 0.1)), height);

    // Rivets / bolts at intersections
    for (const y of horizY) {
      const r = Math.max(3, Math.floor(barWidth * 0.35));
      ctx.beginPath();
      ctx.arc(x + barWidth / 2, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "#1e272e";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x + barWidth / 2 - 1, y - 1, Math.max(1, Math.floor(r * 0.4)), 0, Math.PI * 2);
      ctx.fillStyle = "#b2bec3";
      ctx.fill();
    }
  }

  // 5. Dark atmospheric vignette overlay
  const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.75);
  grad.addColorStop(0, "rgba(0, 0, 0, 0)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.5)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  return canvas.toBuffer("image/png");
}

function createDefaultAvatar(name = "User", size = 500) {
  if (!isCanvasAvailable || typeof createCanvas !== "function") return null;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Modern vibrant gradient palettes
  const palettes = [
    ["#4158D0", "#C850C0", "#FFCC70"],
    ["#FA8BFF", "#2BD2FF", "#2BFF88"],
    ["#FBAB7E", "#F7CE68"],
    ["#85FFBD", "#FFFB7D"],
    ["#8EC5FC", "#E0C3FC"],
    ["#FF9A8B", "#FF6A88", "#FF99AC"],
    ["#1e3c72", "#2a5298"]
  ];
  const charCode = (name && name[0] ? name.charCodeAt(0) : 65);
  const selectedPalette = palettes[charCode % palettes.length];

  const grad = ctx.createLinearGradient(0, 0, size, size);
  selectedPalette.forEach((c, idx) => {
    grad.addColorStop(idx / (selectedPalette.length - 1 || 1), c);
  });
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Subtle circular inner glow
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  ctx.fill();

  // Initial letter
  const initial = (name ? String(name).trim()[0] : "?").toUpperCase();
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(size * 0.45)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = Math.round(size * 0.05);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.round(size * 0.02);
  ctx.fillText(initial, size / 2, size / 2 + Math.round(size * 0.02));

  return canvas;
}

async function loadAvatarOrFallback(urlOrBuffer, fallbackName = "User", size = 500) {
  if (!isCanvasAvailable || typeof loadImage !== "function") return null;

  if (urlOrBuffer && typeof urlOrBuffer === "string" && /^https?:\/\//i.test(urlOrBuffer)) {
    try {
      const axios = require("axios");
      const res = await axios.get(urlOrBuffer, {
        responseType: "arraybuffer",
        timeout: 12000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
        }
      });
      if (res.data && res.data.length > 0) {
        return await loadImage(Buffer.from(res.data));
      }
    } catch (_) {}
  } else if (Buffer.isBuffer(urlOrBuffer) && urlOrBuffer.length > 0) {
    try {
      return await loadImage(urlOrBuffer);
    } catch (_) {}
  }

  // Fallback to beautiful generated avatar
  const fallbackCanvas = createDefaultAvatar(fallbackName, size);
  if (fallbackCanvas) {
    try {
      return await loadImage(fallbackCanvas.toBuffer("image/png"));
    } catch (_) {
      return fallbackCanvas;
    }
  }
  return null;
}

module.exports = {
  createCanvas,
  loadImage,
  isCanvasAvailable,
  renderJailEffect,
  createDefaultAvatar,
  loadAvatarOrFallback
};
