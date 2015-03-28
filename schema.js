var mongoose = require('mongoose');


var userAccount = mongoose.Schema({
	username: {type: String, require: true, trim: true, index: true, unique: true},
   	salt: {type: String, require: true},
  	hashedPassword: {type: String, require: true},
  	scores:[{
  		rank: {Number, index: true},
  		time: {type: Date, default: Date.Now},
  		numberOfMoves: Number;
  	}]
});

userAccount.methods.returnPersonalTopScores = function () {
    return this.scores;
};

userAccount.statics.returnPersonalTopScores = function () {
    return this.scores;
};


Module.exports = mongoose.model('UserAccount', userAccount);