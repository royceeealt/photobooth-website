const express = require("express");

const router = express.Router();

const {
  signup,
  login,
  me,
} = require("../controllers/auth.controller");

const {
  signupValidation,
  loginValidation,
} = require("../validators/auth.validators");

const validate = require("../middleware/validate");
const authGuard = require("../middleware/authGuard");

router.post("/signup", signupValidation, validate, signup);
router.post("/login", loginValidation, validate, login);
router.get("/me", authGuard, me);

module.exports = router;