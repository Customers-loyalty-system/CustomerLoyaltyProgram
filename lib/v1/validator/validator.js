const { validationResult, body, check } = require("express-validator");
const multer = require("multer");

const errorResponse = (req, res, next) => {
  const httpResponse = {
    success: false,
    data: null,
    messages: [],
  };
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors
      .array()
      .forEach((error) => httpResponse.messages.push(`${error.msg}`));
    res.status(422);
    return res.send(httpResponse);
  }
  return next();
};

let uploadErrors = "";

const checkUpload = (err, next) => {
  if (err instanceof multer.MulterError) {
    uploadErrors = err.message;
  } else if (err) {
    uploadErrors = "file is required to be an image";
  }
  return next();
};
const emailValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email is require")
    .notEmpty()
    .withMessage("Please provide a vlaid email")
    .bail(),
  errorResponse,
];
const nameValidation = [
  body("name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters required for the name")
    .escape()
    .notEmpty()
    .withMessage("Name can not be empty!")
    .bail(),
  errorResponse,
];
const passwordValidation = [
  body("password")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    )
    .withMessage(
      "Password should be at least 6 charaters and contains capital, small ,numbers and spical charaters"
    )
    .notEmpty()
    .withMessage("Password can not be empty!"),
  errorResponse,
];
const phoneValdation = [
  body("phone")
    .isLength({ min: 6 })
    .optional({ nullable: true })
    .withMessage("Minimum 6 characters required for the phone!"),
  errorResponse,
];
const addressValdation = [
  body("address")
    .isLength({ max: 250 })
    .optional({ nullable: true })
    .withMessage("Maxmium 250 characters required for the address!"),
  errorResponse,
];

module.exports = {
  nameValidation,
  emailValidation,
  passwordValidation,
  phoneValdation,
  addressValdation,
};
