const FRAME_GRAY = 176;
const TOLERANCE = 2;
const imageCache = new Map();

function loadImage(src) {
  if (imageCache.has(src)) return imageCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => { imageCache.delete(src); reject(new Error(`Could not load ${src}`)); };
    img.src = src;
  });
  imageCache.set(src, promise);
  return promise;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export async function tintDesignImage(src, hexColor) {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const [nr, ng, nb] = hexToRgb(hexColor);

  for (let i = 0; i < data.length; i += 4) {
    if (
      data[i + 3] !== 0 &&
      Math.abs(data[i] - FRAME_GRAY) <= TOLERANCE &&
      Math.abs(data[i + 1] - FRAME_GRAY) <= TOLERANCE &&
      Math.abs(data[i + 2] - FRAME_GRAY) <= TOLERANCE
    ) {
      data[i] = nr; data[i + 1] = ng; data[i + 2] = nb;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}