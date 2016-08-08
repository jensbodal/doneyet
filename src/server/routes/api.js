var config = require('../config.json');
var secret = config.secret;
var crypto = require('crypto');
var express = require('express');
var router = express.Router();
var app = require('../app');
var ObjectId = require('mongodb').ObjectId;
var jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
  var response = {
    'HTTP OK': '200',
    'doneyet': 'welcome'
  };
  res.status(200).send(response);
});

router.post('/authenticate', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  if (username === undefined || username === '') {
    res.status(400).send({message: 'Invalid username'});
  }
  else if (password === undefined || password === '') {
    res.status(400).send({message: 'Invalid password'});
  }
  else {
    app.dbo.collection('users').findOne({username: username}, function(err, result) {
      
      // username exists, so check password
      if (err === null && result !== null) {
        
        // first get passwordHash
        var passwordHash = hash(password, result.password.salt).passwordHash;
        
        if (passwordHash !== result.password.passwordHash) {
          res.status(400).send({message: 'Invalid login credentials'});
        }
        else {
          // user is valid
          sendValidUserResponse(result);
        }
      }
      // user doesn't exist so create new user with password
      else if (err === null && result === null) {
        // hash password and store as .salt and .passwordHash
        password = hash(password, generateSalt());
        app.dbo.collection('users').insertOne({username: username, password: password}, function (err, result) {
          sendValidUserResponse(result.ops[0]);
        });
      }
      // something went wrong... 
      else {
        res.status(500).send({message: 'Error! Something went wrong!!!', err, result});
      }
    });
  }

  function sendValidUserResponse(result) {
    // if user is found and password is right create a token

    // we don't want to pass the password back...
    delete result.password;
    
    var token = jwt.sign(result, secret, {
      expiresIn: 60*60*24 // expires in 24 hours
    });

    res.status(200).send(
      {
        user: result.username,
        token: token
      }
    );
  }

});

/* AUTHENTICATION MIDDLEWARE */

router.use(function(req, res, next) {
  // we will only allow tokens from the HTTP header
  var token = req.headers.token;

  if (token) {
    jwt.verify(token, secret, function(err, verifiedToken) {
      if (err) {
        res.status(400).send({message: 'INVALID JWT TOKEN', error: err});
      }
      else {
        req.verifiedToken = verifiedToken;
        next();
      }
    });
  }
  else {
    // no token present
    res.status(400).send({message: 'No JWT token found in HTTP headers'});
  }
});

/* PROTECTED ROUTES */

/*
 * Here we assume that the JWT token has been validated. The JWT token will contain our user information
 * and other information that we need.  We can trust this information because the JWT has been signed
 * by our secret
 */


/* GET a specific timer by _id */
router.get('/timers/:oid', function(req, res, next) {
  console.log('getting specific timer');
  try {
    var uuid = new ObjectId(req.verifiedToken._id);
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
  console.log('getting all timers');
  try {
    var uuid = new ObjectId(req.verifiedToken._id);
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
  console.log('adding a new timer');
  try {
    var uuid = new ObjectId(req.verifiedToken._id);
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
  console.log('deleting a timer');
  try {
    var uuid = new ObjectId(req.verifiedToken._id);
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
  console.log('updating a timer');
  try {
    var uuid = new ObjectId(req.verifiedToken._id);
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

router.post('/user/profile-picture', function(req, res) {
  try {
    var uuid = new ObjectId(req.verifiedToken._id);
  }
  catch (error) {
    res.status(400).send({message: 'Invalid User ID Format', error: error.toString()});
  }
  
  if (!req.body.profilePicture) {
    req.status(400).send({message: 'profile picture URL missing'});
  }

  app.dbo.collection('users')
    .updateOne({'_id': uuid}, {$set: {profilePicture: req.body.profilePicture}})
    .then(function(succ) {
      console.log('success updating profile picture');
      res.status(200).send({message: 'Profile Picture Set', URL: req.body.profilePicture});
    }, function(error) {
      console.log(error);
      res.status(500).send({message: 'error something post picture'});
    });
});

router.get('/user/profile-picture', function(req, res) {
  try {
    var uuid = new ObjectId(req.verifiedToken._id);
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
      console.log(results);
      res.status(200).send(results);
    }
  }, function(error) {
    res.status(500).send({error: error});
  });
});

function generateSalt() {
  var length = 512;
  return crypto.randomBytes(Math.ceil(length/2))
    .toString('hex')
    .slice(0, length);
}

// internal functions
function hash(password, salt) {

  var hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  var value = hash.digest('hex');
  return {
    salt: salt,
    passwordHash: value
  };
}

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
