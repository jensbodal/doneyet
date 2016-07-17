var express = require('express');
var router = express.Router();
var app = require('../app');
var ObjectId = require('mongodb').ObjectId;

/* GET home page. */
router.get('/', function(req, res, next) {
  var response = {
    'HTTP OK': '200'
  };
  res.send(response);
});

/* GET a specific timer by oid */
router.get('/timer', function(req, res, next) {
  console.log('[/timer/what?] ' + req.headers.authorization);
  var oid = new ObjectId(req.query.oid);
  app.dbo.collection('timers').findOne(
    {'_id':oid}, 
    function(err, result) {
      if (err) {
        console.log('ERROR');
        res.send({'ERROR':'ERROR MESSAGE'});
      }
      else {
        res.send(result);
      }
  });
});

/* GET a specific timer by _id */
router.get('/timers/:oid', function(req, res, next) {
  console.log('[/timers/:oid] ' + req.headers.authorization);
  var oid = new ObjectId(req.params.oid);
  app.dbo.collection('timers').findOne(
    {'_id':oid}, 
    function(err, result) {
      if (err) {
        console.log('ERROR');
        res.send({'ERROR':'ERROR MESSAGE'});
      }
      else {
        res.send(result);
      }
  });
});

/* GET all timers */
router.get('/timers', function(req, res, next) {
  console.log('[/timers] GET');
  var id = req.params.id;
  var something = app.dbo.collection('timers').find()
    .toArray(function(err, result) {
      if (err) {
        console.log('ERROR');
        res.send({'ERROR':'ERROR MESSAGE'});
      }
      else {
        res.send(result);
      }
  });
});

/* POST add new timer */
router.post('/timers', function(req, res) {
  console.log('[/timers] POST ');
  var token = req.headers.token;
  var username = req.headers.username;
  var uuid = req.headers.uuid;
  var timer = req.body;
  
  timer.userIds = [
    new ObjectId(uuid)
  ];
  if (validateTimer(timer)) {
    app.dbo.collection('timers').insertOne(
      timer, 
      function(err, result) {
        if (err) {
          console.log('ERROR');
          res.status(500).send({ error:'Unabled to create new timer'});
        }
        else {
          res.send(result);
        }
    });
  }
  else {
    res.status(400).send({ error: 'Invalid Timer Object', 'data':timer });    
  }
});

/* DELETE an existing timer */
router.delete('/timers/:oid', function(req, res) {
  console.log('[/timers/:oid] DEL ' + req.headers.authorization);
  var oid = new ObjectId(req.params.oid);
  app.dbo.collection('timers')
  .removeOne({'_id': oid})
  .then(function(succ) {
    res.send('OK');
  }, function error(result) {
    console.log('error');
    res.send('FAIL');
  });
});

/* PUT an existing timer */
router.put('/timers', function(req, res) {
  console.log('[/timers] PUT ' + req.headers.authorization);
  var timer = req.body;
  var oid = new ObjectId(timer._id);
  delete timer._id; // cannot reinsert same ID so need to remove this from our insert object

  if (validateTimer(timer)) {
    console.log('Update action requested');
    console.log(oid);
    console.log(timer.name);
    app.dbo.collection('timers')
    .findOne({_id: oid}, function (err, response) {
      if (false) {
        console.log("???????????????????????");
        res.status(500).send("ERROR UPDATING TIMER");
      }
      else {
        console.log("FOUND IT");
        timer.userIds = response.userIds;
        app.dbo.collection('timers')
        .updateOne({'_id':oid}, timer)
        .then(function(succ) {
          res.send('OK');
        }, function error(result) {
          console.log(result);
          console.log('error updating object');
          res.status(500).send({ error: 'Server could not find object to update'});
      })
    });
  }
  else {
    console.log('invalid timer requested to update');
    res.status(400).send({ error: 'Invalid Timer Object Requested' });
  }
});

function validateTimer(timer) {
  return true;
}

function validateUser(user) {
  return true;
}

/* POST register/login user */
router.post('/users', function(req, res) {
  var user = req.body;
  if (validateUser(user)) {
    var username = user.username;

    app.dbo.collection('users').findOne({username: username}, function(err, result) {
      // user doesn't exist
      if (err === null && result === null) {
        app.dbo.collection('users').insertOne({username: username}, function (err, result) {
          console.log("Created user: " + username);
          var newUser = {
            _id: result.insertedId,
            username: username
          };

          res.status(200).send(
            {
              user: newUser,
              token: 'NOT_IMPLEMENTED'
            }
          );
        });
      }
      // user exists so don't create one
      else {
          res.status(200).send(
            {
              user: result,
              token: 'NOT_IMPLEMENTED'
            }
          );
      }
    });
  }
  else {
    res.status(400).send({ error: 'Invalid Timer Object', 'data':username });    
  }
});

module.exports = router;
