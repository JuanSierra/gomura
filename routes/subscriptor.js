/*
/*
 * GET home page.

*/
//var mongoose = require('mongoose');
var Subscriptor = require('../models/Subscriptor');
var Provider = require('../models/Publisher');

exports.create = function(req, res) {
	var subtor = new Subscriptor();
	subtor.name = req.body.name;
	
	subtor.save(function(err){
		if(err)
			res.send(err);
		
		res.json({message: 'Subscriptor created'})
	});
};

exports.getAll = function(req, res) {
	Subscriptor.find(function(err, subtors){
		if(err)
			res.send(err);
		
		res.json(subtors);
	});
};
	
exports.getById = function(req, res) {
	Subscriptor.findById(req.params.sub_id, function(err, subtor){
		if(err)
			res.send(err);

		res.json(subtor);
	});
};

exports.update = function(req, res) {
	Subscriptor.findById(req.params.sub_id, function(err, subtor){
		if(err)
			res.send(err);
		
		if(req.body.pub_id){
			Provider.findById(req.body.pub_id, function(err, prov){
				if(err)
					res.send(err);
				
				subtor.name = req.body.name;
				subtor.providers.push(prov);
				subtor.save(function(err){
					if(err)
						res.send(err);
					
					res.json({message: 'Subscriptor updated'})
				});
			});
		}else{
			subtor.name = req.body.name;
			subtor.save(function(err){
				if(err)
					res.send(err);
				
				res.json({message: 'Subscriptor name updated'})
			});
		}
	});
};

exports.delete = function(req, res) {
	Subscriptor.remove({_id: req.params.sub_id},
	function(err, subtor){
		if(err)
			res.send(err);
			
		res.json({message: 'Deleted'});
	});
};