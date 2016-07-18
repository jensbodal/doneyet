var express = require('express');
var router = express.Router();
var app = require('../app');
var ObjectId = require('mongodb').ObjectId;

/* GET home page. */
router.get('/', function(req, res, next) {
  var response = {
    'HTTP OK': '200',
    'doneyet': 'welcome'
  };
  res.status(200).send(response);
});

/* GET a specific timer by _id */
router.get('/timers/:oid', function(req, res, next) {
  try {
    var uuid = new ObjectId(req.headers.uuid);
  }
  catch (error) {
    res.status(400).send({message: 'Invalid User ID Format', error: error.toString()});
  }

  try {
    var oid = new ObjectId(req.params.oid);
  }
  catch (error) {
    res.status(400).send({message: 'Invalid Timer ID Format', error: error.toString()});
  }
 
  app.dbo.collection('timers').findOne({'_id':oid})
  .then(function(results) {
    if (results == null) {
      res.status(404).send({message: 'Timer not found'});
    }
    else {
      var stringIds = results.userIds.map(function(userId) {
        return userId = userId.toString();
      });
      if (stringIds.indexOf(uuid.toString()) != -1) {
        res.send(results);
      }
      else {
        res.status(403).send({message: 'Specified user does not have permission to view the requested timer'});
      }
    }
  });    
});

/* GET all timers */
router.get('/timers', function(req, res, next) {
  try {
    var uuid = new ObjectId(req.headers.uuid);
  }
  catch (error) {
    res.status(400).send({message: 'Invalid User ID Format', error: error.toString()});
  }
 
  var id = req.params.id;
  
  app.dbo.collection('users').findOne({_id: uuid})
  .then(function foundUser(user) {
    if (user == null) {
      res.status(404).send({message: 'User not found'});
    }
    else {
      app.dbo.collection('timers').find().toArray()
      .then(function foundTimers(results) {
        // if uuid is in the timers list of userIds then include it
        var timers = results.filter(result => 
          result.userIds.filter(id => id.toString() === uuid.toString()).length > 0);

        res.send(timers);
      });
    }
  });
});

/* POST add new timer */
router.post('/timers', function(req, res) {
  try {
    var uuid = new ObjectId(req.headers.uuid);
  }
  catch (error) {
    res.status(400).send({message: 'Invalid User ID Format', error: error.toString()});
  }
  
  var timer = req.body;
  
  timer.userIds = [
    uuid
  ];
  
  if (validateTimer(timer) && !timer._id) {
    app.dbo.collection('users').findOne({_id: uuid})
    .then(function(result) {
      if (result === null) {
        res.status(404).send({message: 'User ID not found'});
      }
      else {
        app.dbo.collection('timers').insertOne(timer)
        .then(function(result) {
          app.dbo.collection('users')
          .updateOne({_id: new ObjectId(uuid)},
            {$push: {timers: new ObjectId(timer._id)}})
            .then(res.send({ message: 'new timer created successfully', timerId: timer._id}))
        })
      } // end else
    }, function(error) {
      console.log("ERROR ADDING TIMER");
      res.status(500).send({ message: 'Unable to create new timer', error: error});
    });
  }
  else {
    var error = "Invalid timer object";
    if (timer._id) {
      error += '. You cannot specify your own ID';
    }
    res.status(400).send({ error: error, 'data':timer });    
  }
});

/* DELETE an existing timer */
router.delete('/timers/:oid', function(req, res) {
  try {
    var uuid = new ObjectId(req.headers.uuid);
  }
  catch (error) {
    res.status(400).send({message: 'Invalid User ID Format', error: error.toString()});
  }

  try {
    var oid = new ObjectId(req.params.oid);
  }
  catch (error) {
    res.status(400).send({message: 'Invalid Timer ID Format', error: error.toString()});
  }

  app.dbo.collection('timers')
  .removeOne({'_id': oid})
  .then(function(results) {
    if (results === null || results.deletedCount === 0) {
      res.status(404).send({message: 'Timer ID could not be found'});
    }
    else {
      app.dbo.collection('users')
      .update({_id: ObjectId(uuid)}, 
        { $pull: {timers: { $in: [oid] } }})
      .then(function(success) {
        res.send({message: 'timer has been deleted for user', timerId: oid, userId: uuid});
      });
    }
  }, function error(result) {
    console.log('error');
    res.status(500).send({message: 'error deleting timer', error: result});
  });
});

/* PUT an existing timer */
router.put('/timers', function(req, res) {
  try {
    var uuid = new ObjectId(req.headers.uuid);
  }
  catch (error) {
    res.status(400).send({message: 'Invalid User ID Format', error: error.toString()});
  }

  var timer = req.body;
  try {
    var oid = new ObjectId(timer._id);
  }
  catch (error) {
    res.status(400).send({message: 'Invalid Timer ID Format', error: error.toString()});
  }

  // cannot reinsert same ID so need to remove this from our insert object
  // no database calls needed as we are just preparing the object for updating
  delete timer._id; 

  if (validateTimer(timer)) {
    console.log('Update action requested');
    console.log(oid);
    console.log(timer.name);
    app.dbo.collection('timers')
    .findOne({_id: oid})
    .then(function found(result) {
      if (result === null) {
        res.status(404).send({message: 'Timer ID not found'});
      }
      else {
        timer.userIds = result.userIds;
        app.dbo.collection('timers')
        .updateOne({'_id': oid}, timer)
        .then(function(succ) {
          res.status(200).send({message: 'Timer updated', timerId: oid});
        });
      }
    }, function error(result) {
      console.log('DIDNT FIND or ERROR UPDATING TIMER');
      console.log(result);
      res.status(500).send('TIMER COULD NOT BE UPDATED');
    });
  }
  else {
    console.log('invalid timer requested to update');
    res.status(400).send({ error: 'Invalid Timer Object Requested' });
  }
});

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

/* GET all users */
router.get('/users', function(req, res) {
  app.dbo.collection('users').find().toArray()
  .then(function(results) {
    res.status(200).send(results);
  }, function(error) {
    console.log("ERROR");
    console.log(error);
    res.status(500).send({error: error});
  });
});

/* GET specific user by uuid */
router.get('/users/:oid', function(req, res) {
  try {
    var uuid = new ObjectId(req.params.oid);
  }
  catch (error) {
    res.status(400).send({message: 'Invalid User ID Format', error: error.toString()});
  }
  
  app.dbo.collection('users').findOne({_id: uuid})
  .then(function(results) {
    if (results == null) {
      res.status(404).send({message: 'User not found'});
    }
    else {
      res.status(200).send(results);
    }
  }, function(error) {
    res.status(500).send({error: error});
  });
});

// internal functions
function validateTimer(timer) {
  var isValid = false;
  if (timer.name) {
    if (timer.type === 'Countdown' || timer.type === 'Elapsed') {
      isValid = true;
    }
  }

  return isValid;
}

function validateUser(user) {
  return true;
}

module.exports = router;
