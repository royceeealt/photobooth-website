// Canvas helpers for grabbing a frame from the live video feed and
// compositing the chosen avatar layers on top of a captured photo.

/**
 * Snapshot the current frame of a <video> element to a data URL.
 */
export function captureFrame(videoEl, { width, height } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = width || videoEl.videoWidth;
  canvas.height = height || videoEl.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

/**
 * Draw the avatar (skinTone -> hair -> accessory layers) onto a base photo
 * at the given placement, returning a new composited data URL.
 * avatarConfig: { skinTone, hair, accessory } (asset paths)
 * placement: { x, y, scale }
 */
export async function compositeAvatarOntoFrame(baseImageDataUrl, avatarConfig, placement) {
  const [baseImg, ...layerImgs] = await Promise.all(
    [baseImageDataUrl, avatarConfig.skinTone, avatarConfig.hair, avatarConfig.accessory]
      .filter(Boolean)
      .map(loadImage)
  );

  const canvas = document.createElement("canvas");
  canvas.width = baseImg.width;
  canvas.height = baseImg.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(baseImg, 0, 0);

  // TODO: tune layer size/anchor so avatar sprites line up consistently
  const { x = 0, y = 0, scale = 1 } = placement || {};
  layerImgs.forEach((layer) => {
    ctx.drawImage(layer, x, y, layer.width * scale, layer.height * scale);
  });

  return canvas.toDataURL("image/png");
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
