import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSessionStore from "../store/useSessionStore.js";

// Phone photos can be 12+ megapixels. Shrink them so the editor and
// download stay fast and memory use stays sensible.
const MAX_UPLOAD_SIDE = 1600;

function readAsImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read ${file.name}`));
    };
    img.src = url;
  });
}

async function fileToPhoto(file) {
  const img = await readAsImage(file);

  const scale = Math.min(
    1,
    MAX_UPLOAD_SIDE / Math.max(img.width, img.height)
  );

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

  return {
    id: crypto.randomUUID(),
    imageDataUrl: canvas.toDataURL("image/jpeg", 0.92),
    source: "upload",
  };
}

export default function PhotoChoice() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const stripCount = useSessionStore((s) => s.stripCount);
  const setCapturedPhotos = useSessionStore((s) => s.setCapturedPhotos);

  const needed = Number(stripCount) || 0;

  // Photos chosen so far (the user can add them one at a time).
  const [picked, setPicked] = useState([]);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const isFull = picked.length >= needed;

  function handleUploadClick() {
    setMessage(null);
    fileInputRef.current?.click();
  }

  async function handleFileChange(event) {
    const files = Array.from(event.target.files || []);

    // Allow choosing the same file again later.
    event.target.value = "";

    const room = needed - picked.length;
    if (files.length === 0 || room <= 0) return;

    setBusy(true);
    setMessage(null);

    try {
      const newPhotos = await Promise.all(
        files.slice(0, room).map(fileToPhoto)
      );
      const next = [...picked, ...newPhotos];

      // 1-photo layout: no need to confirm, go straight to design.
      if (needed === 1) {
        setCapturedPhotos(next);
        navigate("/polaroid-design");
        return;
      }

      setPicked(next);

      if (files.length > room) {
        setMessage(
          `Only ${needed} pictures fit in this layout, so the extra ones were skipped.`
        );
      }
    } catch (err) {
      console.error("Upload failed", err);
      setMessage(
        "One of those files couldn't be read as a picture. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  function handleRemove(id) {
    setPicked((prev) => prev.filter((p) => p.id !== id));
    setMessage(null);
  }

  function handleContinue() {
    if (!isFull) return;

    setCapturedPhotos(picked);
    navigate("/polaroid-design");
  }

  function handleTakePictures() {
    // Start fresh so old (e.g. uploaded) photos don't fill the strip.
    setCapturedPhotos([]);
    navigate("/capture");
  }

  if (!needed) {
    return (
      <main className="photo-choice-page">
        <h1 className="photo-choice-title">CHOOSE YOUR PHOTO</h1>
        <p>Please choose a photo layout first.</p>
      </main>
    );
  }

  return (
    <main className="photo-choice-page">
      <h1 className="photo-choice-title">CHOOSE YOUR PHOTO</h1>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={needed > 1}
        hidden
        onChange={handleFileChange}
      />

      <div className="photo-choice-options">
        <button
          type="button"
          className="photo-choice-card"
          onClick={handleUploadClick}
          disabled={busy || (needed > 1 && isFull)}
        >
          <div className="photo-choice-placeholder">+</div>

          <span>
            {busy
              ? "Preparing…"
              : needed === 1
                ? "Upload 1 Picture"
                : `Add Pictures (${picked.length} of ${needed})`}
          </span>
        </button>

        <button
          type="button"
          className="photo-choice-card"
          onClick={handleTakePictures}
          disabled={busy}
        >
          <div className="photo-choice-placeholder">📷</div>

          <span>Take Pictures</span>
        </button>
      </div>

      {/* Pictures chosen so far */}
      {needed > 1 && picked.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "24px",
          }}
        >
          {picked.map((photo, index) => (
            <div key={photo.id} style={{ position: "relative" }}>
              <img
                src={photo.imageDataUrl}
                alt={`Picture ${index + 1}`}
                style={{
                  width: "90px",
                  height: "90px",
                  objectFit: "cover",
                  border: "2px solid #222",
                  display: "block",
                }}
              />

              <button
                type="button"
                aria-label={`Remove picture ${index + 1}`}
                onClick={() => handleRemove(photo.id)}
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  width: "22px",
                  height: "22px",
                  padding: 0,
                  border: "2px solid #222",
                  borderRadius: "50%",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {needed > 1 && (
        <button
          type="button"
          className="capture-continue-button"
          onClick={handleContinue}
          disabled={!isFull || busy}
          style={{ marginTop: "24px" }}
        >
          Continue to Design
        </button>
      )}

      {message && <p>{message}</p>}
    </main>
  );
}