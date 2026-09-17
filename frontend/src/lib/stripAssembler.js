// Stitches the confirmed (avatar-composited) photos into a single
// photobooth-style strip image.

/**
 * photos: [{ imageDataUrl }] in the order they were captured
 * options: { columns = 1, gap = 8, background = "#ffffff" }
 */
export async function assembleStrip(photos, options = {}) {
  const { columns = 1, gap = 8, background = "#ffffff" } = options;

  const images = await Promise.all(photos.map((p) => loadImage(p.imageDataUrl)));
  if (images.length === 0) throw new Error("No photos to assemble");

  const cellWidth = Math.max(...images.map((img) => img.width));
  const cellHeight = Math.max(...images.map((img) => img.height));
  const rows = Math.ceil(images.length / columns);

  const canvas = document.createElement("canvas");
  canvas.width = columns * cellWidth + (columns + 1) * gap;
  canvas.height = rows * cellHeight + (rows + 1) * gap;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  images.forEach((img, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = gap + col * (cellWidth + gap);
    const y = gap + row * (cellHeight + gap);
    ctx.drawImage(img, x, y, cellWidth, cellHeight);
  });

  // TODO: optional branding/footer (logo, date) before export
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
