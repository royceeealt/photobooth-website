// Builds a transparent "overlap layer" from a flattened Polaroid design PNG.
//
// Each design has a flat placeholder colour inside every photo slot
// (white, off-white, gray... it varies per design), with decorations
// (e.g. a macaron) drawn on top. If we draw the photos over the whole
// design, those decorations get hidden. So we copy only the pixels inside
// each slot that are NOT the placeholder colour; drawn above the photos,
// they restore the decorations that overlap the photo.

const COLOR_TOLERANCE = 6; // per-channel difference still counted as "placeholder"
const GRAY_SPREAD = 6;     // max channel difference for a pixel to count as "neutral"
const GRAY_MIN = 150;      // neutral pixels at/above this brightness are "light gray"
const EDGE_MARGIN = 3;     // px of design copied just outside each slot (covers photo-edge bleed)

const cache = new Map();

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

// The slot's placeholder = its most common colour.
function dominantColor(data) {
  const counts = new Map();
  let best = 0;
  let bestKey = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;

    const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
    const n = (counts.get(key) || 0) + 1;
    counts.set(key, n);

    if (n > best) {
      best = n;
      bestKey = key;
    }
  }

  return [(bestKey >> 16) & 255, (bestKey >> 8) & 255, bestKey & 255];
}

function matchesAt(data, width, x, y, color) {
  const i = (y * width + x) * 4;
  return (
    Math.abs(data[i] - color[0]) <= COLOR_TOLERANCE &&
    Math.abs(data[i + 1] - color[1]) <= COLOR_TOLERANCE &&
    Math.abs(data[i + 2] - color[2]) <= COLOR_TOLERANCE
  );
}

export function buildOverlapLayer(imageSrc, photoSlots, canvasSize) {
  if (cache.has(imageSrc)) return cache.get(imageSrc);

  const promise = loadImage(imageSrc)
    .then((img) => {
      const { width, height } = canvasSize;

      const source = document.createElement("canvas");
      source.width = width;
      source.height = height;
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      sourceCtx.drawImage(img, 0, 0, width, height);

      const output = document.createElement("canvas");
      output.width = width;
      output.height = height;
      const outputCtx = output.getContext("2d");

      photoSlots.forEach((slot) => {
        const { x, y, width: w, height: h } = slot;

        const imageData = sourceCtx.getImageData(x, y, w, h);
        const data = imageData.data;
        const placeholder = dominantColor(data);

        for (let py = 0; py < h; py++) {
          for (let px = 0; px < w; px++) {
            const i = (py * w + px) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Placeholder colour = not decoration.
            if (matchesAt(data, w, px, py, placeholder)) {
              data[i + 3] = 0;
              continue;
            }

            // Outermost 1px ring only: some designs have a stray light-gray
            // edge line. It is recognisable because the placeholder sits
            // directly inside it. Real decoration pixels (even pale ones)
            // have more decoration next to them, so they are kept.
            const onEdge =
              px === 0 || py === 0 || px === w - 1 || py === h - 1;

            if (onEdge) {
              const isLightGray =
                Math.max(r, g, b) - Math.min(r, g, b) <= GRAY_SPREAD &&
                r >= GRAY_MIN;

              if (isLightGray) {
                const innerX = px === 0 ? 1 : px === w - 1 ? w - 2 : px;
                const innerY = py === 0 ? 1 : py === h - 1 ? h - 2 : py;

                if (matchesAt(data, w, innerX, innerY, placeholder)) {
                  data[i + 3] = 0;
                }
              }
            }
          }
        }

        outputCtx.putImageData(imageData, x, y);

        // Also copy a thin band of the design just OUTSIDE the slot. When the
        // preview is scaled down, the photo's edge is anti-aliased and bleeds
        // a fraction of a pixel past the slot; this band covers that bleed so
        // no seam shows where a decoration crosses the slot edge.
        const M = EDGE_MARGIN;
        const bands = [
          [x - M, y - M, w + 2 * M, M], // top
          [x - M, y + h, w + 2 * M, M], // bottom
          [x - M, y, M, h],             // left
          [x + w, y, M, h],             // right
        ];

        bands.forEach(([bx, by, bw, bh]) => {
          const cx = Math.max(bx, 0);
          const cy = Math.max(by, 0);
          const cw = Math.min(bx + bw, width) - cx;
          const ch = Math.min(by + bh, height) - cy;

          if (cw > 0 && ch > 0) {
            outputCtx.drawImage(source, cx, cy, cw, ch, cx, cy, cw, ch);
          }
        });
      });

      return output.toDataURL("image/png");
    })
    .catch((err) => {
      cache.delete(imageSrc); // allow a retry
      throw err;
    });

  cache.set(imageSrc, promise);
  return promise;
}