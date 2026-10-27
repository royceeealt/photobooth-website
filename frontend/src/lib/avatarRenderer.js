// Draws an avatar using the sprite layers stored in MongoDB/Cloudinary.
//
// This renderer uses the same layer order and recolouring approach as
// CharacterPreview.jsx and PixelSprite.jsx.
//
// Important:
// - Database categories use names such as "bodyType" and "accessories".
// - Database asset fields are "assetUrl" and "halfAssetUrl".
// - Item IDs are numeric and can include 0.
// - In half view, only eyes use their halfAssetUrl when available.
// - Clothing and footwear are drawn only in full view.

import { loadItemCatalog } from "./itemCatalog.js";

const SPRITE_W = 124;
const SPRITE_H = 127;

// Base rendered size at scale 3.
export const AVATAR_BASE_SIZE = {
  width: SPRITE_W * 3,
  height: SPRITE_H * 3,
};

// Cache the catalog request so it only needs to be loaded once.
let catalogPromise = null;

function getCatalog() {
  if (!catalogPromise) {
    catalogPromise = loadItemCatalog().catch((error) => {
      // Allow a later call to retry if loading fails.
      catalogPromise = null;
      throw error;
    });
  }

  return catalogPromise;
}

// Cache loaded images to avoid downloading the same asset repeatedly.
const imageCache = new Map();

function loadImage(src) {
  if (!src) {
    return Promise.reject(new Error("An image source was not provided."));
  }

  if (!imageCache.has(src)) {
    const imagePromise = new Promise((resolve, reject) => {
      const image = new Image();

      // Must be set before assigning src for cross-origin canvas use.
      image.crossOrigin = "anonymous";

      image.onload = () => resolve(image);

      image.onerror = () => {
        reject(new Error(`Could not load avatar asset: ${src}`));
      };

      image.src = src;
    });

    imageCache.set(src, imagePromise);

    // Remove failed requests from the cache so they can be retried.
    imagePromise.catch(() => {
      imageCache.delete(src);
    });
  }

  return imageCache.get(src);
}

// Convert a hex colour such as "#B97856" into RGB values.
function hexToRgb(hex) {
  if (typeof hex !== "string") {
    throw new Error(`Invalid colour value: ${hex}`);
  }

  let clean = hex.replace("#", "").trim();

  // Support shorthand hex colours such as #abc.
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((character) => character + character)
      .join("");
  }

  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    throw new Error(`Invalid hex colour: ${hex}`);
  }

  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

// Recolour a sprite while retaining transparency and dark outlines.
// The brightness of each original pixel is used to preserve shading.
function tintedLayer(image, color) {
  const canvas = document.createElement("canvas");

  canvas.width = SPRITE_W;
  canvas.height = SPRITE_H;

  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    throw new Error("Could not create the avatar canvas context.");
  }

  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0, SPRITE_W, SPRITE_H);

  const imageData = context.getImageData(
    0,
    0,
    SPRITE_W,
    SPRITE_H
  );

  const pixels = imageData.data;
  const target = hexToRgb(color);

  for (let i = 0; i < pixels.length; i += 4) {
    // Preserve completely transparent pixels.
    if (pixels[i + 3] === 0) {
      continue;
    }

    // Keep dark outlines unchanged.
    const brightness =
      (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;

    if (brightness < 70) {
      continue;
    }

    // Preserve the sprite's original light and dark shading.
    const shade = brightness / 176;

    pixels[i] = Math.min(255, target.r * shade);
    pixels[i + 1] = Math.min(255, target.g * shade);
    pixels[i + 2] = Math.min(255, target.b * shade);
  }

  context.putImageData(imageData, 0, 0);

  return canvas;
}

// Find a catalog item by its database category and numeric item ID.
// Number conversion also supports configurations that contain string IDs.
function findItem(catalog, category, id) {
  if (id === null || id === undefined) {
    return undefined;
  }

  const items = catalog?.[category];

  if (!Array.isArray(items)) {
    return undefined;
  }

  return items.find((item) => Number(item.id) === Number(id));
}

// Get the full asset URL for a selected item.
function getAssetUrl(catalog, category, id) {
  return findItem(catalog, category, id)?.assetUrl;
}

// Eyes are the only layer that uses the half-view asset when available.
function getEyeAssetUrl(catalog, id, isHalfView) {
  const item = findItem(catalog, "eyes", id);

  if (!item) {
    return undefined;
  }

  if (isHalfView && item.halfAssetUrl) {
    return item.halfAssetUrl;
  }

  return item.assetUrl;
}

