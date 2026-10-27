require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Item = require('../models/Item');

const ASSETS_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'assets', 'items');
const URL_PREFIX = '/assets/items';

// repo folder name -> category in the database
const FOLDER_TO_CATEGORY = {
  body: 'bodyType',
  hair: 'hair',
  eyes: 'eyes',
  lips: 'lips',
  tops: 'top',
  pants: 'bottom',
  footwear: 'footwear',
  accessory: 'accessories',
};

const DRY = process.argv.includes('--dry');
const UPLOAD = process.argv.includes('--upload');
const cloudinary = UPLOAD ? require('../config/cloudinary') : null;

const entries = new Map(); // "category:itemId" -> entry

// "eyes01.png" -> 1, "hair_01.png" -> 1, "eyes.png" -> 0, "body-half.png" -> 0 (half variant)
function parse(file) {
  const base = path.basename(file, path.extname(file));
  const isHalf = /-half$/i.test(base);
  const digits = base.replace(/-half$/i, '').match(/(\d+)$/);
  return { itemId: digits ? parseInt(digits[1], 10) : 0, isHalf };
}

function scan(dir, urlPrefix, half) {
  if (!fs.existsSync(dir)) return;
  for (const folder of fs.readdirSync(dir)) {
    const category = FOLDER_TO_CATEGORY[folder];
    const folderPath = path.join(dir, folder);
    if (!category || !fs.statSync(folderPath).isDirectory()) continue;

    for (const file of fs.readdirSync(folderPath).filter((f) => /\.png$/i.test(f))) {
      const { itemId, isHalf } = parse(file);
      const key = `${category}:${itemId}`;
      const entry = entries.get(key) || {
        category,
        itemId,
        name: `${folder}_${String(itemId).padStart(2, '0')}`,
      };
      const asset = { disk: path.join(folderPath, file), url: `${urlPrefix}/${folder}/${file}` };
      if (half || isHalf) entry.half = asset;
      else entry.full = asset;
      entries.set(key, entry);
    }
  }
}

async function resolveUrl(asset, category) {
  if (!UPLOAD) return asset.url;
  const result = await cloudinary.uploader.upload(asset.disk, { folder: `photobooth-items/${category}` });
  return result.secure_url;
}

async function seed() {
  scan(ASSETS_DIR, URL_PREFIX, false);
  scan(path.join(ASSETS_DIR, 'half'), `${URL_PREFIX}/half`, true);

  const all = [...entries.values()].sort(
    (a, b) => a.category.localeCompare(b.category) || a.itemId - b.itemId
  );
  all
    .filter((e) => !e.full)
    .forEach((e) => console.log(`WARNING: half image for ${e.category} id ${e.itemId} has no matching full image, skipping`));

  const valid = all.filter((e) => e.full);
  for (const e of valid) {
    console.log(`${e.category.padEnd(12)} id ${String(e.itemId).padStart(2)}  ${e.full.url}${e.half ? '  (+half)' : ''}`);
  }
  console.log(`${valid.length} items found`);
  if (DRY) return;

  await mongoose.connect(process.env.MONGO_URI);
  const ops = [];
  for (const e of valid) {
    const set = { name: e.name, sortOrder: e.itemId, assetUrl: await resolveUrl(e.full, e.category) };
    if (e.half) set.halfAssetUrl = await resolveUrl(e.half, e.category);
    ops.push({
      updateOne: {
        filter: { category: e.category, itemId: e.itemId },
        update: { $set: set },
        upsert: true,
      },
    });
  }
  await Item.bulkWrite(ops);
  console.log(`Upserted ${ops.length} items`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });