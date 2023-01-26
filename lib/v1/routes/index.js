var express = require("express");
var router = express.Router();

router.use("/bills", require("./billRouter"));
router.use("/users", require("./userRouter"));
router.use("/admins", require("./adminRouter"));

module.exports = router;
