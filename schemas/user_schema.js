var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	name: {type: String, required: true, index: true},
    imageUrl: String,
    teamId: {type: Schema.Types.ObjectId, ref: 'teamSchema'},
});

Module.exports = mongoose.model('userSchema', userSchema);

