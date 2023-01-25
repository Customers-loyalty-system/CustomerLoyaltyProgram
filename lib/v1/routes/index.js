var express = require('express');
var router = express.Router();

router.use('/bills', require('./billRouter'));
router.use('/users', require('./userRouter'));


module.exports = router;
