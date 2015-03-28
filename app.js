var express = require('express');
var fs = require('fs');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongo = require('./mongo');
var mongoose = require('mongoose');
// var db = require('./mongoose').connect();


var mongoUrl = 'mongodb://dpapp01:test123test@ds045021.mongolab.com:45021/dpapp';
var MongoStore = require('connect-mongo')(expressSession);


var app = express();

// set the port number
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));



// This is a middleware To check whether the user is logged in used on requests where
// require_ that a user is logged in, such as the /editProfile url
function requireUser(req, res, next){
  if (!req.user) {
    res.redirect('/signup');
  } else {
    next();
  }
}

// Initialize the game
function initialize () {
  var numberOfWords = 235886;
  getWord('./dictionary.txt', function(word){
      var word = word;
    } 
  );
}
// This middleware checks if the user is logged in and sets
// req.user and res.locals.user appropriately if so.
function checkIfLoggedIn(req, res, next){
  if (req.session.username) {
    var coll = mongo.collection('userAccount');
    coll.findOne({username: req.session.username}, function(err, user){
      if (user) {
        // set a 'user' property on req
        // so that the 'requireUser' middleware can check if the user is
        // logged in
        req.user = user;
        
        // Set a res.locals variable called 'user' so that it is available
        // to every handlebars template.
        res.locals.user = user;
      }
      
      next();
    });
  } else {
    next();
  }
}

// logger
app.use(logger('dev'));

// set the default view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


// Set the default rendering engine for normal html files
app.engine('html', require('ejs').renderFile);

// Use this so we can get access to `req.body` in login ad signup forms.
app.use( require('body-parser')() );

// We need to use cookies for sessions, so use the cookie parser middleware
app.use( require('cookie-parser')() );

app.use( expressSession({
  secret: 'somesecretrandomstring',
  store: new MongoStore({
    url: mongoUrl
  })
}));

app.use(checkIfLoggedIn);

// handles json parsing
app.use(bodyParser.json());

// parses html body
app.use(bodyParser.urlencoded({ extended: false }));

// parses cookies
app.use(cookieParser());

// handle request to main page
app.get('/', function(req, res){
  res.render('index.html');
});

// handle request to signup page
app.get('/signup', function(req, res){
  res.render('signup.html');
});

// handle request to login page
app.get('/login', function(req, res){
  if(req.session.username){
    res.redirect('/home');
  }
  else{
  res.render('login.html');
  }
});

// Main Logic
app.get('/game/word', requireUser, function (req, res) {
  console.log(req.query.word);
  searchForWord(req.query.word);
});

// handle request to home page
app.get('/home', requireUser, function(req, res){
  res.render('home.html');
});

app.get('/game', requireUser, function(req, res){
    res.render('game.html');
});
// logs the user out and renders the main page
app.get('/logout', function(req, res){
  	delete req.session.username;
  	res.redirect('/');
});

// Handles signing up
// passes the request parameter to the function that handles creation and storage of user
app.post('/signup', function(req, res){
  // The 4 variables below all come from the form
  var username = req.body.username;
  var password = req.body.password;
  var password_confirmation = req.body.passwordConfirm;
  
  createUser(username, password, password_confirmation, function(err, user){
    if (err) {
      res.setHeader('Content-Type', 'application/javascript');
      res.send('alert(' + err + ');');
  	} else {
      
      // This way subsequent requests will know the user is logged in.
      req.session.username = user.username;
      
      res.redirect('login.html');  
    }
  });
});

// Logs the user in
// redirects to home page if success
// or to signup if fails
app.post('/login', function(req, res){
	if(req.session.username){
		res.redirect('/home');
	}
	// These two variables come from the form on
	// the views/login.hbs page
	var username = req.body.username;
	var password = req.body.password;
	  
	authenticateUser(username, password, function(err, user){
	   if (user) {
	    // This way subsequent requests will know the user is logged in.
	      req.session.username = user.username;

	      res.redirect('home.html'); 
	    } else {
			console.log("error logging in");
			res.render('signup.html');
		}
	});
});


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


/**
*
*	HELPER FUNCTIONS
*
*/


// Helper function, creates a random salt to be added to password
function createSalt(){
  var crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

// Helper function, hashes password using sha256
function createHash(string){
  var crypto = require('crypto');
  return crypto.createHash('sha256').update(string).digest('hex');
}


// This creates a new user and calls the callback with
// two arguments: err, if there was an error, and the created user
// if a new user was created.
//
// Possible errors: the passwords are not the same, and a user
// with that username already exists.
function createUser(username, password, password_confirmation, callback){
  var coll = mongo.collection('userAccount');
  
  if (password != password_confirmation) {
    var err = 'The passwords do not match';
    callback(err);
  } else {
    var query      = {username:username};
    var salt       = createSalt();
    var hashedPassword = createHash(password + salt);
    var userObject = {
      username: username,
      salt: salt,
      hashedPassword: hashedPassword,
      scores: []
    };
    
    // make sure this username does not exist already
    coll.findOne(query, function(err, user){
      if (user) {
        err = 'The username you entered already exists';
        callback(err);
      } else {
        // create the new user
        coll.insert(userObject, function(err,user){
          callback(err,user);
        });
      }
    });
  }
}

// This finds a user matching the username and password that were given.
function authenticateUser(username, password, callback){
  var coll = mongo.collection('userAccount');
  
  coll.findOne({username: username}, function(err, user){
    if (err) {
    	console.log("cant find");
      return callback(err, null);
    }
    if (!user) {
      return callback(null, null);
    }
    var salt = user.salt;
    var hash = createHash(password + salt);
  	if (hash === user.hashedPassword) {
      return callback(null, user);
    } else {
      return callback(null, null);
    }
  });
}



function getWord(filename, callback) {

  var stream = fs.createReadStream(filename, {
    flags: 'r',
    encoding: 'utf-8',
    fd: null,
    mode: 0666,
    bufferSize: 64 * 1024
  });

  var fileData = '';
  stream.on('data', function(data){
    fileData += data;

    // The next lines should be improved
    var lines = fileData.split("\n");

    var rand = Math.floor(Math.random()*lines.length);
    stream.destroy();
    callback(null, lines[+line_no]);
    
  });

  stream.on('error', function(){
    callback('Error', null);
  });

  stream.on('end', function(){
    callback('File end reached without finding line', null);
  });
}

// Verifies that the word exists in the dictionary
function searchForWord(word, callback){
  var stream = fs.createReadStream('dictionary.txt', {
    flags: 'r',
    encoding: 'utf-8',
    fd: null,
    mode: 0666,
    bufferSize: 64 * 1024
  });

  var fileData = '';
  stream.on('data', function(data){
    fileData += data;

    // The next lines should be improved
    var lines = fileData.split("\n");

    var rand = Math.floor(Math.random()*lines.length);
    stream.destroy();
    callback(null, lines[+line_no]);
    
  });

  stream.on('error', function(){
    callback('Error', false);
  });

  stream.on('end', function(){
    callback('word not found', false);
  });
}

// connect to the database
// and add a listening port to the applications
mongo.connect(mongoUrl, function(){
  console.log('Connected to mongo at: ' + mongoUrl);
  app.listen(app.get('port'), function(){
    console.log('Server is listening on port: ' + app.get('port'));
  });  
});
