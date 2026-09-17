import { useEffect, useState } from "react";
import { loadItemCatalog } from "../lib/itemCatalog.js";

const CATEGORIES = ["hair", "skinTone", "accessory"];

// Category tabs + grid of selectable pixel-art items.
export default function ItemPicker({ selected = {}, onSelect }) {
  const [catalog, setCatalog] = useState(null);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  useEffect(() => {
    loadItemCatalog().then(setCatalog).catch(console.error);
  }, []);

  if (!catalog) return <div>Loading items…</div>;

  const items = catalog[activeCategory] || [];

  return (
    <div className="item-picker">
      <div className="item-picker__tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={cat === activeCategory ? "active" : ""}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="item-picker__grid">
        {items.map((item) => (
          <button
            key={item.id}
            className={selected[activeCategory] === item.id ? "selected" : ""}
            onClick={() => onSelect(activeCategory, item.id)}
          >
            <img src={item.assetPath} alt={item.name} />
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
