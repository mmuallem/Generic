var mongoose = require('mongoose');

var connected = false;
var uri = 'mongodb://dpapp01:test123test@ds045021.mongolab.com:45021/dpapp';

var db;

module.exports = {
  connect: function(url, callback){
    mongoose.connect(uri, function(err, _db){
      if (err) { throw new Error('Could not connect: '+err); }

      db = _db;
      connected = true;
      
      callback(db);
    });
  }
};
