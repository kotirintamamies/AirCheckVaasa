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
var request=require('request');
var Forecast = require('forecast');
 
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
   var query = Grid.find();
  query.select();
  return query.exec(function(err, grid)
  {
    if(grid)
      return res.json({success: true, data: grid});
  })
 
})

apiRoutes.get('/boxes', function(req, res){
  var lat = Math.floor(parseFloat(req.param('latitude')));
  var long = Math.floor(parseFloat(req.param('longitude')));
  return res.json({box: boxes[lat+','+long], risk: calculatescore(boxes[lat+','+long].symptoms, boxes[lat+','+long].events, boxes[lat+','+long].airpollution)})
})

apiRoutes.get('/clrsymp', function(req, res){
  if (req.param('owkefwef')=="afseaaf")
      var query = Symptom.remove()
  query.exec();
  return res.json({"msg": "bye bye symptoms"});
  
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
function getSymptomsByHour(hr)
{
  var query = Symptom.find({hour: hr});
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
var boxes = {};
hourly();


function hourly()
{
  pushevents();
  pushsymptoms();
}

function pushevents()
{
    var ev = [];
  request('http://eonet.sci.gsfc.nasa.gov/api/v2.1/events', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var cats = [6, 7, 16, 9, 19, 10, 17, 18, 12, 8];
      var obj = {boxes: []};
      var even = JSON.parse(body);
      even.events.forEach(function(event)
      {
        var push = false;
        event["categories"].forEach(function(cat)
        {
          for(var i = 0; i<cats.length;i++)
            if(cat.id==cats[i])
              push=true;
        })
        if(push)
          makeboxes(event.title, event.geometries);
      })
    }
  })
}

function makeboxes(tit, geo)
{
  geo.forEach(function (geometry)
  {
    if(geometry.coordinates[0].isArray)
      makeboxes(tit, geometry)
    else if( !isNaN(geometry.coordinates[0]))
    {
      var boxname = Math.floor(geometry.coordinates[0]) + ','+Math.floor(geometry.coordinates[1]);
      if(!boxes[boxname])
       boxes[boxname]={};
      if(!boxes[boxname].events)
        boxes[boxname].events=[tit];
      else
        boxes[boxname]["events"].push(tit);
      if(!boxes[boxname]["temperature"])
        pushweathertobox(Math.floor(geometry.coordinates[0]), Math.floor(geometry.coordinates[1]))
    boxes[boxname].events = boxes[boxname].events.filter(function(item, pos) {
    return boxes[boxname].events.indexOf(item) == pos;
    })
    }
  })
}


function pushsymptoms()
{
  var d = new Date();
  getSymptomsByHour(d.getHours()).then(function(res)
  {
    var symps = [];
    var boxname = '63,21';
    boxes[boxname] = {symptoms: []};
    res.forEach(function (symp)
    {

        //var boxname = symp.dimensions.lat + ','+symp.dimensions.lng;
        symps.push(symp.symptom.toString());
        //console.log(symp)
        /*var boxname = symp.dimensions.lat + ','+symp.dimensions.lng;
        if(!boxes[boxname])
        boxes[boxname]={};
        if(!boxes[boxname][symptoms])
          boxes[boxname].symptoms=[];

        boxes[boxname]["symptoms"].push(symp.symptom);
        console.log(boxes[boxname])
        if(!boxes[boxname]["humidity"])*/
         // pushweathertobox(Math.floor(geometry.coordinates[0]), Math.floor(geometry.coordinates[1]))
      })
      console.log(symps)
          boxes[boxname].symptoms=symps;
          console.log(boxes)
          
    })
}

var forecast = new Forecast({
    service: 'forecast.io',
    key: '',
    units: 'celsius', // Only the first letter is parsed
    cache: true,      // Cache API requests?
    ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/
        minutes: 10,
        seconds: 0
    }
});
function pushweathertobox(lat, lng)
{
  var airPollution;
        // Retrieve weather information, ignoring the cache
        forecast.get([lat, lng], true, function (err, weather) {
            if (err) return console.dir(err);
            var headers = {
                'User-Agent': 'Super Agent/0.0.1',
                'Content-Type': 'application/json'
            };
            var options = {
                url: 'http://api.breezometer.com/baqi/',
                headers: headers,
                method: 'GET',
                qs: {'lat': lat, 'lon': lng, 'key': ''}
            };
                request(options, function (error, response, body) {
                var bodyObject = JSON.parse(body);
                if (!error && response.statusCode == 200) {
                    if (bodyObject.data_valid)
                        airPollution = String(bodyObject.breezometer_aqi);
                    else
                        airPollution = null;
                if (weather)
                    {
                      var curr = weather.currently;
                     // boxes[lat + ','+lng].temperature = curr.temperature;
                      boxes[lat + ','+lng].humidity = curr.humidity;
                      boxes[lat + ','+lng].airpollution = airPollution;
                  }
                }
             });
        });
}

function calculatescore(symptoms, pollution, events)
{
  console.log(symptoms)
  console.log(pollution)
  console.log(events)
  var risklevel = 0;
  if(events)
    risks.push(0.5)
  if (pollution)
    risks.push(pollution/300);
  
  var risks = [];
  var symps = [];
  symptoms.forEach(function (symp)
  {
    var temp = symp.split(',');
    symps.push(parseInt(temp[1])/100);
  })
  var sum = symps.reduce(function(a, b) { return a + b; });
  console.log(symps);
  risks.push (sum / symps.length);
  console.log(risks);
  return((risks.reduce(function(a, b) { return a + b; }))/risks.length)
}