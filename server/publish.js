Meteor.publish('citoyen', function() {
	if (!this.userId) {
return;
}
	var objectId = new MongoInternals.NpmModule.ObjectID(this.userId);
	var citoyen = Citoyens.find({_id:objectId},{fields:{pwd:0}});

 return citoyen;
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

Meteor.publish('photosimg', function() {
	if (!this.userId) {
return;
}
 return Photosimg.find();
});

Meteor.publish('users', function() {
		if (!this.userId) {
   return;
    }
    return Meteor.users.find({
			'profile.online': true
    }, {
        fields: {
            'profile': 1,
            'username': 1
        }
    });
});
