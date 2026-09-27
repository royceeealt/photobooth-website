import React, { useEffect, useRef } from "react";

// Turns on the webcam and exposes a ref parent components can use to
// grab frames via canvasUtils.captureFrame(videoRef.current).
export default function CameraView({ videoRef, facingMode = "user" }) {
  const internalRef = useRef(null);
  const ref = videoRef || internalRef;

  useEffect(() => {
    let stream;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        if (ref.current) ref.current.srcObject = stream;
      } catch (err) {
        // TODO: surface a friendly "camera permission denied" state
        console.error("Camera access failed", err);
      }
    }

    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [facingMode, ref]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted
      style={{ width: "100%", height: "auto" }}
    />
  );
}
