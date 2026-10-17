const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const validate = require('../middleware/validate');
const { saveAvatars, getAvatars } = require('../controllers/users.controller');
const { avatarsValidation } = require('../validators/avatar.validators');

router.get('/avatars', authGuard, getAvatars);
router.put('/avatars', authGuard, avatarsValidation, validate, saveAvatars);

module.exports = router;