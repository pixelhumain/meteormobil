/*Meteor.publish('citoyen', function() {
if (!this.userId) {
return;
}
var objectId = new Mongo.ObjectID(this.userId);
var citoyen = Citoyens.find({_id:objectId},{fields:{pwd:0}});
console.log(JSON.stringify(citoyen.fetch()));
return citoyen;
});*/




Meteor.publishComposite('citoyen', function() {
	if (!this.userId) {
		return;
	}
		return {
		find: function() {
			let objectId = new Mongo.ObjectID(this.userId);
			return Citoyens.find({_id:objectId},{_disableOplog: true,fields:{pwd:0}});
		},
		children: [
			{
				find: function(citoyen) {
					//events citoyen
					if(citoyen && citoyen.links && citoyen.links.events){
						let eventsIds = _.map(citoyen.links.events, function(num, key){
							let objectId = new Mongo.ObjectID(key);
							return objectId;
						});
						//selector startDate endDate sort et limit
						var inputDate = new Date();
						/*console.log(inputDate);
						console.log(JSON.stringify(Events.find({_id:{$in:eventsIds},endDate:{$gte:inputDate}},{_disableOplog: true}).fetch()));*/
						return Events.find({_id:{$in:eventsIds},endDate:{$gte:inputDate}},{_disableOplog: true});
					}else{
						return;
					}
				}
			}
		]
	}
});

Meteor.publishComposite('photos', function() {
	if (!this.userId) {
		return;
	}
	return {
		find: function() {
			return Photos.find({});
		},
		children: [
			{
				find: function(photo) {
					return Meteor.users.find({
						_id: photo.owner
					}, {
						fields: {
							'profile': 1,
							'username': 1
						}
					});
				}
			},
			{
				find: function(photo) {
					return Photosimg.find({
						_id:photo.urlimage
					});
				}
			}
		]
	}
});

Meteor.publishComposite('newsListEvents', function(eventId) {
	check(eventId, String);
	if (!this.userId) {
		return;
	}

	return {
		find: function() {
			console.log(eventId);
			console.log(JSON.stringify(Events.find(new Mongo.ObjectID(eventId)).fetch()));
			return Events.find({_id:new Mongo.ObjectID(eventId)});
		},
		children: [
			{
				find: function(event) {
					/*console.log(event._id._str);
					console.log(JSON.stringify(News.find({'scope.events':{$in:[eventId]}}).fetch()));*/
					return News.find({'scope.events':{$in:[eventId]}});
				},
				children: [
					{
						find: function(news) {
							/*console.log(news.author);*/
							return Citoyens.find({
								_id: new Mongo.ObjectID(news.author)
							}, {
								fields: {
									'name': 1
								}
							});
						}
					},
					{
						find: function(news) {
							/*console.log(Documents.find({
							id : news._id._str
						}).fetch());*/
						return Documents.find({
							id : news._id._str
						});
					},
					children: [
						{
							find: function(doc) {
								/*console.log(Photosimg.find({
								_id:doc.objId
							}).fetch());*/
							return Photosimg.find({
								_id:doc.objId
							});
						}
					}
				]
			}
		]
	},
	{
		find: function(event) {
			return Citoyens.find({
				_id: new Mongo.ObjectID(event.creator)
			}, {
				fields: {
					'name': 1
				}
			});
		}
	}
]}
});

Meteor.publishComposite('newsDetailEvents', function(eventId,newsId) {
	check(eventId, String);
	check(newsId, String);
	if (!this.userId) {
		return;
	}

	return {
		find: function() {
			/*console.log(eventId);
			console.log(JSON.stringify(Events.find(new Mongo.ObjectID(eventId)).fetch()));*/
			return Events.find({_id:new Mongo.ObjectID(eventId)});
		},
		children: [
			{
				find: function(event) {
					/*console.log(event._id._str);
					console.log(JSON.stringify(News.find({'scope.events':{$in:[eventId]}}).fetch()));*/
					return News.find({_id:new Mongo.ObjectID(newsId)});
				},
				children: [
					{
						find: function(news) {
							console.log(news.author);
							return Citoyens.find({
								_id: new Mongo.ObjectID(news.author)
							}, {
								fields: {
									'name': 1
								}
							});
						}
					},
					{
						find: function(news) {
							/*console.log(Documents.find({
							id : news._id._str
						}).fetch());*/
						return Documents.find({
							id : news._id._str
						});
					},
					children: [
						{
							find: function(doc) {
								/*console.log(Photosimg.find({
								_id:doc.objId
							}).fetch());*/
							return Photosimg.find({
								_id:doc.objId
							});
						}
					}
				]
			}
		]
	}
]}
});

Meteor.publish('photosimg', function() {
if (!this.userId) {
return;
}
return Photosimg.find();
});

Meteor.publish('citoyenOnlineProx', function(latlng,radius) {
	check(latlng, {longitude:Number,latitude:Number});
	check(radius, Number);
	if (!this.userId) {
		return;
	}
	//moulinette pour mettre à jour les Point pour que l'index soit bon
	/*
	Citoyens.find({}).fetch().map(function(c){
		if(c.geo && c.geo.longitude){
			Citoyens.update({_id:c._id}, {$set: {'geoPosition': {
												type: "Point",
												'coordinates': [parseFloat(c.geo.longitude), parseFloat(c.geo.latitude)]
										}}});
		}
	});*/
	Citoyens._ensureIndex({
			"geoPosition.coordinates": "2dsphere"
	});
	console.log(JSON.stringify(Citoyens.find({'geoPosition.coordinates': {
							$nearSphere: {
									$geometry: {
											type: "Point",
											coordinates: [latlng.longitude, latlng.latitude]
									},
									$maxDistance: radius
							}}},{_disableOplog: true,fields:{pwd:0}}).fetch()));
	return Citoyens.find({'geoPosition.coordinates': {
							$nearSphere: {
									$geometry: {
											type: "Point",
											coordinates: [latlng.longitude, latlng.latitude]
									},
									$maxDistance: radius
							}}},{_disableOplog: true,fields:{pwd:0}});
});


Meteor.publish('users', function() {
	if (!this.userId) {
		return;
	}
	console.log(Meteor.users.find({
		'profile.online': true
	}, {
		fields: {
			'profile': 1,
			'username': 1
		}
	}).fetch());
	return Meteor.users.find({
		'profile.online': true
	}, {
		fields: {
			'profile': 1,
			'username': 1
		}
	});
});
