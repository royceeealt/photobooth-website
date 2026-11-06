
import { api } from "./api.js";

export async function loadItemCatalog() {
  const items = await api.get("/items");

  if (!Array.isArray(items)) {
    throw new Error("Invalid response from GET /api/items");
  }

  // Group database records by their backend category.
  // Example: { bodyType: [...], hair: [...], accessories: [...] }
  const catalog = {};

  for (const item of items) {
    if (
      !item.category ||
      item.itemId === undefined ||
      item.itemId === null ||
      !item.assetUrl
    ) {
      console.warn("Skipping invalid asset record:", item);
      continue;
    }

    const category = item.category;

    if (!catalog[category]) {
      catalog[category] = [];
    }

    catalog[category].push({
      id: Number(item.itemId),
      name: item.name,
      assetUrl: item.assetUrl,
      halfAssetUrl: item.halfAssetUrl || null,
    });
  }

  // Display items in their intended numeric order.
  for (const category of Object.keys(catalog)) {
    catalog[category].sort((a, b) => a.id - b.id);
  }

  // Keep locally bundled accessories selectable even when the database has
  // not been seeded with the latest assets yet. API records take precedence.
  const manifestResponse = await fetch("/assets/items/itemManifest.json");
  if (manifestResponse.ok) {
    const manifest = await manifestResponse.json();
    const accessoryItems = (manifest.accessory || []).map((item) => ({
      id: Number(item.id.match(/\d+$/)?.[0]),
      name: item.name,
      assetUrl: item.assetPath,
      halfAssetUrl: null,
    })).filter((item) => Number.isFinite(item.id));

    const byId = new Map(accessoryItems.map((item) => [item.id, item]));
    for (const item of catalog.accessories || []) {
      byId.set(item.id, item);
    }
    catalog.accessories = [...byId.values()].sort((a, b) => a.id - b.id);
  }

  return catalog;
}
