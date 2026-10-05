import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CameraView from "../components/CameraView.jsx";
import StripPreview from "../components/StripPreview.jsx";

import { captureFrame } from "../lib/canvasUtils.js";

import useSessionStore from "../store/useSessionStore.js";

export default function ImageCapture() {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);

  const stripCount = useSessionStore((s) => s.stripCount);
  const capturedPhotos = useSessionStore((s) => s.capturedPhotos);
  const addCapturedPhoto = useSessionStore((s) => s.addCapturedPhoto);
  const replaceCapturedPhoto = useSessionStore((s) => s.replaceCapturedPhoto);

  // Index of the photo being retaken, or null when taking a new one.
  const [retakeIndex, setRetakeIndex] = useState(null);

  // True once the camera feed is live (Shoot is disabled until then).
  const [cameraReady, setCameraReady] = useState(false);

  // Make sure we always have a number.
  const routeStripCount = location.state?.stripCount;
  const maxPhotos = Number(stripCount ?? routeStripCount) || 0;

  const isDone = maxPhotos > 0 && capturedPhotos.length >= maxPhotos;

  // Coming back from the design page with a 1-photo layout: reopen the
  // camera so the single photo can be replaced.
  useEffect(() => {
    if (maxPhotos === 1 && capturedPhotos.length === 1) {
      setRetakeIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showCamera = !isDone || retakeIndex !== null;

  // -------------------------
  // TAKE PHOTO
  // -------------------------
  function handleShoot() {
    // Strip is full and we're not retaking: nothing to do.
    if (!showCamera) {
      return;
    }

    if (!videoRef.current) {
      console.error("Camera video is not ready.");
      return;
    }

    const photo = {
      id: crypto.randomUUID(),
      imageDataUrl: captureFrame(videoRef.current),
    };

    if (retakeIndex !== null) {
      replaceCapturedPhoto(retakeIndex, photo);
      setRetakeIndex(null);
    } else {
      addCapturedPhoto(photo);
    }

    // 1-photo layout has no preview: go straight to the design page.
    if (maxPhotos === 1) {
      navigate("/polaroid-design");
    }
  }

  // -------------------------
  // RETAKE (hover a photo in the preview)
  // -------------------------
  function handleStartRetake(index) {
    setRetakeIndex(index);
  }

  function handleCancelRetake() {
    setRetakeIndex(null);
  }

  // -------------------------
  // CONTINUE TO DESIGN
  // -------------------------
  function handleContinueToDesign() {
    if (!isDone) {
      return;
    }

    navigate("/polaroid-design");
  }

  return (
    <div className="page capture-page">
      <main className="image-capture-page">
        {/* =========================
            LEFT SIDE — CAMERA
        ========================== */}
        <section className="capture-left">
          <h2 className="capture-camera-label">camera feed</h2>

          <div className="camera-workspace">
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              {showCamera && (
                <CameraView
                  videoRef={videoRef}
                  onStatusChange={(s) => setCameraReady(s === "ready")}
                />
              )}
            </div>
          </div>

          {/* SHOOT BUTTON */}
          {showCamera && (
            <button
              type="button"
              className="capture-shoot-button"
              onClick={handleShoot}
              disabled={!cameraReady}
            >
              📷 Shoot
            </button>
          )}

          {retakeIndex !== null && (
            <button
              type="button"
              className="capture-shoot-button"
              onClick={handleCancelRetake}
            >
              Cancel retake
            </button>
          )}
        </section>

        {/* =========================
            RIGHT SIDE — PHOTO STRIP
        ========================== */}
        <aside className="capture-right">
          <h2 className="capture-right__title">Photo Strip</h2>

          <StripPreview
            photos={capturedPhotos}
            stripCount={maxPhotos}
            onRetake={handleStartRetake}
            retakingIndex={retakeIndex}
          />

          {isDone && retakeIndex === null && (
            <button
              type="button"
              className="capture-continue-button"
              onClick={handleContinueToDesign}
            >
              Continue to Design
            </button>
          )}
        </aside>
      </main>
    </div>
  );
}