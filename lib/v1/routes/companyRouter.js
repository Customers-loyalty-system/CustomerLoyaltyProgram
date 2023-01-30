const express = require("express");
const router = express.Router();
const { storage, uploadFilter } = require("../utils/storageUtil");
const multer = require("multer");
const {
  nameValidation,
  emailValidation,
  passwordValidation,
  phoneValdation,
  logoValdation,
  urlValidation,
  checkUpload,
  addressValdation,
} = require("../validator/validator");
const {
  store,
  login,
  show,
  update,
  destroy,
  index,
  paymentLogin,
  getCompanyMembers,
  getCompanyMembersRelations,
} = require("../controllers/companyController");
const isAuthenticated = require("../authenticator/isAuthenticated");
const isAuthorized = require("../authenticator/isAuthorized");

const upload = multer({
  storage: storage,
  fileFilter: uploadFilter("image"),
  limits: { fileSize: 1_000_000 },
}).single("logo");

router.post(
  "/register",
  (req, res, next) => {
    upload(req, res, (err) => {
      checkUpload(err, next);
    });
  },
  logoValdation,
  nameValidation,
  emailValidation,
  passwordValidation,
  phoneValdation,
  urlValidation,
  addressValdation,
  store
);

router.post("/login", emailValidation, passwordValidation, login);
router.post(
  "/login/paymentlogin",
  emailValidation,
  passwordValidation,
  paymentLogin
);

router.get(
  "/",
  isAuthenticated,
  (req, res, next) => {
    isAuthorized(req, res, next, {
      admin: { matchId: false },
      superadmin: { matchId: false },
    });
  },
  index
);
router.get(
  "/members",
  isAuthenticated,
  (req, res, next) => isAuthorized(req, res, next, { company: {matchId:false}}),
  getCompanyMembers
);
router.get(
  "/relations",
  isAuthenticated,
  (req, res, next) => isAuthorized(req, res, next, { company: {matchId:false}}),
  getCompanyMembersRelations
);

router.get(
  "/:id",
  isAuthenticated,
  (req, res, next) => {
    isAuthorized(req, res, next, {
      admin: { matchId: false },
      superadmin: { matchId: false },
      company: { matchId: true },
    });
  },
  show
);

router.put(
  "/:id",
  isAuthenticated,
  (req, res, next) => {
    isAuthorized(req, res, next, {
      company: { matchId: true },
    });
  },
  (req, res, next) => {
    upload(req, res, (err) => {
      checkUpload(err, next);
    });
  },
  logoValdation,
  nameValidation,
  emailValidation,
  passwordValidation,
  phoneValdation,
  urlValidation,
  addressValdation,
  update
);

router.delete(
  "/:id",
  isAuthenticated,
  (req, res, next) => {
    isAuthorized(req, res, next, {
      company: { matchId: true },
    });
  },
  destroy
);
module.exports = router;
