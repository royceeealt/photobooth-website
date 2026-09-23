import React from "react";

export default function ColorPicker({
  label,
  value,
  presets,
  onChange,
}) {
  return (
    <div className="color-picker">
      <p className="color-picker__label">
        {label}
      </p>

      <div className="color-picker__presets">
        {presets.map((color) => (
          <button
            key={color}
            type="button"
            className={
              value === color
                ? "color-swatch selected"
                : "color-swatch"
            }
            style={{
              backgroundColor: color,
            }}
            onClick={() => onChange(color)}
            aria-label={`Select ${color}`}
          />
        ))}

        <label className="custom-color">
          <span>Custom</span>

          <input
            type="color"
            value={value}
            onChange={(event) =>
              onChange(event.target.value)
            }
          />
        </label>
      </div>
    </div>
  );
}