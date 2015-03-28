var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
	name: {type: String},
    date: {type: Date},
    location: Schema.Types.Mixed,
    confirmed: Boolean,
    initiator_team_id: {type: Schema.Types.ObjectId, ref: 'teamSchema'},
    participant_team_id: {type: Schema.Types.ObjectId, ref: 'teamSchema'},
    participants: [{type: Schema.Types.ObjectId, ref: 'userSchema'}]
});

Module.exports = mongoose.model('eventSchema', eventSchema);

