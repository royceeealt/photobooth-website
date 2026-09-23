import React, { useEffect, useRef, useState } from "react";
import { loadItemCatalog } from "../lib/itemCatalog.js";
import PixelSprite from "./character/PixelSprite.jsx";
export default function DraggableAvatar({
  avatarConfig,
  placement,
  onPlacementChange,
}) {
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [catalog, setCatalog] = useState(null);

  useEffect(() => {
    loadItemCatalog()
      .then(setCatalog)
      .catch((error) => {
        console.error("Failed to load avatar catalog:", error);
      });
  }, []);

  if (!catalog) {
    return null;
  }

  function getAsset(category, id) {
    if (!id) return null;

    return catalog[category]?.find(
      (item) => item.id === id
    )?.assetPath;
  }

  const layers = [
  {
    name: "body",
    src: getAsset(
      "body",
      avatarConfig?.body
    ),
    color: avatarConfig?.skinColor,
  },
  {
    name: "eyes",
    src: getAsset(
      "eyes",
      avatarConfig?.eyes
    ),
    color: null,
  },
  {
    name: "lips",
    src: getAsset(
      "lips",
      avatarConfig?.lips
    ),
    color: avatarConfig?.lipsColor,
  },
  {
    name: "top",
    src: getAsset(
      "top",
      avatarConfig?.top
    ),
    color: avatarConfig?.topColor,
  },
  {
    name: "bottom",
    src: getAsset(
      "bottom",
      avatarConfig?.bottom
    ),
    color: avatarConfig?.bottomColor,
  },
  {
    name: "footwear",
    src: getAsset(
      "footwear",
      avatarConfig?.footwear
    ),
    color:
      avatarConfig?.footwearColor ||
      "#222222",
  },
  {
    name: "hair",
    src: getAsset(
      "hair",
      avatarConfig?.hair
    ),
    color: avatarConfig?.hairColor,
  },
].filter((layer) => layer.src);

  function handlePointerDown(event) {
    event.preventDefault();

    setDragging(true);

    event.currentTarget.setPointerCapture?.(
      event.pointerId
    );

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,

      origin: {
        x: placement?.x ?? 0,
        y: placement?.y ?? 0,
        scale: placement?.scale ?? 1,
      },
    };
  }

  function handlePointerMove(event) {
    if (!dragging || !dragRef.current) return;

    const { startX, startY, origin } =
      dragRef.current;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    onPlacementChange({
      ...origin,
      x: origin.x + dx,
      y: origin.y + dy,
    });
  }

  function handlePointerUp(event) {
    setDragging(false);
    dragRef.current = null;

    event.currentTarget.releasePointerCapture?.(
      event.pointerId
    );
  }

  return (
    <div
      className="draggable-avatar"
      style={{
        position: "absolute",

        left: placement?.x ?? 50,
        top: placement?.y ?? 50,

        width: "124px",
        height: "127px",

        transform: `scale(${placement?.scale ?? 1})`,
        transformOrigin: "top left",

        cursor: dragging ? "grabbing" : "grab",

        touchAction: "none",
        userSelect: "none",

        zIndex: 20,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {layers.map((layer) =>
  layer.color ? (
    <PixelSprite
      key={layer.name}
      src={layer.src}
      color={layer.color}
      className=""
    />
  ) : (
    <img
      key={layer.name}
      src={layer.src}
      alt=""
      draggable={false}
      className="character-sprite"
    />
  )
)}
    </div>
  );
}