const express = require("express");
const isAuthenticated = require("../authenticator/isAuthenticated");
const isAuthorized = require("../authenticator/isAuthorized");
const {
  store,
  login,
  update,
  show,
  destroy,
  index,
} = require("../controllers/adminController");
const {
  nameValidation,
  emailValidation,
  passwordValidation,
  nullableEmailValidation,
} = require("../validator/validator");
const router = express.Router();

router.post(
  "/register",
  isAuthenticated,
  (req, res, next) =>
    isAuthorized(req, res, next, {
      superadmin: { matchId: false },
    }),
  nameValidation,
  emailValidation,
  passwordValidation,
  store
);
router.get(
  "/",
  isAuthenticated,
  (req, res, next) => {
    isAuthorized(req, res, next, {
      superadmin: { matchId: false },
    });
  },
  index
);
router.put(
  "/:id",
  isAuthenticated,
  (req, res, next) => {
    isAuthorized(req, res, next, { admin: { matchId: true } });
  },
  nameValidation,
  emailValidation,
  passwordValidation,
  update
);

router.get(
  "/:id",
  isAuthenticated,
  (req, res, next) => {
    isAuthorized(req, res, next, { admin: { matchId: true } });
  },
  show
);


router.post("/login", nullableEmailValidation, passwordValidation, login);

router.delete(
  "/:id",
  isAuthenticated,
  (req, res, next) => {
    isAuthorized(req, res, next, {
      superadmin: { matchId: false },
    });
  },
  destroy
);
module.exports = router;
