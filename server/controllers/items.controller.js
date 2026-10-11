const Item = require('../models/Item');
const asyncHandler = require('../middleware/asyncHandler');

const getItems = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const items = await Item.find(filter).sort('sortOrder');
  res.json(items);
});

module.exports = { getItems };