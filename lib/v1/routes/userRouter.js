const express = require("express");
const {
  nameValidation,
  surNameValidation,
  emailValidation,
  phoneValdation,
  dateValidation,
  checkUpload,
  imageValdation,
  genderValidation,
  titleValidation,
  passwordValidation,
  nullableEmailValidation,
  nullablePhoneValdation,
  loginPasswordValidation,
} = require("../validator/validator");
const router = express.Router();
const { storage, uploadFilter } = require("../utils/storageUtil");
const multer = require("multer");
const { store, login } = require("../controllers/userController");

const upload = multer({
  storage: storage,
  fileFilter: uploadFilter("image"),
  limits: { fileSize: 1_000_000 },
}).single("avatar");

router.post(
  "/register",
  (req, res, next) => {
    upload(req, res, (err) => {
      checkUpload(err, next);
    });
  },
  imageValdation,
  nameValidation,
  surNameValidation,
  emailValidation,
  passwordValidation,
  phoneValdation,
  dateValidation,
  genderValidation,
  titleValidation,
  store
);

router.post(
  "/login",
  loginPasswordValidation,
  login
);

module.exports = router;
