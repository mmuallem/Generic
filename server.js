var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var express = require('express');
var app = express();

var HOST = 'localhost';
var PORT = 8888;

var FACEBOOK_APP_ID = '1391291127857476';
var FACEBOOK_APP_SECRET = '4a671bc3e28583771f379bf785e9dab9';
var CALLBACK_URL = 'http://genericapp.herokuapp.com/auth/facebook/callback';

/**********************************************************************************/

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
  	console.log('got to this point');
  	
  }
));

/**********************************************************************************/

app.get('/', function (req, res) {
  res.send('Hello World!')
});

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

var server = app.listen(PORT, function () {
  console.log('Example app listening at http://%s:%s', HOST, PORT)

});