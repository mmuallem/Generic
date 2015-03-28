var express = require('express');
var fs = require('fs');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongo = require('./mongo');
var mongoose = require('mongoose');
// var db = require('./mongoose').connect();
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var request  = require('request');

var FACEBOOK_APP_ID = '1391291127857476';
var FACEBOOK_APP_SECRET = '4a671bc3e28583771f379bf785e9dab9';
var CALLBACK_URL = 'http://localhost/auth/facebook/callback';


var mongoUrl = 'mongodb://dpapp01:test123test@ds045021.mongolab.com:45021/dpapp';
var MongoStore = require('connect-mongo')(expressSession);

/**********************************************************************************/

var app = express();

// logger
app.use(logger('dev'));

// Use this so we can get access to `req.body` in login ad signup forms.
app.use(bodyParser.urlencoded({ extended: false }));

// We need to use cookies for sessions, so use the cookie parser middleware
app.use( require('cookie-parser')() );

app.use( expressSession({
  secret: 'somesecretrandomstring',
  store: new MongoStore({
    url: mongoUrl
  })
}));

// handles json parsing
app.use(bodyParser.json());

// parses html body
app.use(bodyParser.urlencoded({ extended: false }));

// parses cookies
app.use(cookieParser());

// set the port number
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('facebook authenticated successfully');
  }
));

/**********************************************************************************/

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));

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

app.get('/loginSuccess', function(req, res) {
  console.log('received it!!!');
});

/**********************************************************************************/
// handle request for requests when one is logged in
/*app.get('/login', function(req, res){
  console.log(port);
  getFacebookId(req.access_token, function(user_id) {
    getFacebookPicture(user_id, function(picture_url) {
      createUser(user_id, picture_url, function() {
        res.send('Ok');//---------->what type of data do we want to send back
      });
    });
  });
  /*
  request.post('http://graph.facebook.com', {form:{key:'value'}})


  
  //
  console.log(req.body);
});*/

/**********************************************************************************/

function getFacebookId(access_token, callback) {
  request('http://graph.facebook/me?access_token=' + access_token, function (error, response, body) {
    if(!error && response.statusCode == 200) {
      console.log(body);
      callback(body.user_id);
    }
  });
};

function getFacebookPicture(user_id, callback) {
  request('http://graph.facebook/v2.3/' + user_id + '/picture', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      callback(user_id, response.body.picture_url);
    }
  });
};

function createUser(user_id, picture_url, callback) {
  mongoose.createUser(user_id, picture_url, callback());
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
mongo.connect(mongoUrl, function(){
  console.log('Connected to mongo at: ' + mongoUrl);
  app.listen(app.get('port'), function(){
    console.log('Server is listening on port: ' + app.get('port'));
  });  
});

