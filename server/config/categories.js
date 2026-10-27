// avatarConfig key (frontend) -> Item.category (database)
const ITEM_KEYS = {
  body: 'bodyType',
  skinTone: 'skinTone',
  hair: 'hair',
  eyebrows: 'eyebrows',
  eyes: 'eyes',
  nose: 'nose',
  lips: 'lips',
  top: 'top',
  bottom: 'bottom',
  dresses: 'dresses',
  footwear: 'footwear',
  facialAccessories: 'facialAccessories',
  accessories: 'accessories',
};

const COLOR_KEYS = [
  'skinColor',
  'hairColor',
  'topColor',
  'bottomColor',
  'lipsColor',
  'footwearColor',
  'accessoryColor',
  'eyesColor',
];

module.exports = { ITEM_KEYS, COLOR_KEYS, ALL: Object.values(ITEM_KEYS) };