const express = require("express");
const isAuthenticated = require("../authenticator/isAuthenticated");
const isAuthorized = require("../authenticator/isAuthorized");
const { index, show } = require("../controllers/activityController");
const router = express.Router();

router.get(
  "/",
  isAuthenticated,
  (req, res, next) =>
    isAuthorized(req, res, next, {
      company: { matchId: false },
      user: { matchId: false },
      admin: { matchId: false },
      superadmin: { matchId: false },
    }),
  index
);
router.get(
  "/:id",
  isAuthenticated,
  (req, res, next) =>
    isAuthorized(req, res, next, {
      company: { matchId: false },
      user: { matchId: false },
      admin: { matchId: false },
      superadmin: { matchId: false },
    }),
  show
);
module.exports = router