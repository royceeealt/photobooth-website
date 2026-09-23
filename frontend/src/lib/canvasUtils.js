import { loadItemCatalog } from "./itemCatalog.js";

/**
 * Capture the current frame from the camera.
 */
export function captureFrame(videoEl, { width, height } = {}) {
  if (!videoEl) {
    throw new Error("Video element is not available.");
  }

  if (!videoEl.videoWidth || !videoEl.videoHeight) {
    throw new Error("Camera is not ready yet.");
  }

  const canvas = document.createElement("canvas");

  canvas.width = width || videoEl.videoWidth;
  canvas.height = height || videoEl.videoHeight;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create canvas context.");
  }

  ctx.drawImage(
    videoEl,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL("image/png");
}


/**
 * Convert a hex colour into RGB values.
 *
 * This matches the helper used by PixelSprite.jsx.
 */
function hexToRgb(hex) {
  const clean = hex.replace("#", "");

  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}


/**
 * Load an image from a URL/data URL.
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);

    image.onerror = () => {
      reject(
        new Error(`Could not load image: ${src}`)
      );
    };

    image.src = src;
  });
}


/**
 * Draw a sprite using the same colour logic
 * as PixelSprite.jsx.
 */
async function drawColoredSprite(
  ctx,
  src,
  color,
  x,
  y,
  width,
  height
) {
  const image = await loadImage(src);

  const spriteCanvas =
    document.createElement("canvas");

  spriteCanvas.width = 124;
  spriteCanvas.height = 127;

  const spriteCtx =
    spriteCanvas.getContext("2d", {
      willReadFrequently: true,
    });

  if (!spriteCtx) {
    throw new Error(
      "Could not create sprite canvas context."
    );
  }

  spriteCtx.imageSmoothingEnabled = false;

  spriteCtx.clearRect(
    0,
    0,
    124,
    127
  );

  spriteCtx.drawImage(
    image,
    0,
    0,
    124,
    127
  );

  /*
   * If no colour was supplied, leave the
   * original sprite unchanged.
   */
  if (color) {
    const imageData =
      spriteCtx.getImageData(
        0,
        0,
        124,
        127
      );

    const pixels = imageData.data;
    const target = hexToRgb(color);

    /*
     * This is intentionally the same algorithm
     * used in PixelSprite.jsx.
     */
    for (let y = 0; y < 127; y++) {
      for (let x = 0; x < 124; x++) {
        const index =
          (y * 124 + x) * 4;

        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const a = pixels[index + 3];

        if (a === 0) {
          continue;
        }

        // Keep dark pixel-art outlines unchanged.
        const brightness =
          (r + g + b) / 3;

        if (brightness < 70) {
          continue;
        }

        // Preserve original sprite shading.
        const shade =
          brightness / 176;

        pixels[index] =
          Math.min(
            255,
            target.r * shade
          );

        pixels[index + 1] =
          Math.min(
            255,
            target.g * shade
          );

        pixels[index + 2] =
          Math.min(
            255,
            target.b * shade
          );
      }
    }

    spriteCtx.putImageData(
      imageData,
      0,
      0
    );
  }

  /*
   * Put the now-coloured sprite onto
   * the photograph.
   */
  ctx.drawImage(
    spriteCanvas,
    x,
    y,
    width,
    height
  );
}


/**
 * Add the user's current avatar onto
 * the captured photo.
 */
export async function compositeAvatarOntoFrame(
  baseImageDataUrl,
  avatarConfig,
  placement,
  displaySize = {}
) {
  const catalog =
    await loadItemCatalog();

  const baseImg =
    await loadImage(baseImageDataUrl);

  const canvas =
    document.createElement("canvas");

  canvas.width = baseImg.width;
  canvas.height = baseImg.height;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "Could not create canvas context."
    );
  }

  ctx.imageSmoothingEnabled = false;

  /*
   * Draw original photograph first.
   */
  ctx.drawImage(
    baseImg,
    0,
    0,
    canvas.width,
    canvas.height
  );

  /*
   * The avatar's position is measured
   * relative to the displayed photo.
   *
   * Convert it to the actual captured
   * image resolution.
   */
  const displayWidth =
    displaySize.displayedWidth ||
    baseImg.width;

  const displayHeight =
    displaySize.displayedHeight ||
    baseImg.height;

  const scaleX =
    baseImg.width /
    displayWidth;

  const scaleY =
    baseImg.height /
    displayHeight;

  const x =
    (placement?.x ?? 50) *
    scaleX;

  const y =
    (placement?.y ?? 50) *
    scaleY;

  const scale =
    placement?.scale ?? 1;

  const avatarWidth =
    124 *
    scale *
    scaleX;

  const avatarHeight =
    127 *
    scale *
    scaleY;

  /*
   * Keep this layer order the same as
   * CharacterPreview.jsx.
   */
  const layers = [
    {
      category: "body",
      id: avatarConfig?.body,
      color: avatarConfig?.skinColor,
    },
    {
      category: "eyes",
      id: avatarConfig?.eyes,
      color: null,
    },
    {
      category: "lips",
      id: avatarConfig?.lips,
      color: avatarConfig?.lipsColor,
    },
    {
      category: "top",
      id: avatarConfig?.top,
      color: avatarConfig?.topColor,
    },
    {
      category: "bottom",
      id: avatarConfig?.bottom,
      color: avatarConfig?.bottomColor,
    },
    {
      category: "footwear",
      id: avatarConfig?.footwear,
      color:
        avatarConfig?.footwearColor ||
        "#222222",
    },
    {
      category: "hair",
      id: avatarConfig?.hair,
      color: avatarConfig?.hairColor,
    },
  ];

  /*
   * Draw every avatar layer.
   */
  for (const layer of layers) {
    if (!layer.id) {
      continue;
    }

    const assetPath =
      findAsset(
        catalog,
        layer.category,
        layer.id
      );

    if (!assetPath) {
      continue;
    }

    await drawColoredSprite(
      ctx,
      assetPath,
      layer.color,
      x,
      y,
      avatarWidth,
      avatarHeight
    );
  }

  /*
   * Include custom drawing if the user
   * made one.
   */
  if (avatarConfig?.drawing) {
    const drawing =
      await loadImage(
        avatarConfig.drawing
      );

    ctx.drawImage(
      drawing,
      x,
      y,
      avatarWidth,
      avatarHeight
    );
  }

  return canvas.toDataURL(
    "image/png"
  );
}


/**
 * Find an asset path from the item manifest.
 */
function findAsset(
  catalog,
  category,
  itemId
) {
  const item =
    catalog?.[category]?.find(
      (entry) =>
        entry.id === itemId
    );

  return item?.assetPath || null;
}