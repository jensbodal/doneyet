var express = require('express');
var app = express();
var argv = require('minimist')(process.argv.slice(2));
var port = argv.p || 78868;
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/doneyet';

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected to MONGO DB");
  app.dbo = db; // req.app.dbo
  exports.dbo = db; // var app = require('../app'); exports.dbo = db;
});

/* ------------------------------------------------------------------------- */
/* How to access variables in routes */
var demoVar = "WORKS";
/* accessible via req.app.appVar */
app.appVar = demoVar; 
/* accessible via 
 * var app = require('../app');
 * app.exportsVar ...
 */
exports.exportsVar = demoVar; 
/* ------------------------------------------------------------------------- */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', require('./routes/api'));

// @todo these static routes should be specific to bower and npm I think... 
// as well as the angular folders needed
app.use(express.static('./src/client/'));
app.use(express.static('./'));
app.use(express.static('/tmp'));
app.use('/*', express.static('./src/client/index.html'));

console.log('Starting node');
console.log('PORT='+port);

app.listen(port, function() {
  console.log('Express server listening on port ' + port);
  console.log('\n__dirname = ' + __dirname + '\nprocess.cwd = ' + process.cwd());
});

module.exports = app;
