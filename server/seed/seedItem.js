require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const Item = require('../models/Item');

const SOURCE_DIR = path.join(__dirname, 'assets-source');
const categories = ['eyes', 'lips', 'top', 'bottom'];

function nameFromFilename(filename) {
  return path
    .basename(filename, path.extname(filename))
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()); // "short-brown.png" -> "Short Brown"
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Item.deleteMany({});

  const allItems = [];

  for (const category of categories) {
    const categoryDir = path.join(SOURCE_DIR, category);
    if (!fs.existsSync(categoryDir)) {
      console.log(`Skipping ${category} — no folder found`);
      continue;
    }

    const files = fs.readdirSync(categoryDir).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));

    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(categoryDir, files[i]);
      console.log(`Uploading ${category}/${files[i]}...`);

      const result = await cloudinary.uploader.upload(filePath, {
        folder: `photobooth-items/${category}`,
      });

      allItems.push({
        category,
        name: nameFromFilename(files[i]),
        assetUrl: result.secure_url,
        sortOrder: i + 1,
      });
    }
  }

  await Item.insertMany(allItems);
  console.log(`Seeded ${allItems.length} items into Mongo, uploaded to Cloudinary.`);
  process.exit();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});