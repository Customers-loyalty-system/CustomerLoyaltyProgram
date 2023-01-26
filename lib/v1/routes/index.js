var express = require("express");
var router = express.Router();

router.use("/bills", require("./billRouter"));
router.use("/users", require("./userRouter"));
router.use("/admins", require("./adminRouter"));
router.use("/companies", require("./companyRouter"));



module.exports = router;
