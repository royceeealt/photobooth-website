const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const { saveAvatarConfig, getAvatarConfig } = require('../controllers/users.controller');
const { avatarConfigValidation } = require('../validators/avatar.validators');
const validate = require('../middleware/validate');

router.get('/avatar', authGuard, getAvatarConfig);
router.put('/avatar', authGuard, avatarConfigValidation, validate, saveAvatarConfig);

module.exports = router;