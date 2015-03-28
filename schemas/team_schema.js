var mongoose = require('mongoose');

var teamSchema = mongoose.Schema({
	name: {type: String, required: true, index: true},
    imageUrl: String,
    userIds: [{type: Schema.Types.ObjectId, ref: 'userSchema'}],
    eventIds: [{type: Schema.Types.ObjectId, ref: 'eventSchema'}],
    messages: [{postedBy: {type: Schema.Types.ObjectId},
    			body: String,
    			dateOfCreation: {type: Date, default: Date.now }
    		}]
});

Module.exports = mongoose.model('teamSchema', teamSchema);

