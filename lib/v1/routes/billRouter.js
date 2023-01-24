var express = require("express");
const { store } = require("../controllers/billController");
var router = express.Router();


router.post("/", store);

module.exports = router