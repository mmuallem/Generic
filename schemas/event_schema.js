var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
	name: String,
    date: Number,
    location: String,
    confirmed: Boolean,
    dateOfCreation: {type: Date, default: Date.now},
    initiator_team_id: {type: Schema.Types.ObjectId, ref: 'teamSchema'},
    participant_team_id: {type: Schema.Types.ObjectId, ref: 'teamSchema'},
    participants: [{type: Schema.Types.ObjectId, ref: 'userSchema'}]
});

module.exports = mongoose.model('eventSchema', eventSchema);

