
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

  return catalog;
}
