var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var teamSchema = mongoose.Schema({
	name: {type: String, required: true, unique: true, index: true},
    imageUrl: Schema.Types.Mixed,
    userIds: [{type: Number, ref: 'userSchema'}],
    userRequestsIds: [{type: Number, ref: 'userSchema'}],
    eventIds: [{type: Schema.Types.ObjectId, ref: 'eventSchema'}],
    messages: [{postedBy: {type: Schema.Types.ObjectId},
    			body: String,
    			dateOfCreation: {type: Date, default: Date.now }
    		}]
});

module.exports = mongoose.model('teamSchema', teamSchema);

