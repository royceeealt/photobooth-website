
import React, { useEffect, useState } from "react";
import { loadItemCatalog } from "../lib/itemCatalog.js";

export default function ItemPicker({
  category,
  selected = {},
  onSelect,
  avatarView,
  accessorySlot = 0,
  onAccessorySelect,
}) {
  const [catalog, setCatalog] = useState(null);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    loadItemCatalog()
      .then(setCatalog)
      .catch(console.error);
  }, []);

  useEffect(() => {
    setStartIndex(0);
  }, [category, avatarView, accessorySlot]);

  if (!catalog) {
    return <div className="item-picker-loading">Loading items…</div>;
  }

  const items = catalog[category] || [];

  const isAccessories = category === "accessories";

  const accessoryItems = Array.isArray(selected.accessories)
    ? selected.accessories
    : [];

  const selectedItem = isAccessories
    ? accessoryItems[accessorySlot]?.item ?? null
    : selected[category];

  const visibleItems = items.slice(startIndex, startIndex + 3);

  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + 3 < items.length;

  function handleSelect(itemId) {
    if (isAccessories) {
      onAccessorySelect?.(accessorySlot, itemId);
      return;
    }

    onSelect(
      category,
      selectedItem === itemId ? null : itemId
    );
  }

  return (
    <div className="item-picker">
      {isAccessories && (
        <button
          type="button"
          className={
            selectedItem === null
              ? "item-card selected"
              : "item-card"
          }
          onClick={() => handleSelect(null)}
        >
          <span>✕</span>
          <span>Empty</span>
        </button>
      )}

      {items.length === 0 ? (
        <p className="item-picker__empty">
          No items available yet.
        </p>
      ) : (
        <div className="item-picker__catalogue">
          <button
            type="button"
            className="catalogue-arrow"
            disabled={!canGoBack}
            onClick={() =>
              setStartIndex((current) =>
                Math.max(0, current - 1)
              )
            }
          >
            ←
          </button>

          <div className="item-picker__track">
            {isAccessories && (
              <button
                type="button"
                className={
                  selectedItem === null
                    ? "item-card item-card--empty selected"
                    : "item-card item-card--empty"
                }
                onClick={() => handleSelect(null)}
              >
                <span>✕</span>
                <span>Empty</span>
              </button>
            )}
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  selectedItem === item.id
                    ? "item-card selected"
                    : "item-card"
                }
                onClick={() => handleSelect(item.id)}
              >
                <img src={item.assetUrl} alt={item.name} />
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="catalogue-arrow"
            disabled={!canGoForward}
            onClick={() =>
              setStartIndex((current) =>
                Math.min(items.length - 3, current + 1)
              )
            }
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
