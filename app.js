var express = require('express');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongo = require('./mongo');
var userModel = require('./schemas/user_schema');
var teamModel = require('./schemas/team_schema');
var mongoose = require('mongoose');
var busboy = require('connect-busboy');

var HOST = '115.29.10.169';
var PORT = '5000';

var request  = require('request');

var mongoUrl = 'mongodb://generic01:generic01@ds041140.mongolab.com:41140/generic';

var app = express();

/**********************************************************************************/

// logger
app.use(logger('dev'));

// set the default view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Set the default rendering engine for normal html files
app.engine('html', require('ejs').renderFile);

// Use this so we can get access to `req.body` in login ad signup forms.
app.use(bodyParser.urlencoded({ extended: false}));

// We need to use cookies for sessions, so use the cookie parser middleware
app.use( require('cookie-parser')() );

// handles json parsing
app.use(bodyParser.json());

// parses cookies
app.use(cookieParser());

app.use(busboy());

// set the port number
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));


/**********************************************************************************/

// handle request to login page
app.get('/', function(req, res){
  res.send('hello world');
});

// logs the user out and renders the main page
app.get('/logout', function(req, res){
    delete req.session.username;
    res.redirect('/');
});

app.get('/trigger', function(req, res) {
  /**********************************************/
  res.render('saveImage.html');
  /**********************************************/
});

//create new user
app.post('/save/image', function(req, res) {
  var fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
      console.log("Uploading: " + filename); 
      fstream = fs.createWriteStream(__dirname + '/public/images/' + filename);
      file.pipe(fstream);
      fstream.on('close', function () {
          res.json('http://' + HOST + ':' + PORT + '/images/' + filename);
      });
  });
});

//create new user
app.post('/create/user', function(req, res) {
  console.log(req.body.user_name);
  console.log(req.body.user_id);
  console.log(req.body.user_picture_url);
  res.send('ok');
});

//create new team
app.post('/create/team', function(req, res) {
  createTeam(req.body.team_name.toLowerCase(), req.body.team_id, req.body.team_picture_url, function(team){
    res.json(team);
  });

});

//search existing user
app.post('/search/user', function(req, res) {
  console.log(req.body.user_name);
  res.send('ok');
});

//search existing team
app.post('/search/team', function(req, res) {
  console.log(req.body.team_name);
  res.send('ok');
});

//add user to team
app.post('/addUserToTeam', function(req, res) {
  console.log(req.body.user_id);
  console.log(req.body.team_id);
  res.send('ok');
});

//ask to join a team
app.post('/joinTeam', function(req, res) {
  console.log(req.body.user_id);
  console.log(req.body.team_id);
  res.send('ok');
});

/**********************************************************************************/

app.get('/loginSuccess', function(req, res) {
  console.log(req.query.access_token);
  res.send('200');
  getFacebookId(req.query.access_token, function(user_name, user_id, picture_url) {
    createUser(user_name, user_id, picture_url);
  });
});

/**********************************************************************************/

function getFacebookId(access_token, callback) {
  request('https://graph.facebook.com/me?access_token=' + access_token, function (err, res, body) {
    if(!err && res.statusCode == 200) {
      var obj = JSON.parse(res.body);
      console.log('fb id: ', obj.id);
      callback(obj.name, obj.id, 'https://graph.facebook.com/v2.2/' + obj.id + '/picture');
    }
  });
};


/**
* Creates team and adds it to DB
*/
function createTeam(team_name, user_id, picture, callback){

  // process image
  // upload to imgur
  // get url
  picture_url = '';

  var newTeam = new teamModel({
    name: team_name,
    imageUrl: picture_url,
    userIds: [user_id],
    userRequestsIds: null,
    eventIds: null,
    messages: null
  });
  newTeam.save(function (err) {
    if (err) throw err;
    callback(newTeam);
  });

};

function createUser(user_name, user_id, picture_url) {
  var newUser = new userModel({
    _id: user_id,
    name: user_name,
    imageUrl: picture_url,
    teamId: null
  });
  newUser.save(function (err) {
    if (err) throw err;
    console.log('user created');
  });
};

/**********************************************************************************/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.message);
});

/**********************************************************************************/

// connect to the database
// and add a listening port to the applications
mongoose.connect(mongoUrl, function(){
  console.log('Connected to mongo at: ' + mongoUrl);
  app.listen(app.get('port'), function() {
    console.log('Server is listening on port: ' + app.get('port'));
  });  
});