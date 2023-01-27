const express = require("express");
const isAuthenticated = require("../authenticator/isAuthenticated");
const isAuthorized = require("../authenticator/isAuthorized");
const { store, index } = require("../controllers/membershipController");
const { phoneValdation } = require("../validator/validator");
const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  (req, res, next) => {
    isAuthorized(req, res, next, {
      company: { matchId: false },
    });
  },
  phoneValdation,
  store
);
router.get("/:id", isAuthenticated, (req, res, next) => {
  isAuthorized(req, res, next, {
    admin: { matchId: false },
    superadmin: { matchId: false },
    company: { matchId: true },
    user: { matchId: true },
  })
}, index);
module.exports = router;
