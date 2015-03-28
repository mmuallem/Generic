var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
	name: {type: String},
    date: {type: Date},
    location: Schema.Types.Mixed,
    confirmed: Boolean,
    dateOfCreation: {type: Date, default: Date.now, expires: },
    initiator_team_id: {type: Schema.Types.ObjectId, ref: 'teamSchema'},
    participant_team_id: {type: Schema.Types.ObjectId, ref: 'teamSchema'},
    participants: [{type: Schema.Types.ObjectId, ref: 'userSchema'}]
});

module.exports = mongoose.model('eventSchema', eventSchema);

