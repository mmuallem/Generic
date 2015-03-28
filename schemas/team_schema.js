var mongoose = require('mongoose');

var teamSchema = mongoose.Schema({
	name: {type: String, required: true, unique: true, index: true},
    image: Schema.Types.Mixed,
    userIds: [{type: Schema.Types.ObjectId, ref: 'userSchema'}],
    userRequestsIds: [{type: Schema.Types.ObjectId, ref: 'userSchema'}],
    eventIds: [{type: Schema.Types.ObjectId, ref: 'eventSchema'}],
    messages: [{postedBy: {type: Schema.Types.ObjectId},
    			body: String,
    			dateOfCreation: {type: Date, default: Date.now }
    		}]
});

module.exports = mongoose.model('teamSchema', teamSchema);

