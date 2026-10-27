/**
 * Snapshot the current frame from the live camera.
 */
export function captureFrame(videoEl, { width, height } = {}) {
  const canvas = document.createElement("canvas");

  canvas.width = width || videoEl.videoWidth;
  canvas.height = height || videoEl.videoHeight;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/png");
}