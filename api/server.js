var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	= require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose model
var Grid = require('./app/models/grid');
var Symptom = require('./app/models/symptom');
var Measurement = require('./app/models/measurement');
var port        = process.env.PORT || 8080;
var jwt         = require('jwt-simple');
 
// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
 
// log to console
app.use(morgan('dev'));
 
// Use the passport package in our application
app.use(passport.initialize());
 
// demo Route (GET http://localhost:8080)
app.use('/', express.static('frontend'));
 
 // connect to database
mongoose.connect(config.database);
 
// pass passport for configuration
require('./config/passport')(passport);
 
// bundle our routes
var apiRoutes = express.Router();
 
// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', function(req, res) {
  if (!req.body.name || !req.body.password) {
    res.json({success: false, msg: 'Please pass name and password.'});
  } else {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Registration complete.'});
    });
  }
});

apiRoutes.post('/grid', function(req, res) {
  if(!req.body.timestamp||!req.body.dimensions.lat||!req.body.dimensions.lng)
  {
    res.json({success: false, msg: "required info missing"});
  }
  else
  {
      var  newGrid = new Grid(req.body);
      newGrid.save(function(err)
      {
        if(!err)
          return res.json({success: true, msg: 'grid data posted.'});
          else
          return res.json({success: false, msg: 'failed.'});
      }
      
      )
  }
  });

apiRoutes.post('/symptom', function(req, res) {

  if(!req.body.timestamp||!req.body.dimensions.lat||!req.body.dimensions.lng)
  {
    res.json({success: false, msg: "required info missing"});
  }
  else
  {
      var  newSymptom = new Symptom(req.body);
      newSymptom.save(function(err)
      {
        if(!err)
          return res.json({success: true, msg: 'symptom posted.'});
          else
          return res.json({success: false, msg: 'failed.'});
      })
  }
  });
  
  apiRoutes.post('/measurement', function(req, res) {

      var  newSymptom = new Measurement(req.body);
      newSymptom.save(function(err)
      {
        if(!err)
          return res.json({success: true, msg: 'measurement posted.'});
          else
          return res.json({success: false, msg: 'failed.'});
      })
  }
  );

 // route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;
 
    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

// route to a restricted info (GET http://localhost:8080/api/memberinfo)
apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});
apiRoutes.get('/grid', function(req, res){
  var date = new(Date);
  var y = date.getFullYear();
  var m = date.getMonth();
  var d = date.getDay();
  var q = {};
  if(req.param('year'));
  {
    y = req.param('year');
    if(req.param('month'));
    {
      m = req.param('month');
      if(req.param('day'))
      {
        d = req.param('day');
        if(req.param('hour'));
         var h = req.param('hour');
      }
    }
  }
  q = {time: {hour: parseInt(h), day: parseInt(d), month: parseInt(m), year: parseInt(y)}};
  var query = Grid.find(q);
  query.select();
  return query.exec(function(err, grid)
  {
    if(grid)
      return res.json({success: true, data: grid});
  })
 
})

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// connect the api routes under /api/*
app.use('/api', apiRoutes);
 
// Start the server
app.listen(port);
console.log('server running at: http://localhost:' + port);

//inner functions
function getSymptomsByHour(hr, lati, long)
{
  var query = Symptom.find({hour: hr, dimensions:{lat: lati, lng: long}});
  query.select();
 return query.exec(function(err, symptom)
  {
    if(symptom)
      return symptom;
  })
}

function getMeasurementsByHour(hr, lati, long)
{
  var query = Measurement.find({hour: hr, dimensions:{lat: lati, lng: long}});
  query.select();
 return query.exec(function(err, measurement)
  {
    if(measurement)
      return measurement;
  })
}

function deleteSymptomsByHour(hr)
{
  var query = Symptom.remove({hour: hr})
  query.exec();
}

function deleteMeasurementsByHour(hr)
{
  var query = Measurement.remove({hour: hr})
  query.exec();
}