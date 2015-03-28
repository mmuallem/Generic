var mongoose = require('mongoose');
var db;
var connected = false;

module.exports = {
  connect: function(url, callback){
    mongoose.connect(url, function(err, _db){
      if (err) { throw new Error('Could not connect: '+err); }
      
      db = _db;
      connected = true;
      
      callback(db);
    });
  }
};