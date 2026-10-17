const { body } = require('express-validator');
const { ITEM_KEYS, COLOR_KEYS } = require('../config/categories');

const avatarsValidation = [
  body('avatars')
    .isArray({ min: 1, max: 5 })
    .withMessage('avatars must be an array of 1 to 5'),
  body('avatars.*').isObject().withMessage('Each avatar must be an object'),

  // item ids: whole numbers, null allowed (nothing selected)
  ...Object.keys(ITEM_KEYS).map((k) =>
    body(`avatars.*.${k}`)
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage(`Invalid ${k}`)
  ),

  // colors: hex strings like #B97856
  ...COLOR_KEYS.map((k) =>
    body(`avatars.*.${k}`)
      .optional({ nullable: true })
      .isHexColor()
      .withMessage(`Invalid ${k}`)
  ),
];

module.exports = { avatarsValidation };