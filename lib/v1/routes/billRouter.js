var express = require("express");
const { store } = require("../controllers/billController");
var router = express.Router();


router.post("/", store);
router.post("/billByUser", store);


module.exports = router