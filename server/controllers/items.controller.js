import Item from "../models/Item.js";

// Only needed if items are served from the DB rather than the static
// public/assets/items/itemManifest.json.
export async function getItems(req, res, next) {
  try {
    const items = await Item.find();
    const grouped = items.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    }, {});
    res.json(grouped);
  } catch (err) {
    next(err);
  }
}
