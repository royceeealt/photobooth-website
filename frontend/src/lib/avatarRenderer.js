// Draws an avatar (the stack of recoloured 124x127 sprite layers) onto a
// canvas, outside React. Mirrors CharacterPreview.jsx (layer order, which
// layers appear in which view) and PixelSprite.jsx (recolour maths), so
// what you see in the avatar creator is what lands on the Polaroid.

import { loadItemCatalog } from "./itemCatalog.js";

const SPRITE_W = 124;
const SPRITE_H = 127;
// On-canvas size of an avatar at scale 1 (3x the sprite). Shared by the
// editor preview and the final renderer so they always match.
export const AVATAR_BASE_SIZE = {
  width: SPRITE_W * 3,
  height: SPRITE_H * 3,
};

let catalogPromise = null;
function getCatalog() {
  if (!catalogPromise) {
    catalogPromise = loadItemCatalog().catch((err) => {
      catalogPromise = null;
      throw err;
    });
  }
  return catalogPromise;
}

const imageCache = new Map();
function loadImage(src) {
  if (!imageCache.has(src)) {
    imageCache.set(
      src,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Could not load ${src}`));
        img.src = src;
      })
    );
  }
  return imageCache.get(src);
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

// Same recolour as PixelSprite: keep transparent pixels and dark outlines,
// scale the target colour by the sprite's original shading.
function tintedLayer(img, color) {
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE_W;
  canvas.height = SPRITE_H;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, SPRITE_W, SPRITE_H);

  const imageData = ctx.getImageData(0, 0, SPRITE_W, SPRITE_H);
  const pixels = imageData.data;
  const target = hexToRgb(color);

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] === 0) continue;

    const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    if (brightness < 70) continue;

    const shade = brightness / 176;
    pixels[i] = Math.min(255, target.r * shade);
    pixels[i + 1] = Math.min(255, target.g * shade);
    pixels[i + 2] = Math.min(255, target.b * shade);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function findItem(catalog, category, id) {
  return catalog[category]?.find((item) => item.id === id);
}

// Returns a 124x127 canvas with the avatar drawn on it.
export async function renderAvatarCanvas(config, view = "full") {
  const catalog = await getCatalog();
  const half = view === "half";
  const full = view === "full";

  // Same order as CharacterPreview. `src` is resolved the same way too.
  const layers = [];

  if (config.body) {
    const id = half ? "body_half" : config.body;
    const item = findItem(catalog, "body", id);
    layers.push({
      src: item && (half ? item.halfAssetPath || item.assetPath : item.assetPath),
      color: config.skinColor || "#B97856",
    });
  }

  if (config.eyes) {
    const item = findItem(catalog, "eyes", config.eyes);
    layers.push({
      src: half ? item?.halfAssetPath : item?.assetPath,
      color: config.eyesColor || "#222222",
    });
  }

  if (config.lips) {
    const item = findItem(catalog, "lips", config.lips);
    layers.push({
      src: item && (half ? item.halfAssetPath || item.assetPath : item.assetPath),
      color: config.lipsColor || "#B05A78",
    });
  }

  if (config.bottom && full) {
    layers.push({
      src: findItem(catalog, "bottom", config.bottom)?.assetPath,
      color: config.bottomColor || "#B0B0B0",
    });
  }

  if (config.top && full) {
    layers.push({
      src: findItem(catalog, "top", config.top)?.assetPath,
      color: config.topColor || "#B0B0B0",
    });
  }

  if (config.footwear && full) {
    layers.push({
      src: findItem(catalog, "footwear", config.footwear)?.assetPath,
      color: config.footwearColor || "#222222",
    });
  }

  if (config.hair) {
    const item = findItem(catalog, "hair", config.hair);
    layers.push({
      src: item && (half ? item.halfAssetPath || item.assetPath : item.assetPath),
      color: config.hairColor || "#222222",
    });
  }

  if (config.accessory) {
    layers.push({
      src: findItem(catalog, "accessory", config.accessory)?.assetPath,
      color: config.accessoryColor || "#222222",
    });
  }

  const output = document.createElement("canvas");
  output.width = SPRITE_W;
  output.height = SPRITE_H;

  const ctx = output.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  for (const layer of layers) {
    if (!layer.src) continue;
    const img = await loadImage(layer.src);
    ctx.drawImage(tintedLayer(img, layer.color), 0, 0);
  }

  return output;
}

// Convenience for <img src=...>. Cached per avatar look.
const KEY_FIELDS = [
  "body", "eyes", "lips", "bottom", "top", "footwear", "hair", "accessory",
  "skinColor", "eyesColor", "lipsColor", "bottomColor", "topColor",
  "footwearColor", "hairColor", "accessoryColor",
];
const dataUrlCache = new Map();

export async function avatarToDataUrl(config, view = "full") {
  const key =
    view + "|" + KEY_FIELDS.map((f) => config[f] ?? "").join("|");

  if (!dataUrlCache.has(key)) {
    dataUrlCache.set(
      key,
      renderAvatarCanvas(config, view)
        .then((canvas) => canvas.toDataURL("image/png"))
        .catch((err) => {
          dataUrlCache.delete(key);
          throw err;
        })
    );
  }
  return dataUrlCache.get(key);
}