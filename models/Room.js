var mongoose = require('mongoose');var Schema = mongoose.Schema;var User = require('./User');var roomSchema = new Schema({	_id : {    type: mongoose.Schema.ObjectId,    default: mongoose.Types.ObjectId  },	name : String,	host : String,	status: {        type: String,        enum : ['WAITING','STARTED','FINISHED'],        default : 'WAITING'    },	state : [Schema.Types.Mixed],	users: [User.schema],	categories: [String]});module.exports = mongoose.model('Room', roomSchema);