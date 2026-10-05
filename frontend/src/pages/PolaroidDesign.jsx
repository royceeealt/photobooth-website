import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSessionStore from "../store/useSessionStore.js";
import { getPolaroidTemplate } from "../data/polaroidTemplates.js";
import { propCatalog, getProp, getPropBaseSize } from "../data/propCatalog.js";
import { buildOverlapLayer } from "../lib/polaroidOverlay.js";
import { renderPolaroid } from "../lib/polaroidRenderer.js";
import { avatarToDataUrl, AVATAR_BASE_SIZE } from "../lib/avatarRenderer.js";

const MIN_SCALE = 0.3;
const MAX_SCALE = 2.5;

// One row of the right-hand control panel, styled to match
// PhotoEditor's .editor-control (‹ [display] ›).
// If onSelect is given, the display box is a button (click = add to Polaroid).
function EditorControlRow({ label, onPrev, onNext, onSelect, disabled = false, thumb }) {
  const Display = onSelect ? "button" : "div";

  const row = (
    <div className="editor-control">
      <button type="button" onClick={onPrev} disabled={disabled} aria-label={`Previous ${label}`}>
        ←
      </button>

      <Display
        className={
          "editor-control-display" + (thumb !== undefined ? " editor-control-display--pick" : "")
        }
        {...(onSelect ? { type: "button", onClick: onSelect } : {})}
      >
        {thumb !== undefined ? (
          thumb ? <img src={thumb} alt="" /> : <span>none</span>
        ) : (
          label
        )}
      </Display>

      <button type="button" onClick={onNext} disabled={disabled} aria-label={`Next ${label}`}>
        →
      </button>
    </div>
  );

  // Picker rows (avatar/prop) show the label on its own line below the box.
  if (thumb === undefined) return row;

  return (
    <div className="editor-control-group">
      {row}
      <div className="editor-control-label">{label}</div>
    </div>
  );
}

