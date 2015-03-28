var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
	_id: {type: Number, required: true, index: true, unique: true},
	name: {type: String, required: true, index: true},
    imageUrl: String,
    teamId: {type: Schema.Types.ObjectId, ref: 'teamSchema'},
});

module.exports = mongoose.model('userSchema', userSchema);

