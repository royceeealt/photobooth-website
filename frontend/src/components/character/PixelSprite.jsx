import React, { useEffect, useRef } from "react";

function hexToRgb(hex) {
  const clean = hex.replace("#", "");

  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

export default function PixelSprite({
  src,
  color,
  className = "",
  region = "all",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!src || !color) return;

    const image = new Image();
    
    // CRITICAL: Tells the browser to request CORS headers from Cloudinary
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", {
        willReadFrequently: true,
      });

      canvas.width = 124;
      canvas.height = 127;

      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, 124, 127);
      ctx.drawImage(image, 0, 0, 124, 127);

      try {
        const imageData = ctx.getImageData(0, 0, 124, 127);
        const pixels = imageData.data;
        const target = hexToRgb(color);

        for (let y = 0; y < 127; y++) {
          for (let x = 0; x < 124; x++) {
            const index = (y * 124 + x) * 4;

            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const a = pixels[index + 3];

            if (a === 0) continue;

            const brightness = (r + g + b) / 3;
            if (brightness < 70) continue;

            const shade = brightness / 176;
            pixels[index] = Math.min(255, target.r * shade);
            pixels[index + 1] = Math.min(255, target.g * shade);
            pixels[index + 2] = Math.min(255, target.b * shade);
          }
        }

        ctx.putImageData(imageData, 0, 0);
      } catch (err) {
        console.error("CORS tainted canvas error while reading image pixels:", src, err);
      }
    };

    image.src = src;
  }, [src, color, region]);

  return (
    <canvas
      ref={canvasRef}
      className={`character-sprite ${className}`}
      width="124"
      height="127"
    />
  );
}