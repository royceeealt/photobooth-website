// Composes the final Polaroid at full resolution (1080px wide) and returns
// a PNG data URL. Layer order mirrors the on-screen preview:
//   design/base -> photos -> overlap layer -> avatars -> props

import { buildOverlapLayer } from "./polaroidOverlay.js";
import { renderAvatarCanvas, AVATAR_BASE_SIZE } from "./avatarRenderer.js";
import { getProp, getPropBaseSize } from "../data/propCatalog.js";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

// Same behaviour as CSS object-fit: cover (centered crop).
function drawCover(ctx, img, slot) {
  const { x, y, width: dw, height: dh } = slot;

  const scale = Math.max(dw / img.width, dh / img.height);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;

  ctx.drawImage(img, sx, sy, sw, sh, x, y, dw, dh);
}

export async function renderPolaroid({
  template,
  design,
  photos,
  avatars = [],
  avatarPlacements = [],
  propPlacements = [],
}) {
  const { width, height } = template.canvas;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Design (or blank base)
  const designImg = await loadImage(design?.image || template.baseImage);
  ctx.drawImage(designImg, 0, 0, width, height);

  // 2. Photos
  for (let i = 0; i < template.photoSlots.length; i++) {
    const photo = photos[i];
    if (!photo) continue;

    const img = await loadImage(photo.imageDataUrl);
    drawCover(ctx, img, template.photoSlots[i]);
  }

  // 3. Decorations that overlap the photos
  if (design) {
    const overlayUrl = await buildOverlapLayer(
      design.image,
      template.photoSlots,
      template.canvas
    );
    const overlayImg = await loadImage(overlayUrl);
    ctx.drawImage(overlayImg, 0, 0, width, height);
  }

  // Avatars and props are pixel art: no smoothing.
  ctx.imageSmoothingEnabled = false;

  // 4. Avatars
  for (const placement of avatarPlacements) {
    const config = avatars[placement.avatarIndex];
    if (!config) continue; // avatar no longer exists

    const sprite = await renderAvatarCanvas(config);
    const w = AVATAR_BASE_SIZE.width * placement.scale;
    const h = AVATAR_BASE_SIZE.height * placement.scale;

    ctx.drawImage(sprite, placement.x - w / 2, placement.y - h / 2, w, h);
  }

  // 5. Props (on top of avatars)
  for (const placement of propPlacements) {
    const prop = getProp(placement.propId);
    if (!prop) continue; // prop no longer in the catalog

    const img = await loadImage(prop.image);
    const base = getPropBaseSize(prop);
    const w = base.width * placement.scale;
    const h = base.height * placement.scale;

    ctx.drawImage(img, placement.x - w / 2, placement.y - h / 2, w, h);
  }

  return canvas.toDataURL("image/png");
}