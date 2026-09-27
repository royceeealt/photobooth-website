import React, { useEffect, useState } from "react";
import { assembleStrip } from "../lib/stripAssembler.js";
import { api } from "../lib/api.js";
import useSessionStore from "../store/useSessionStore.js";

export default function Export() {
  const capturedPhotos = useSessionStore(
    (s) => s.capturedPhotos
  );

  const [stripImage, setStripImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function buildStrip() {
      if (capturedPhotos.length === 0) {
        setLoading(false);
        setError("No photos have been captured yet.");
        return;
      }

      setLoading(true);
      setError(null);
      setSaved(false);

      try {
        const result =
          await assembleStrip(capturedPhotos);

        if (!cancelled) {
          setStripImage(result);
        }
      } catch (err) {
        console.error(
          "Failed to assemble photo strip:",
          err
        );

        if (!cancelled) {
          setError(
            "Something went wrong while creating your strip."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    buildStrip();

    return () => {
      cancelled = true;
    };
  }, [capturedPhotos]);

  function handleDownload() {
    if (!stripImage) return;

    const link =
      document.createElement("a");

    link.href = stripImage;
    link.download =
      "photobooth-strip.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleSave() {
    if (!stripImage || saving) return;

    setSaving(true);
    setSaved(false);

    try {
      await api.post("/strips", {
        imageDataUrl: stripImage,
      });

      setSaved(true);
    } catch (err) {
      console.error(
        "Failed to save strip:",
        err
      );

      setError(
        "The strip could not be saved to your account."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <section className="export-page">
          <h1>Your Strip</h1>
          <p>Assembling your strip…</p>
        </section>
      </main>
    );
  }

  if (error && !stripImage) {
    return (
      <main className="page">
        <section className="export-page">
          <h1>Your Strip</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="export-page">
        <h1>Your Strip</h1>

        {stripImage && (
          <img
            src={stripImage}
            alt="Final photo strip"
          />
        )}

        {error && (
          <p>{error}</p>
        )}

        {saved && (
          <p>
            Strip saved to your account.
          </p>
        )}

        <div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!stripImage}
          >
            Download
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!stripImage || saving}
          >
            {saving
              ? "Saving…"
              : "Save to My Account"}
          </button>
        </div>
      </section>
    </main>
  );
}