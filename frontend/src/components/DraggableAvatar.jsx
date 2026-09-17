import { useRef, useState } from "react";

// Renders the composed avatar (skinTone/hair/accessory layers) as a
// draggable overlay on top of a captured photo. Reports placement changes
// (x, y, scale) up to the parent so it can be baked in via canvasUtils.
export default function DraggableAvatar({ avatarConfig, placement, onPlacementChange }) {
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handlePointerDown(e) {
    setDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origin: placement };
  }

  function handlePointerMove(e) {
    if (!dragging || !dragRef.current) return;
    const { startX, startY, origin } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    onPlacementChange({ ...origin, x: origin.x + dx, y: origin.y + dy });
  }

  function handlePointerUp() {
    setDragging(false);
    dragRef.current = null;
  }

  // TODO: layer skinTone -> hair -> accessory images at placement.x/y, scaled by placement.scale
  return (
    <div
      className="draggable-avatar"
      style={{
        position: "absolute",
        left: placement?.x ?? 0,
        top: placement?.y ?? 0,
        transform: `scale(${placement?.scale ?? 1})`,
        cursor: dragging ? "grabbing" : "grab",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* avatarConfig layers render here */}
    </div>
  );
}
