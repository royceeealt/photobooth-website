import { loadItemCatalog } from "./itemCatalog.js";

/**
 * Snapshot the current frame from the live camera.
 */
export function captureFrame(videoEl, { width, height } = {}) {
  const canvas = document.createElement("canvas");

  canvas.width = width || videoEl.videoWidth;
  canvas.height = height || videoEl.videoHeight;

  const ctx = canvas.getContext("2d");

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
 * Composite the currently selected avatar onto a captured photo.
 */
export async function compositeAvatarOntoFrame(
  baseImageDataUrl,
  avatarConfig,
  placement,
  displaySize = {}
) {
  const catalog = await loadItemCatalog();

  const baseImg = await loadImage(baseImageDataUrl);

  const canvas = document.createElement("canvas");

  canvas.width = baseImg.width;
  canvas.height = baseImg.height;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    baseImg,
    0,
    0,
    canvas.width,
    canvas.height
  );

  /*
   * The avatar is positioned using the dimensions
   * that the user saw on screen.
   *
   * Convert those screen coordinates into
   * coordinates of the original captured image.
   */
  const displayedWidth =
    displaySize.displayedWidth || canvas.width;

  const displayedHeight =
    displaySize.displayedHeight || canvas.height;

  const scaleX =
    canvas.width / displayedWidth;

  const scaleY =
    canvas.height / displayedHeight;

  const placementX =
    (placement?.x ?? 50) * scaleX;

  const placementY =
    (placement?.y ?? 50) * scaleY;

  const avatarScale =
    placement?.scale ?? 1;


  /*
   * Avatar is built from the same layers used
   * by CharacterPreview.
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
      color: avatarConfig?.eyesColor,
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
      color: avatarConfig?.footwearColor,
    },
    {
      category: "hair",
      id: avatarConfig?.hair,
      color: avatarConfig?.hairColor,
    },
  ];


  /*
   * Draw each avatar layer.
   */
  for (const layer of layers) {
    if (!layer.id) continue;

    const catalogItems =
      catalog?.[layer.category] || [];

    const item =
      catalogItems.find(
        (entry) => entry.id === layer.id
      );

    if (!item?.assetPath) {
      continue;
    }

    const img =
      await loadImage(item.assetPath);

    /*
     * The avatar sprite is 124 x 127,
     * matching the CharacterPreview dimensions.
     */
    const avatarWidth =
      124 * avatarScale * scaleX;

    const avatarHeight =
      127 * avatarScale * scaleY;

    /*
     * Apply the same pixel recolouring idea
     * used by PixelSprite.
     */
    const tinted =
      layer.color
        ? await tintSprite(
            img,
            layer.color
          )
        : img;

    ctx.drawImage(
      tinted,
      placementX,
      placementY,
      avatarWidth,
      avatarHeight
    );
  }


  return canvas.toDataURL("image/png");
}


/**
 * Recolour a pixel sprite while preserving
 * transparent pixels and dark outlines.
 */
async function tintSprite(img, hexColor) {
  const canvas =
    document.createElement("canvas");

  canvas.width = img.width;
  canvas.height = img.height;

  const ctx =
    canvas.getContext("2d");

  ctx.drawImage(
    img,
    0,
    0
  );

  const imageData =
    ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

  const pixels =
    imageData.data;

  const rgb =
    hexToRgb(hexColor);

  if (!rgb) {
    return img;
  }

  for (
    let i = 0;
    i < pixels.length;
    i += 4
  ) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    /*
     * Keep transparent pixels unchanged.
     */
    if (a === 0) {
      continue;
    }

    /*
     * Preserve very dark outline pixels.
     */
    if (
      r < 60 &&
      g < 60 &&
      b < 60
    ) {
      continue;
    }

    /*
     * Calculate brightness so the original
     * sprite shading is retained.
     */
    const brightness =
      (r + g + b) / 3;

    const factor =
      brightness / 255;

    pixels[i] =
      Math.min(
        255,
        rgb.r * factor
      );

    pixels[i + 1] =
      Math.min(
        255,
        rgb.g * factor
      );

    pixels[i + 2] =
      Math.min(
        255,
        rgb.b * factor
      );
  }

  ctx.putImageData(
    imageData,
    0,
    0
  );

  return canvas;
}


/**
 * Convert #RRGGBB into RGB.
 */
function hexToRgb(hex) {
  if (
    typeof hex !== "string"
  ) {
    return null;
  }

  const clean =
    hex.replace("#", "");

  if (
    clean.length !== 6
  ) {
    return null;
  }

  return {
    r: parseInt(
      clean.slice(0, 2),
      16
    ),

    g: parseInt(
      clean.slice(2, 4),
      16
    ),

    b: parseInt(
      clean.slice(4, 6),
      16
    ),
  };
}


/**
 * Load an image before drawing it.
 */
function loadImage(src) {
  return new Promise(
    (resolve, reject) => {
      const img =
        new Image();

      img.onload = () =>
        resolve(img);

      img.onerror = reject;

      img.src = src;
    }
  );
}