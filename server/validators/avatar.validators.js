const { body } = require('express-validator');

const avatarConfigValidation = [
  body('hairId').isMongoId().withMessage('Invalid hairId'),
  body('skinToneId').isMongoId().withMessage('Invalid skinToneId'),
  body('accessoryIds').optional().isArray().withMessage('accessoryIds must be an array'),
  body('accessoryIds.*').isMongoId().withMessage('Invalid accessory id'),
];

module.exports = { avatarConfigValidation };