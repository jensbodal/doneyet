var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.app.dbo);
  res.send("OK thx");
});

module.exports = router;