// Returns a transparent 124x127 canvas containing the rendered avatar.
export async function renderAvatarCanvas(config = {}, view = "full") {
  const catalog = await getCatalog();

  const isHalfView = view === "half";
  const isFullView = !isHalfView;

  const layers = [];

  // 1. Body
  // Use the regular body asset in both views to preserve alignment.
  if (config.body !== null && config.body !== undefined) {
    layers.push({
      src: getAssetUrl(catalog, "bodyType", config.body),
      color: config.skinColor || "#B97856",
    });
  }

  // 2. Eyes
  // Only the eyes switch to a half-view asset when one exists.
  if (config.eyes !== null && config.eyes !== undefined) {
    layers.push({
      src: getEyeAssetUrl(catalog, config.eyes, isHalfView),
      color: config.eyesColor || "#222222",
    });
  }

  // 3. Lips
  // Always use the regular asset to preserve its position and scale.
  if (config.lips !== null && config.lips !== undefined) {
    layers.push({
      src: getAssetUrl(catalog, "lips", config.lips),
      color: config.lipsColor || "#B05A78",
    });
  }

  // Clothing and footwear are rendered only for full-body output.

  // 4. Bottom
  if (
    isFullView &&
    config.bottom !== null &&
    config.bottom !== undefined
  ) {
    layers.push({
      src: getAssetUrl(catalog, "bottom", config.bottom),
      color: config.bottomColor || "#B0B0B0",
    });
  }

  // 5. Top
  if (
    isFullView &&
    config.top !== null &&
    config.top !== undefined
  ) {
    layers.push({
      src: getAssetUrl(catalog, "top", config.top),
      color: config.topColor || "#B0B0B0",
    });
  }

  // 6. Footwear
  if (
    isFullView &&
    config.footwear !== null &&
    config.footwear !== undefined
  ) {
    layers.push({
      src: getAssetUrl(catalog, "footwear", config.footwear),
      color: config.footwearColor || "#222222",
    });
  }

  // 7. Hair
  // Use the regular asset in both views to avoid shifting the hair.
  if (config.hair !== null && config.hair !== undefined) {
    layers.push({
      src: getAssetUrl(catalog, "hair", config.hair),
      color: config.hairColor || "#222222",
    });
  }

  // 8. Accessories
  // The current avatar configuration and database use "accessories".
  // The singular fallback supports older saved configurations.
  const accessoryId = config.accessories ?? config.accessory;

  if (accessoryId !== null && accessoryId !== undefined) {
    layers.push({
      src: getAssetUrl(catalog, "accessories", accessoryId),
      color: config.accessoryColor || "#222222",
    });
  }

  // Create the final transparent canvas.
  const output = document.createElement("canvas");

  output.width = SPRITE_W;
  output.height = SPRITE_H;

  const context = output.getContext("2d");

  if (!context) {
    throw new Error("Could not create the final avatar canvas.");
  }

  context.imageSmoothingEnabled = false;

  // Draw each layer in order so later layers appear on top.
  for (const layer of layers) {
    if (!layer.src) {
      // A missing optional asset should not stop the entire avatar render.
      continue;
    }

    const image = await loadImage(layer.src);
    const tintedCanvas = tintedLayer(image, layer.color);

    context.drawImage(tintedCanvas, 0, 0);
  }

  return output;
}

// Fields that affect the final avatar image.
// These are included in the data URL cache key.
const KEY_FIELDS = [
  "body",
  "eyes",
  "lips",
  "bottom",
  "top",
  "footwear",
  "hair",
  "accessories",
  "accessory",
  "skinColor",
  "eyesColor",
  "lipsColor",
  "bottomColor",
  "topColor",
  "footwearColor",
  "hairColor",
  "accessoryColor",
];

const dataUrlCache = new Map();

// Render the avatar and return its PNG data URL.
// Repeated requests for the same avatar and view use the cached result.
export async function avatarToDataUrl(config = {}, view = "full") {
  const key =
    view +
    "|" +
    KEY_FIELDS.map((field) => config[field] ?? "").join("|");

  if (!dataUrlCache.has(key)) {
    const renderPromise = renderAvatarCanvas(config, view)
      .then((canvas) => canvas.toDataURL("image/png"))
      .catch((error) => {
        // Permit another attempt if rendering fails.
        dataUrlCache.delete(key);
        throw error;
      });

    dataUrlCache.set(key, renderPromise);
  }

  return dataUrlCache.get(key);
}