
Meteor.publish('lists', function() {
	if (!this.userId) {
		return;
	}
	let lists = Lists.find({});
	//console.log(JSON.stringify(lists.fetch()));
	return lists;
});


Meteor.publish('cities', function(cp,country) {
	if (!this.userId) {
		return;
	}
	console.log(country);
	console.log(cp);
	check(cp, String);
	check(country, String);
	let lists = Cities.find({cp:cp,country:country});
	console.log(JSON.stringify(lists.fetch()));
	return lists;
});

Meteor.publish('citoyen', function() {
	if (!this.userId) {
		return;
	}
	let objectId = new Mongo.ObjectID(this.userId);
	let citoyen = Citoyens.find({_id:objectId},{fields:{pwd:0}});
	var userC = Meteor.users.findOne({_id:this.userId});
	console.log(userC);
	//console.log(JSON.stringify(citoyen.fetch()));
	return citoyen;
});

Meteor.publish('citoyenEvents', function() {
	if (!this.userId) {
		return;
	}
	let citoyen = Citoyens.findOne({_id:new Mongo.ObjectID(this.userId)},{fields:{pwd:0}});
	console.log(citoyen);
	//events citoyen
	if(citoyen && citoyen.links && citoyen.links.events){
		let eventsIds = _.map(citoyen.links.events, function(num, key){
			let objectId = new Mongo.ObjectID(key);
			return objectId;
		});
		//selector startDate endDate sort et limit
		var inputDate = new Date();
		console.log(inputDate);
		console.log(JSON.stringify(Events.find({_id:{$in:eventsIds},endDate:{$gte:inputDate}},{_disableOplog: true}).fetch()));
		return Events.find({_id:{$in:eventsIds},endDate:{$gte:inputDate}},{_disableOplog: true});
	}else{
		console.log('vide');
		return this.ready();
	}
});

Meteor.publish('citoyenProjects', function() {
	if (!this.userId) {
		return;
	}
	let citoyen = Citoyens.findOne({_id:new Mongo.ObjectID(this.userId)},{fields:{pwd:0}});
	console.log(citoyen);
	//events citoyen
	if(citoyen && citoyen.links && citoyen.links.projects){
		let projectsIds = _.map(citoyen.links.projects, function(num, key){
			let objectId = new Mongo.ObjectID(key);
			return objectId;
		});
		//selector startDate endDate sort et limit
		var inputDate = new Date();
		console.log(inputDate);
		console.log(JSON.stringify(Projects.find({_id:{$in:projectsIds},endDate:{$gte:inputDate}},{_disableOplog: true}).fetch()));
		return Projects.find({_id:{$in:projectsIds},endDate:{$gte:inputDate}},{_disableOplog: true});
	}else{
		console.log('vide');
		return this.ready();
	}
});

Meteor.publish('citoyenOrganizations', function() {
	if (!this.userId) {
		return;
	}
	let citoyen = Citoyens.findOne({_id:new Mongo.ObjectID(this.userId)},{fields:{pwd:0}});
	console.log(citoyen);
	//events citoyen
	if(citoyen && citoyen.links && citoyen.links.memberOf){
		let memberOfIds = _.map(citoyen.links.memberOf, function(num, key){
			let objectId = new Mongo.ObjectID(key);
			return objectId;
		});
		console.log(JSON.stringify(Organizations.find({_id:{$in:memberOfIds}},{_disableOplog: true}).fetch()));
		return Organizations.find({_id:{$in:memberOfIds}},{_disableOplog: true});
	}else{
		console.log('vide');
		return this.ready();
	}
});

Meteor.publish('citoyenCitoyens', function() {
	if (!this.userId) {
		return;
	}
	let citoyen = Citoyens.findOne({_id:new Mongo.ObjectID(this.userId)},{fields:{pwd:0}});
	console.log(citoyen);
	//knows citoyen organization
	if(citoyen && citoyen.links && citoyen.links.knows){
		let knowsIds = _.map(citoyen.links.knows, function(num, key){
			let objectId = new Mongo.ObjectID(key);
			return objectId;
		});
		return [Citoyens.find({_id:{$in:knowsIds}},{_disableOplog: true}),
		Organizations.find({_id:{$in:knowsIds}},{_disableOplog: true})]
	}else{
		console.log('vide');
		return this.ready();
	}
});


Meteor.publishComposite('scopeDetail', function(scope,scopeId) {
	check(scopeId, String);
	check(scope, String);
	check(scope, Match.Where(function(name) {
		return _.contains(['events', 'projects','organizations','citoyens'], name);
	}));
	let collection = nameToCollection(scope);
	if (!this.userId) {
		return;
	}
	return {
		find: function() {
			return collection.find({_id:new Mongo.ObjectID(scopeId)});
		},
		children: [
			{
				find: function(scopeD) {
					return Citoyens.find({
						_id: new Mongo.ObjectID(scopeD.creator)
					}, {
						fields: {
							'name': 1
						}
					});
				}
			},
			{
				find: function(scopeD) {
					return Cities.find({
						'cp': scopeD.address.postalCode
					});
				}
			}
		]}
	});

	Meteor.publishComposite('newsList', function(scope,scopeId) {
		check(scopeId, String);
		check(scope, String);
		if (!this.userId) {
			return;
		}

		return {
			find: function() {
				var query = {};
				query['scope.'+scope] = {$in:[scopeId]};
				return News.find(query);
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
}
});

Meteor.publishComposite('newsDetail', function(newsId) {
	check(newsId, String);
	if (!this.userId) {
		return;
	}

	return {
		find: function() {
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
		return [
			Meteor.users.find({'profile.online': true}, {fields: {'profile': 1,'username': 1}}),
			Citoyens.find({_id:new Mongo.ObjectID(this.userId)},{_disableOplog: true,fields:{pwd:0}})
		];
	});
