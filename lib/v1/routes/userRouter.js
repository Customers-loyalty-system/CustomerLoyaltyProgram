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
  nullablePhoneValdation,
  loginPasswordValidation,
} = require("../validator/validator");
const router = express.Router();
const { storage, uploadFilter } = require("../utils/storageUtil");
const multer = require("multer");
const {
  store,
  login,
  show,
  update,
  destroy,
} = require("../controllers/userController");
const isAuthenticated = require("../authenticator/isAuthenticated");
const isAuthorized = require("../authenticator/isAuthorized");

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

router.post("/login", nullablePhoneValdation, loginPasswordValidation, login);

router.get(
  "/:id",
  isAuthenticated,
  (req, res, next) => {
    isAuthorized(req, res, next, {
      user: { matchId: true },
      admin: { matchId: false },
    });
  },
  show
);

router.put(
  "/:id",
  isAuthenticated,
  (req, res, next) => {
    isAuthorized(req, res, next, {
      user: { matchId: true },
      admin: { matchId: false },
    });
  },
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
  update
);

router.delete(
  "/:id",
  isAuthenticated,
  (req, res, next) => {
    isAuthorized(req, res, next, {
      user: { matchId: true },
      admin: { matchId: false },
    });
  },
  destroy
);

module.exports = router;
