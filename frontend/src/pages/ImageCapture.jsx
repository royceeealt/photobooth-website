import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CameraView from "../components/CameraView.jsx";
import StripPreview from "../components/StripPreview.jsx";
import DraggableAvatar from "../components/DraggableAvatar.jsx";
import RetakeConfirmBar from "../components/RetakeConfirmBar.jsx";
import { captureFrame, compositeAvatarOntoFrame } from "../lib/canvasUtils.js";
import useSessionStore from "../store/useSessionStore.js";

// Camera on one side, filling strip preview on the other. Each shot gets
// its own avatar placement before it's confirmed into the strip.
export default function ImageCapture() {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const stripCount = useSessionStore((s) => s.stripCount);
  const avatarConfig = useSessionStore((s) => s.avatarConfig);
  const capturedPhotos = useSessionStore((s) => s.capturedPhotos);
  const addCapturedPhoto = useSessionStore((s) => s.addCapturedPhoto);
  const retakeLastPhoto = useSessionStore((s) => s.retakeLastPhoto);

  const [pendingShot, setPendingShot] = useState(null); // { imageDataUrl }
  const [placement, setPlacement] = useState({ x: 50, y: 50, scale: 1 });

  const isDone = capturedPhotos.length >= (stripCount || 0);

  function handleShoot() {
    const imageDataUrl = captureFrame(videoRef.current);
    setPendingShot({ imageDataUrl });
    setPlacement({ x: 50, y: 50, scale: 1 });
  }

  function handleRetake() {
    setPendingShot(null);
  }

  async function handleConfirm() {
    if (!pendingShot) return;
    // TODO: bake avatar into the photo before storing, or store placement
    // separately and composite at export time — pick one approach.
    const composited = await compositeAvatarOntoFrame(
      pendingShot.imageDataUrl,
      avatarConfig,
      placement
    );
    addCapturedPhoto({
      id: crypto.randomUUID(),
      imageDataUrl: composited,
      avatarPlacement: placement,
    });
    setPendingShot(null);
  }

  return (
    <div className="image-capture-page">
      <div className="image-capture-page__camera">
        {!pendingShot && <CameraView videoRef={videoRef} />}
        {pendingShot && (
          <div style={{ position: "relative" }}>
            <img src={pendingShot.imageDataUrl} alt="Pending shot" />
            <DraggableAvatar
              avatarConfig={avatarConfig}
              placement={placement}
              onPlacementChange={setPlacement}
            />
          </div>
        )}

        {!pendingShot && !isDone && <button onClick={handleShoot}>Shoot</button>}
        {pendingShot && <RetakeConfirmBar onRetake={handleRetake} onConfirm={handleConfirm} />}
      </div>

      <div className="image-capture-page__strip">
        <StripPreview photos={capturedPhotos} stripCount={stripCount} />
        {isDone && <button onClick={() => navigate("/export")}>Continue to Export</button>}
      </div>
    </div>
  );
}
