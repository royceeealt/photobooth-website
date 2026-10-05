// Renders the growing strip of thumbnails as the user confirms shots.
// Hovering a thumbnail reveals a Retake button (when onRetake is given).
import React from "react";

export default function StripPreview({
  photos = [],
  stripCount,
  onRetake,
  retakingIndex = null,
}) {
  const placeholders = Math.max((stripCount || 0) - photos.length, 0);

  return (
    <div className="strip-preview">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className={
            "strip-preview__item" +
            (retakingIndex === index ? " strip-preview__item--retaking" : "")
          }
        >
          <img
            src={photo.imageDataUrl}
            alt={`Captured shot ${index + 1}`}
            className="strip-preview__thumb"
          />

          {onRetake && retakingIndex !== index && (
            <button
              type="button"
              className="strip-preview__retake"
              onClick={() => onRetake(index)}
            >
              Retake
            </button>
          )}

          {retakingIndex === index && (
            <div className="strip-preview__retaking-label">Retaking…</div>
          )}
        </div>
      ))}

      {/* TODO: style empty slots to visually match final strip layout */}
      {Array.from({ length: placeholders }).map((_, i) => (
        <div key={`empty-${i}`} className="strip-preview__placeholder" />
      ))}
    </div>
  );
}