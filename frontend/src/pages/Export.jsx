import { useEffect, useState } from "react";
import { assembleStrip } from "../lib/stripAssembler.js";
import { api } from "../lib/api.js";
import useSessionStore from "../store/useSessionStore.js";

// Final stitched strip: download locally, optionally save to account.
export default function Export() {
  const capturedPhotos = useSessionStore((s) => s.capturedPhotos);
  const [stripImage, setStripImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (capturedPhotos.length === 0) return;
    assembleStrip(capturedPhotos).then(setStripImage).catch(console.error);
  }, [capturedPhotos]);

  function handleDownload() {
    if (!stripImage) return;
    const link = document.createElement("a");
    link.href = stripImage;
    link.download = "photobooth-strip.png";
    link.click();
  }

  async function handleSave() {
    if (!stripImage) return;
    setSaving(true);
    try {
      // TODO: POST to /api/strips (strips.routes.js) with { imageUrl or base64, stripCount, avatarConfig }
      await api.post("/strips", { imageDataUrl: stripImage });
    } catch (err) {
      console.error("Failed to save strip", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="export-page">
      <h1>Your Strip</h1>
      {stripImage ? (
        <img src={stripImage} alt="Final photo strip" />
      ) : (
        <p>Assembling your strip…</p>
      )}
      <button onClick={handleDownload} disabled={!stripImage}>
        Download
      </button>
      <button onClick={handleSave} disabled={!stripImage || saving}>
        {saving ? "Saving…" : "Save to My Account"}
      </button>
    </div>
  );
}
