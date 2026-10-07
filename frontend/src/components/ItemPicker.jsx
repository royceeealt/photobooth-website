import React from "react";
import { useEffect, useState } from "react";
import { loadItemCatalog } from "../lib/itemCatalog.js";

export default function ItemPicker({
  category,
  selected = {},
  onSelect,
  avatarView,
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
  }, [category, avatarView]);

  if (!catalog) {
    return <div className="item-picker-loading">Loading items…</div>;
  }

  const allItems = catalog[category] || [];

  const items = catalog[category] || [];

  const visibleItems = items.slice(
    startIndex,
    startIndex + 3
  );

  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + 3 < items.length;

  return (
    <div className="item-picker">
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
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  selected[category] === item.id
                    ? "item-card selected"
                    : "item-card"
                }
                onClick={() =>
                  onSelect(category, item.id)
                }
              >
                <img
                  src={item.assetPath}
                  alt={item.name}
                />

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
                Math.min(
                  items.length - 3,
                  current + 1
                )
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