const { body } = require("express-validator");

const emailRule = () =>
  body("email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
    });

const signupValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 30 })
    .withMessage("Full name must be between 2 and 30 characters"),

  emailRule(),

  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("Password must contain at least 6 characters"),
];

const loginValidation = [
  emailRule(),

  body("password")
    .isString()
    .notEmpty()
    .withMessage("Password is required"),
];

module.exports = {
  signupValidation,
  loginValidation,
};