export default function PolaroidDesign() {
  const navigate = useNavigate();
  const stripCount = useSessionStore((s) => s.stripCount);
  const capturedPhotos = useSessionStore((s) => s.capturedPhotos);
  const avatars = useSessionStore((s) => s.avatars);

  const avatarPlacements = useSessionStore((s) => s.avatarPlacements);
  const addAvatarPlacement = useSessionStore((s) => s.addAvatarPlacement);
  const updateAvatarPlacement = useSessionStore((s) => s.updateAvatarPlacement);
  const removeAvatarPlacement = useSessionStore((s) => s.removeAvatarPlacement);
  const clearAvatarPlacements = useSessionStore((s) => s.clearAvatarPlacements);

  const propPlacements = useSessionStore((s) => s.propPlacements);
  const addPropPlacement = useSessionStore((s) => s.addPropPlacement);
  const updatePropPlacement = useSessionStore((s) => s.updatePropPlacement);
  const removePropPlacement = useSessionStore((s) => s.removePropPlacement);
  const clearPropPlacements = useSessionStore((s) => s.clearPropPlacements);

  const template = getPolaroidTemplate(stripCount);

  // 0 = blank base template, 1.. = the numbered designs.
  const [designIndex, setDesignIndex] = useState(0);
  const [overlayUrl, setOverlayUrl] = useState(null);

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  // Pickers
  const [avatarPickIndex, setAvatarPickIndex] = useState(0);
  const [avatarThumbs, setAvatarThumbs] = useState([]);
  const [propPickIndex, setPropPickIndex] = useState(0);

  // Which placed element (avatar or prop) is selected.
  const [selectedId, setSelectedId] = useState(null);

  // The preview element (screen -> canvas pixel conversion) and gestures.
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  const options = template ? [null, ...template.designs] : [null];
  const selectedDesign = options[designIndex] ?? null;

  // Build the "decorations that overlap the photos" layer for the chosen design.
  useEffect(() => {
    if (!template || !selectedDesign) {
      setOverlayUrl(null);
      return;
    }

    let cancelled = false;

    buildOverlapLayer(selectedDesign.image, template.photoSlots, template.canvas)
      .then((url) => {
        if (!cancelled) setOverlayUrl(url);
      })
      .catch((err) => console.error("Overlap layer failed", err));

    return () => {
      cancelled = true;
    };
  }, [selectedDesign, stripCount]);

  // Render a thumbnail for every saved avatar.
  useEffect(() => {
    let cancelled = false;

    Promise.all((avatars || []).map((a) => avatarToDataUrl(a)))
      .then((urls) => {
        if (!cancelled) setAvatarThumbs(urls);
      })
      .catch((err) => console.error("Avatar render failed", err));

    return () => {
      cancelled = true;
    };
  }, [avatars]);

  function stepDesign(delta) {
    setDesignIndex((i) => (i + delta + options.length) % options.length);
  }

  function stepAvatar(delta) {
    if (avatarThumbs.length === 0) return;
    setAvatarPickIndex((i) => (i + delta + avatarThumbs.length) % avatarThumbs.length);
  }

  function stepProp(delta) {
    if (propCatalog.length === 0) return;
    setPropPickIndex((i) => (i + delta + propCatalog.length) % propCatalog.length);
  }

  // ----- Adding -----

  // Centre of the canvas, nudged so repeated adds don't stack exactly.
  function nextSpot() {
    const { width, height } = template.canvas;
    const n = avatarPlacements.length + propPlacements.length;
    const offset = ((n % 5) - 2) * 40;
    return { x: width / 2 + offset, y: height / 2 + offset };
  }

  function handleAddAvatar() {
    if (!template || !avatarThumbs[avatarPickIndex]) return;

    const id = crypto.randomUUID();
    addAvatarPlacement({ id, avatarIndex: avatarPickIndex, ...nextSpot(), scale: 1 });
    setSelectedId(id);
  }

  function handleAddProp() {
    const prop = propCatalog[propPickIndex];
    if (!template || !prop) return;

    const id = crypto.randomUUID();
    addPropPlacement({ id, propId: prop.id, ...nextSpot(), scale: 1 });
    setSelectedId(id);
  }

  // ----- Shared by avatars and props -----

  function updatePlacement(kind, id, patch) {
    if (kind === "prop") updatePropPlacement(id, patch);
    else updateAvatarPlacement(id, patch);
  }

  function handleRemovePlacement(kind, id) {
    if (kind === "prop") removePropPlacement(id);
    else removeAvatarPlacement(id);
    setSelectedId(null);
  }

  // Dragging

  function handlePlacedPointerDown(e, item) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    setSelectedId(item.p.id);

    dragRef.current = {
      kind: item.kind,
      id: item.p.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: item.p.x,
      origY: item.p.y,
    };
  }

  function handlePlacedPointerMove(e) {
    const drag = dragRef.current;
    if (!drag || !canvasRef.current || !template) return;

    const { width, height } = template.canvas;
    const rect = canvasRef.current.getBoundingClientRect();
    const ratio = width / rect.width;

    const x = drag.origX + (e.clientX - drag.startX) * ratio;
    const y = drag.origY + (e.clientY - drag.startY) * ratio;

    updatePlacement(drag.kind, drag.id, {
      x: Math.min(Math.max(x, 0), width),
      y: Math.min(Math.max(y, 0), height),
    });
  }

  function handlePlacedPointerEnd(e) {
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  // Resizing

  function handleResizePointerDown(e, item) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    const { width, height } = template.canvas;
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = rect.left + (item.p.x / width) * rect.width;
    const cy = rect.top + (item.p.y / height) * rect.height;

    resizeRef.current = {
      kind: item.kind,
      id: item.p.id,
      cx,
      cy,
      startDist: Math.max(Math.hypot(e.clientX - cx, e.clientY - cy), 1),
      origScale: item.p.scale,
    };
  }

  function handleResizePointerMove(e) {
    const r = resizeRef.current;
    if (!r) return;

    const dist = Math.hypot(e.clientX - r.cx, e.clientY - r.cy);
    const scale = Math.min(Math.max(r.origScale * (dist / r.startDist), MIN_SCALE), MAX_SCALE);

    updatePlacement(r.kind, r.id, { scale });
  }

  function handleResizePointerEnd(e) {
    resizeRef.current = null;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  // ----- Page actions -----

  function handleBack() {
    const fromUpload = capturedPhotos.some((p) => p.source === "upload");
    navigate(fromUpload ? "/photo-choice" : "/capture");
  }

  function handleRedo() {
    setDesignIndex(0);
    clearAvatarPlacements();
    clearPropPlacements();
    setSelectedId(null);
  }

  async function handleDownload() {
    if (downloading) return;

    setDownloading(true);
    setDownloadError(null);

    try {
      const url = await renderPolaroid({
        template,
        design: selectedDesign,
        photos: capturedPhotos,
        avatars,
        avatarPlacements,
        propPlacements,
      });

      const link = document.createElement("a");
      link.href = url;
      link.download = "pixibooth-polaroid.png";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to render Polaroid", err);
      setDownloadError("Something went wrong while creating your Polaroid. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  if (!template) {
    return (
      <main className="photo-editor-page">
        <section className="photo-editor-workspace">
          <div className="photo-editor-preview">
            <div className="photo-editor-placeholder">
              <span>Choose a layout first</span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const { width: canvasW, height: canvasH } = template.canvas;
  const canDownload = !downloading && capturedPhotos.length >= template.photoSlots.length;

  // Everything the user has placed, bottom-to-top: avatars first, then props.
  const placedItems = [
    ...avatarPlacements.map((p) => ({
      kind: "avatar",
      p,
      src: avatarThumbs[p.avatarIndex],
      base: AVATAR_BASE_SIZE,
    })),
    ...propPlacements.map((p) => {
      const prop = getProp(p.propId);
      return {
        kind: "prop",
        p,
        src: prop?.image,
        base: prop ? getPropBaseSize(prop) : null,
      };
    }),
  ].filter((item) => item.src && item.base);

  const selectedItem = placedItems.find((item) => item.p.id === selectedId) || null;

  const pickedProp = propCatalog[propPickIndex] || null;

  return (
    <main className="photo-editor-page">
      <section className="photo-editor-workspace">
        {/* =========================
            LEFT — POLAROID PREVIEW
        ========================== */}
        <div className="photo-editor-preview">
          <button type="button" className="photo-editor-back" onClick={handleBack}>
            ← back to photos
          </button>

          {/* Width is derived from viewport height so tall Polaroids
              (4 photos = 1080x2610) always fit on screen. The stage holds
              two layers: a clipped canvas (art is cropped at the frame
              edge) and an unclipped handles layer on top, so the ×/resize
              controls for the selected item stay clickable even when the
              item itself is partly cut off. */}
          <div
            ref={canvasRef}
            className="design-stage"
            style={{
              width: `min(100%, calc(68vh * ${canvasW / canvasH}))`,
              aspectRatio: `${canvasW} / ${canvasH}`,
            }}
          >
            <div
              className="photo-editor-placeholder photo-editor-placeholder--canvas"
              onClick={() => setSelectedId(null)}
            >
              {/* Polaroid design / base */}
              <img
                src={selectedDesign?.image || template.baseImage}
                alt={selectedDesign?.name || `Blank ${template.layout}-photo Polaroid`}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  imageRendering: "pixelated",
                }}
              />

              {/* Captured photos */}
              {template.photoSlots.map((slot, index) => {
                const photo = capturedPhotos[index];
                if (!photo) return null;

                return (
                  <img
                    key={photo.id}
                    src={photo.imageDataUrl}
                    alt={`Captured photo ${index + 1}`}
                    style={{
                      position: "absolute",
                      left: `${(slot.x / canvasW) * 100}%`,
                      top: `${(slot.y / canvasH) * 100}%`,
                      width: `${(slot.width / canvasW) * 100}%`,
                      height: `${(slot.height / canvasH) * 100}%`,
                      objectFit: "cover",
                      imageRendering: "auto",
                    }}
                  />
                );
              })}

              {/* Design decorations that overlap the photos */}
              {overlayUrl && (
                <img
                  src={overlayUrl}
                  alt=""
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    imageRendering: "pixelated",
                  }}
                />
              )}

              {/* Placed avatars and props — art only, clipped at the frame edge */}
              {placedItems.map((item) => {
                const { kind, p, src, base } = item;
                const w = base.width * p.scale;
                const h = base.height * p.scale;
                const selected = p.id === selectedId;

                return (
                  <div
                    key={p.id}
                    className={"design-placed" + (selected ? " design-placed--selected" : "")}
                    style={{
                      left: `${((p.x - w / 2) / canvasW) * 100}%`,
                      top: `${((p.y - h / 2) / canvasH) * 100}%`,
                      width: `${(w / canvasW) * 100}%`,
                      height: `${(h / canvasH) * 100}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(p.id);
                    }}
                    onPointerDown={(e) => handlePlacedPointerDown(e, item)}
                    onPointerMove={handlePlacedPointerMove}
                    onPointerUp={handlePlacedPointerEnd}
                    onPointerCancel={handlePlacedPointerEnd}
                  >
                    <img
                      src={src}
                      alt=""
                      draggable={false}
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        imageRendering: "pixelated",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Handles for the selected item — NOT clipped, so they stay
                clickable even when the item itself is cut off at the edge. */}
            <div className="design-handles-layer">
              {selectedItem &&
                (() => {
                  const { kind, p, base } = selectedItem;
                  const w = base.width * p.scale;
                  const h = base.height * p.scale;

                                    return (
                    <div
                      className="design-placed--selected"
                      style={{
                        position: "absolute",
                        left: `${((p.x - w / 2) / canvasW) * 100}%`,
                        top: `${((p.y - h / 2) / canvasH) * 100}%`,
                        width: `${(w / canvasW) * 100}%`,
                        height: `${(h / canvasH) * 100}%`,
                      }}
                    >
                      <button
                        type="button"
                        className="design-placed__remove"
                        aria-label={`Remove ${kind}`}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePlacement(kind, p.id);
                        }}
                      >
                        ×
                      </button>

                      <div
                        className="design-placed__resize"
                        aria-label={`Resize ${kind}`}
                        onPointerDown={(e) => handleResizePointerDown(e, selectedItem)}
                        onPointerMove={handleResizePointerMove}
                        onPointerUp={handleResizePointerEnd}
                        onPointerCancel={handleResizePointerEnd}
                      />
                    </div>
                  );
                })()}
            </div>
          </div>

          {downloadError && <p>{downloadError}</p>}

          <div className="photo-editor-actions">
            <button type="button" onClick={handleDownload} disabled={!canDownload}>
              {downloading ? "Preparing…" : "Download"}
            </button>

            <button type="button" onClick={handleRedo}>
              Redo
            </button>
          </div>
        </div>

        {/* =========================
            RIGHT — CONTROLS
        ========================== */}
        <aside className="photo-editor-controls">
          <EditorControlRow
            label={selectedDesign?.name || "Blank"}
            onPrev={() => stepDesign(-1)}
            onNext={() => stepDesign(1)}
            disabled={options.length <= 1}
            thumb={selectedDesign?.image || template.baseImage}
          />

          <EditorControlRow
            label={
              avatarThumbs.length
                ? `avatar ${avatarPickIndex + 1}/${avatarThumbs.length}`
                : "no avatars"
            }
            onPrev={() => stepAvatar(-1)}
            onNext={() => stepAvatar(1)}
            onSelect={avatarThumbs.length ? handleAddAvatar : undefined}
            disabled={avatarThumbs.length <= 1}
            thumb={avatarThumbs[avatarPickIndex]}
          />

          <EditorControlRow
            label={pickedProp ? pickedProp.name : "no props"}
            onPrev={() => stepProp(-1)}
            onNext={() => stepProp(1)}
            onSelect={pickedProp ? handleAddProp : undefined}
            disabled={propCatalog.length <= 1}
            thumb={pickedProp?.image}
          />

          <button type="button" className="editor-drawing-tools" disabled title="Coming soon">
            Drawing Tools
          </button>
        </aside>
      </section>
    </main>
  );
}