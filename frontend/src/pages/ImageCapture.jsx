import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CharacterPreview from "../components/character/CharacterPreview.jsx";
import CameraView from "../components/CameraView.jsx";
import StripPreview from "../components/StripPreview.jsx";
import DraggableAvatar from "../components/DraggableAvatar.jsx";
import RetakeConfirmBar from "../components/RetakeConfirmBar.jsx";
import { loadItemCatalog } from "../lib/itemCatalog.js";

import {
  captureFrame,
  compositeAvatarOntoFrame,
} from "../lib/canvasUtils.js";

import useSessionStore from "../store/useSessionStore.js";


export default function ImageCapture() {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const pendingImageRef = useRef(null);

  const stripCount = useSessionStore((s) => s.stripCount);
  const avatarConfig = useSessionStore((s) => s.avatarConfig);
  const avatarCount = useSessionStore((s) => s.avatarCount);
const activeAvatarIndex = useSessionStore(
  (s) => s.activeAvatarIndex
);
const setActiveAvatar = useSessionStore(
  (s) => s.setActiveAvatar
);
  const capturedPhotos = useSessionStore((s) => s.capturedPhotos);
  const addCapturedPhoto = useSessionStore((s) => s.addCapturedPhoto);

  // The photo that has been taken but NOT confirmed yet.
  const [pendingShot, setPendingShot] = useState(null);

  // Position of the avatar on the current pending photo.
  const [placement, setPlacement] = useState({
    x: 50,
    y: 50,
    scale: 1,
  });
  const [props, setProps] = useState([
  { id: "none", name: "None", assetPath: null },
]);

const [activePropIndex, setActivePropIndex] = useState(0);

  // Make sure we always have a number.
  const routeStripCount = location.state?.stripCount;

  const maxPhotos =
    Number(stripCount ?? routeStripCount) || 0;
  console.log("stripCount:", stripCount, "route:", routeStripCount, "maxPhotos:", maxPhotos);

  const isDone =
    maxPhotos > 0 &&
    capturedPhotos.length >= maxPhotos;
  useEffect(() => {
  loadItemCatalog()
    .then((catalog) => {
      const accessories = catalog.accessory || [];

      setProps([
        {
          id: "none",
          name: "None",
          assetPath: null,
        },
        ...accessories,
      ]);
    })
    .catch((error) => {
      console.error(
        "Failed to load props:",
        error
      );
    });
}, []);

  // -------------------------
  // TAKE PHOTO
  // -------------------------
  function handleShoot() {
    // Don't allow another photo if the strip is already full.
    if (isDone) {
      return;
    }

    // Don't allow another Shoot while we're reviewing
    // the previous photo.
    if (pendingShot) {
      return;
    }

    if (!videoRef.current) {
      console.error("Camera video is not ready.");
      return;
    }

    const imageDataUrl = captureFrame(videoRef.current);

    // IMPORTANT:
    // We DO NOT add the photo to capturedPhotos here.
    // It is only a pending photo until the user confirms it.
    setPendingShot({
      imageDataUrl,
    });

    setPlacement({
      x: 50,
      y: 50,
      scale: 1,
    });
  }

  // -------------------------
  // RETAKE
  // -------------------------
  function handleRetake() {
    // Throw away the pending photo.
    // Nothing was added to the strip yet.
    setPendingShot(null);
  }

  // -------------------------
  // CONFIRM PHOTO
  // -------------------------
  async function handleConfirm() {
  if (!pendingShot) return;

  const displayedWidth =
    pendingImageRef.current?.clientWidth || 1;

  const displayedHeight =
    pendingImageRef.current?.clientHeight || 1;

  const composited = await compositeAvatarOntoFrame(
    pendingShot.imageDataUrl,
    avatarConfig,
    placement,
    {
      displayedWidth,
      displayedHeight,
    }
  );

  addCapturedPhoto({
    id: crypto.randomUUID(),
    imageDataUrl: composited,
    avatarPlacement: placement,
  });

  setPendingShot(null);
}

  // -------------------------
  // CONTINUE TO EXPORT
  // -------------------------
  function handleContinueToExport() {
    if (!isDone) {
      return;
    }

    navigate("/export");
  }
function previousAvatar() {
  if (avatarCount <= 1) return;

  const previous =
    activeAvatarIndex === 0
      ? avatarCount - 1
      : activeAvatarIndex - 1;

  setActiveAvatar(previous);
}

function nextAvatar() {
  if (avatarCount <= 1) return;

  const next =
    activeAvatarIndex === avatarCount - 1
      ? 0
      : activeAvatarIndex + 1;

  setActiveAvatar(next);
}
function previousProp() {
  if (props.length <= 1) return;

  setActivePropIndex((current) =>
    current === 0
      ? props.length - 1
      : current - 1
  );
}

function nextProp() {
  if (props.length <= 1) return;

  setActivePropIndex((current) =>
    current === props.length - 1
      ? 0
      : current + 1
  );
}
  return (
  <div className="page capture-page">
    <main className="image-capture-page">

      {/* =========================
          LEFT SIDE — CAMERA
      ========================== */}
      <section className="capture-left">

        <h2 className="capture-camera-label">
          camera feed
        </h2>

        <div className="camera-workspace">

          {/* LIVE CAMERA */}
          {!pendingShot && !isDone && (
            <CameraView videoRef={videoRef} />
          )}

          {/* CAPTURED PHOTO */}
          {pendingShot && (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              <img
              ref={pendingImageRef}
                src={pendingShot.imageDataUrl}
                alt="Captured photo"
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              <DraggableAvatar
                avatarConfig={avatarConfig}
                placement={placement}
                onPlacementChange={setPlacement}
              />
            </div>
          )}

        </div>


        {/* SHOOT BUTTON */}
        {!pendingShot && !isDone && (
          <button
            type="button"
            className="capture-shoot-button"
            onClick={handleShoot}
          >
            📷 Shoot
          </button>
        )}


        {/* RETAKE / CONFIRM */}
        {pendingShot && (
          <RetakeConfirmBar
            onRetake={handleRetake}
            onConfirm={handleConfirm}
          />
        )}


        {/* =========================
            AVATAR + PROPS PICKERS
        ========================== */}

        <div className="capture-pickers">

          <div className="capture-picker">

  <button
  type="button"
  className="capture-picker__arrow"
  aria-label="Previous avatar"
  onClick={previousAvatar}
  disabled={avatarCount <= 1}
>
  ←
</button>

  <div className="capture-picker__preview">
    <CharacterPreview
      avatarConfig={avatarConfig}
      avatarView="full"
    />
  </div>

  <button
  type="button"
  className="capture-picker__arrow"
  aria-label="Next avatar"
  onClick={nextAvatar}
  disabled={avatarCount <= 1}
>
  →
</button>

  <div className="capture-picker__label">
  Avatar {activeAvatarIndex + 1}
</div>

</div>


          <div className="capture-picker">
  <button
    type="button"
    className="capture-picker__arrow"
    aria-label="Previous prop"
    onClick={previousProp}
    disabled={props.length <= 1}
  >
    ←
  </button>

  <div className="capture-picker__preview">
    {props[activePropIndex]?.assetPath ? (
      <img
        src={props[activePropIndex].assetPath}
        alt={props[activePropIndex].name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          imageRendering: "pixelated",
        }}
      />
    ) : (
      "None"
    )}
  </div>

  <button
    type="button"
    className="capture-picker__arrow"
    aria-label="Next prop"
    onClick={nextProp}
    disabled={props.length <= 1}
  >
    →
  </button>

  <div className="capture-picker__label">
    {props[activePropIndex]?.name || "Props"}
  </div>
</div>
</div>

      </section>


      {/* =========================
          RIGHT SIDE — PHOTO STRIP
      ========================== */}
      <aside className="capture-right">

        <h2 className="capture-right__title">
          Photo Strip
        </h2>

        <StripPreview
  photos={capturedPhotos}
  stripCount={maxPhotos}
/>

        {isDone && (
          <button
            type="button"
            className="capture-continue-button"
            onClick={handleContinueToExport}
          >
            Continue to Export
          </button>
        )}

      </aside>

    </main>
  </div>
);
}