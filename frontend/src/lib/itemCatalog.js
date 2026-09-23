import { api } from "./api.js";

// Loads the pixel-item catalog. Defaults to the static manifest shipped in
// public/assets/items/itemManifest.json; swap to the GET /api/items call
// if items end up living in the DB instead.
const USE_STATIC_MANIFEST = true;

export async function loadItemCatalog() {
  if (USE_STATIC_MANIFEST) {
    const res = await fetch("/assets/items/itemManifest.json");
    if (!res.ok) throw new Error("Failed to load item manifest");
    return res.json(); // { hair: [...], skinTone: [...], accessory: [...] }
  }

  // TODO: shape this response the same as the static manifest ({category: [items]})
  return api.get("/items");
}
