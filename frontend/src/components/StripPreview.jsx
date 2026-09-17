// Renders the growing strip of thumbnails as the user confirms shots.
export default function StripPreview({ photos = [], stripCount }) {
  const placeholders = Math.max(stripCount - photos.length, 0);

  return (
    <div className="strip-preview">
      {photos.map((photo) => (
        <img
          key={photo.id}
          src={photo.imageDataUrl}
          alt="Captured shot"
          className="strip-preview__thumb"
        />
      ))}

      {/* TODO: style empty slots to visually match final strip layout */}
      {Array.from({ length: placeholders }).map((_, i) => (
        <div key={`empty-${i}`} className="strip-preview__placeholder" />
      ))}
    </div>
  );
}
