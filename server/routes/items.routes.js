const express = require('express');
const router = express.Router();
const { getItems } = require('../controllers/items.controller');

router.get('/', getItems); // GET /api/items or /api/items?category=hair

module.exports = router;