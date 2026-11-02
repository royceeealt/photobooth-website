import React from "react";

export const FRAME_PASTELS = [
  "#F8C8DC", "#FFD6B0", "#FFF1A8", "#C8EBC8", "#BFE3F5", "#D9C8F0",
];
export const DEFAULT_FRAME_COLOUR = FRAME_PASTELS[0];

export default function FrameColourPicker({ value, onChange }) {
  return (
    <div className="frame-colour-picker">
      <span className="frame-colour-picker__label">Frame colour</span>

      <div className="frame-colour-picker__swatches">
        {FRAME_PASTELS.map((color) => (
          <button
            key={color}
            type="button"
            className={"colour-swatch" + (value.toLowerCase() === color.toLowerCase() ? " colour-swatch--selected" : "")}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            aria-label={`Select frame colour ${color}`}
          />
        ))}
      </div>

      <label className="custom-colour">
        Custom
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}