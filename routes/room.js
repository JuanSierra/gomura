/*
/*
 * GET home page.

*/
//var mongoose = require('mongoose');
var Room = require('../models/Room');
var User = require('../models/User');
var _ = require('lodash');
var WebSocket  = require('ws');
var wss = new WebSocket('http://localhost:8000');

exports.create = function(req, res) {
	var room = new Room();
	room.name = req.body.name;
	room.categories = ['Ciudad','Color','Pais'];

	room.save(function(err){
		if(err)
			res.send(err);
		
		res.json({message: 'Room created'})
	});
};

exports.getAll = function(req, res) {
	Room.find(function(err, rooms){
		if(err)
			res.send(err);

		res.json(rooms);
	});
};
	
exports.getByName = function(req, res) {
	Room.findOne({name:req.params.room_name}, function(err, room){
		if(err)
			res.send(err);

		res.json(room);
	});
};

exports.update = function(req, res) {
	Room.findOne({name:req.params.room_name}, function(err, room){
		if(err)
			res.send(err);
		
		if(!room){
			res.json({message: 'Room doesn\'t exist'})
		}else{
			var result = _.find(room.users, {'name': req.body.user_name});
			
			if(!result)
				res.json({message: 'User doesn\'t exist on this room'})
			else
			{
				if(req.body.user_name && req.body.game && room.status == 'STARTED'){
					room.state.push({'user':req.body.user_name, 'game':req.body.game});
					
					//if ended
					if(room.state.length == room.users.length)
						room.status = 'FINISHED';
				}else if(req.body.status){
					if(req.body.user_name == room.host)
						room.status = "STARTED";
				}else{
					res.json({message: 'Cannot make any change'});
				}
				
				room.save(function(err){
					if(err)
						res.send(err);
					
					res.json({message: 'Room updated'})
				});
			}
		}
	});
};

exports.delete = function(req, res) {
	Room.findOne({name:req.params.room_name}, function(err, room){
		if(err)
			res.send(err);
		if(!room){
			res.json({message: 'Room doesn\'t exist'})
		}else{
			Room.remove({_id: room._id},
				function(err, room){
					if(err)
						res.send(err);
						
					res.json({message: 'Room '+req.params.room_name+' Deleted'});
			});
		}
	});
};

exports.addUser = function(req, res) {
	Room.findOne({name:req.params.room_name}, function(err, room){
		if(err)
			res.send(err);
		
		if(!room){
			res.json({message: 'Room doesn\'t exist'})
		}else{
			if (room.status == "STARTED")
				res.json({message: 'Game already started'})
			else if (room.status == "FINISHED")
				res.json({message: 'Game finished'})
			
			User.findOne({ name : req.params.user_name}, function(err, user){
				var found = false;
				if(err)
					res.send(err);
				
				if(!user){
					user = new User();
					user.name = req.params.user_name;
					
					user.save(function(err){
						if(err)
							res.send(err);
						
						//res.json({message: 'User created'})
					});
				}
				
				for(var u in room.users){
					if (room.users[u].name === req.params.user_name)
						found = true;
				}
				
				if(found){
					res.json({message: 'User already added to room'})
				}else{
					if(room.users.length ==0)
						room.host = req.params.user_name;
				
					room.users.push(user);
					wss.send(JSON.stringify({type:'newUser',content:req.params.user_name}));
					
					room.save(function(err){
						if(err)
							res.send(err);

						res.json({message: 'User Added'})
					});
				}
			});
		}
	});
};

exports.userGame = function(req, res) {
	/*Room.findById(req.body.room_id, function(err, room){
		if(err)
			res.send(err);
			
		User.findById(req.body.user_id, function(err, user){
			if(err)
				res.send(err);
			
			room.users.push(user);
		});
	});*/
};