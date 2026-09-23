import React from "react";
import { useEffect, useState } from "react";
import { loadItemCatalog } from "../lib/itemCatalog.js";

export default function ItemPicker({
  category,
  selected = {},
  onSelect,
}) {
  const [catalog, setCatalog] = useState(null);

  useEffect(() => {
    loadItemCatalog()
      .then(setCatalog)
      .catch(console.error);
  }, []);

  if (!catalog) {
    return <div className="item-picker-loading">Loading items…</div>;
  }

  const items = catalog[category] || [];

  return (
    <div className="item-picker">

      <div className="item-picker__grid">

        {items.length === 0 ? (
          <p className="item-picker__empty">
            No items available yet.
          </p>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              className={
                selected[category] === item.id
                  ? "item-card selected"
                  : "item-card"
              }
              onClick={() => onSelect(category, item.id)}
            >
              <img
                src={item.assetPath}
                alt={item.name}
              />

              <span>
                {item.name}
              </span>
            </button>
          ))
        )}

      </div>

    </div>
  );
}