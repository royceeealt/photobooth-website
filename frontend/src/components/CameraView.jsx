import React, { useEffect, useRef, useState } from "react";

// Turns on the webcam and exposes a ref parent components can use to
// grab frames via canvasUtils.captureFrame(videoRef.current).
//
// status: "asking" (waiting for permission / starting), "ready",
//         "denied" (user blocked the camera), "unavailable" (no camera / unsupported)
// onStatusChange(status) lets the parent know, e.g. to enable the Shoot button.
export default function CameraView({
  videoRef,
  facingMode = "user",
  onStatusChange,
}) {
  const internalRef = useRef(null);
  const ref = videoRef || internalRef;

  const [status, setStatus] = useState("asking");
  const [attempt, setAttempt] = useState(0); // bump to retry

  useEffect(() => {
    onStatusChange?.(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    let stream;
    let cancelled = false;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unavailable");
        return;
      }

      setStatus("asking");

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (ref.current) ref.current.srcObject = stream;
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.error("Camera access failed", err);

        const blocked =
          err.name === "NotAllowedError" || err.name === "SecurityError";
        setStatus(blocked ? "denied" : "unavailable");
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [facingMode, ref, attempt]);

  const messageStyle = {
    padding: "24px",
    textAlign: "center",
    fontFamily: "inherit",
  };

  return (
    <>
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "auto",
          display: status === "ready" ? "block" : "none",
        }}
      />

      {status === "asking" && (
        <p style={messageStyle}>Allow camera access to take your photos…</p>
      )}

      {status === "denied" && (
        <div style={messageStyle}>
          <p>Camera access is blocked.</p>
          <p>
            Allow the camera for this site in your browser settings, then try
            again.
          </p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>
            Try again
          </button>
        </div>
      )}

      {status === "unavailable" && (
        <div style={messageStyle}>
          <p>No camera found, or this browser can't use it.</p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>
            Try again
          </button>
        </div>
      )}
    </>
  );
}