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
    uploadErrors = "file is require to be an image";
  }
  return next();
};
const emailValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Please provide a vlaid email")
    .bail(),
  errorResponse,
];

const nullableEmailValidation = [
  body("email")
    .trim()
    .optional({ nullable: true })
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Please provide a vlaid email")
    .bail(),
  errorResponse,
];
const nameValidation = [
  body("name")
    .notEmpty()
    .withMessage("name can not be empty!")
    .bail()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters required for the name")
    .bail()
    .escape()
    .notEmpty()
    .withMessage("Name can not be empty!")
    .bail(),
  errorResponse,
];
const surNameValidation = [
  body("surname")
    .notEmpty()
    .withMessage("surname can not be empty!")
    .bail()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters required for the surname")
    .bail()
    .escape()
    .notEmpty()
    .withMessage("surname can not be empty!")
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
    .bail()
    .notEmpty()
    .withMessage("Password can not be empty!"),
  errorResponse,
];

const loginPasswordValidation = [
  body("password").notEmpty().withMessage("Password is requierd").bail(),
  errorResponse,
];
const phoneValdation = [
  body("phone")
    .notEmpty()
    .withMessage("phone can not be empty!")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Minimum 6 characters required for the phone!")
    .bail(),
  errorResponse,
];
const nullablePhoneValdation = [
  body("phone")
    .optional({ nullable: true })
    .notEmpty()
    .withMessage("phone can not be empty!")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Minimum 6 characters required for the phone!")
    .bail(),
  errorResponse,
];
const addressValdation = [
  body("address")
    .notEmpty()
    .withMessage("address can not be empty!")
    .isLength({ max: 250 })
    .optional({ nullable: true })
    .withMessage("Maxmium 250 characters required for the address!")
    .bail(),
  errorResponse,
];
const dateValidation = [
  body("birthdate")
    .notEmpty()
    .withMessage("birthdate can not be empty!")
    .bail()
    .isDate({ format: "yyyy-mm-dd" })
    .withMessage("please enter a vaild birthdate ! ")
    .bail(),
  errorResponse,
];
const imageValdation = [
  check("avatar")
    .custom((value, { req }) => {
      if (req.file) {
        return true;
      }
      return false;
    })
    .withMessage(function () {
      return `The icon is invalid: ${uploadErrors?.toLocaleLowerCase()}`;
    }),
  errorResponse,
];
const logoValdation = [
  check("logo")
    .custom((value, { req }) => {
      if (req.file) {
        return true;
      }
      return false;
    })
    .withMessage(function () {
      return `The icon is invalid: ${uploadErrors?.toLocaleLowerCase()}`;
    }),
  errorResponse,
];

const genderList = ["Male", "Female", "male", "female"];
const genderValidation = [
  body("gender")
    .notEmpty()
    .withMessage("gender can not be empty!")
    .custom((value) => {
      if (!genderList.includes(value)) {
        throw new Error("Please provide a valid gender type");
      }
      return true;
    }),
  errorResponse,
];
var response = "";
const titleList = ["Ms", "Mr", "Miss", "Mrs"];
const titleValidation = [
  body("title")
    .notEmpty()
    .withMessage("title can not be empty!")
    .custom((value) => {
      if (!titleList.includes(value)) {
        throw new Error("Please enter a valid title type");
      }
      return true;
    }),
  errorResponse,
];

const urlValidation = [
  body("website")
    .matches(
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
    )
    .withMessage("Please Enter a vlaid website link!")
    .bail()
    .notEmpty()
    .withMessage("Website link can not be empty!"),
  errorResponse,
];

module.exports = {
  nameValidation,
  emailValidation,
  passwordValidation,
  phoneValdation,
  addressValdation,
  surNameValidation,
  dateValidation,
  imageValdation,
  checkUpload,
  genderValidation,
  titleValidation,
  nullableEmailValidation,
  nullablePhoneValdation,
  loginPasswordValidation,
  logoValdation,
  urlValidation,
};
