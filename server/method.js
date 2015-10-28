function userName() {
    return Meteor.user().username || Meteor.user().profile.name;
}

Meteor.methods({
    userup: function(geo) {
    	check(geo, {longitude:Number,latitude:Number});
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        if (Meteor.users.update({
                _id: this.userId
            }, {
                $set: {
                    'profile.loc': {
                        type: "Point",
                        'coordinates': [parseFloat(geo.longitude), parseFloat(geo.latitude)]
                    }
                }
            })) {
            console.log('update user web geo' + JSON.stringify({
                latitude: parseFloat(geo.latitude),
                longitude: parseFloat(geo.longitude)
            }));
            return true;
        } else {
            console.log('error update user web geo' + JSON.stringify({
                latitude: parseFloat(geo.latitude),
                longitude: parseFloat(geo.longitude)
            }));
            return false;
        }
        this.unblock();
    },
    settingRadius: function(radius) {
    	check(radius, Number);
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        if (Meteor.users.update({
                _id: this.userId
            }, {
                $set: {
                    type: "Number",
                    'profile.radius': parseInt(radius)
                }
            })) {
            console.log('update radius web geo' + JSON.stringify(parseInt(radius)));
            return true;
        } else {
            console.log('error update radius web geo' + JSON.stringify(parseInt(radius)));
        }
    },
    settingNotifications: function(notifications) {
    	check(notifications, Boolean);
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        if (Meteor.users.update({
                _id: this.userId
            }, {
                $set: {
                    type: "Boolean",
                    'profile.notifications': notifications
                }
            })) {
            console.log('update notifications ' + JSON.stringify(notifications));
            return true;
        } else {
            console.log('error update notifications ' + JSON.stringify(notifications));
        }
    },
    geoinsert: function(requestData) {
    	  check(requestData, Match.Any);
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        if (GeoLog.insert(requestData)) {
            return true;
        }
    },
    pushphoto: function(latLng,photoId) {
    	//check(latLng, {longitude:Number,latitude:Number});
    	check(photoId, String);
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
                    var userradius = Meteor.users.findOne({
                    _id: this.userId
                }, {
                    fields: {
                        "profile.radius": 1
                    }
                });

                var userfriends = Meteor.users.findOne({
                    _id: this.userId,
                    'profile.friends.status':'friend'
                }, {
                    fields: {
                        "profile.friends": 1
                    }
                });

                if(userradius && userradius.profile && userradius.profile.radius){
                var radius = parseInt(userradius.profile.radius);
                	}else{
                     var radius = 25000;
                    console.log('push radius default ' + JSON.stringify(radius));
                		}

                if(userfriends && userfriends.profile && userfriends.profile.friends){
                var favoris = userfriends.profile.friends.map(function(p) {
                    return p._id
                });
                console.log('push favoris ' + JSON.stringify(favoris));
                	}else{
                		var favoris = [];
                		}

                Meteor.users._ensureIndex({
                    "profile.loc": "2dsphere"
                });
                var usernoti = Meteor.users.find({
                    "profile.loc": {
                        $nearSphere: {
                            $geometry: {
                                type: "Point",
                                coordinates: [latLng.lng, latLng.lat]
                            },
                            $maxDistance: radius
                        }
                    },
                    "profile.notifications": true,
                    "_id": {
                        $ne: this.userId
                    }
                }, {
                    fields: {
                        _id: 1
                    }
                });
                var userIds = usernoti.map(function(p) {
                    return p._id
                });

                var mergedId = _.union( userIds, favoris);
                console.log('push user ' + JSON.stringify(userIds));
                console.log('push mergedId ' + JSON.stringify(mergedId));
                Push.debug = true;
                if (userIds.length > 0) {
                    Push.send({
                        from: 'push',
                        title: 'Nouvelle photo',
                        text: 'Nouvelle photo de ' + userName(),
                        payload: {
                            title: 'Nouvelle photo',
                            photoId: photoId,
                            pushType: 'photo'
                        },
                        query: {
                            userId: {
                                $in: mergedId
                            }
                        }
                    });
                }
    },
    cfsbase64tos3up: function(photo,str) {
    	  check(photo, Match.Any);
    	  check(str, Match.Any);
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }


    var fsFile = new FS.File();
    fsFile.attachData(photo,{'type':'image/jpeg'});
    fsFile.extension('jpg');
    fsFile.name(str);
    fsFile.metadata = {owner: this.userId};
    fsFile.on('error', function () {
    	console.log("There was a problem storing ");
    	});
    fsFile.on("uploaded", function () {
    	console.log("Done uploading!");
  });
console.log("Done uploading!");
    var photoret=Photosimg.insert(fsFile);
    console.log('photoret ' + photoret._id);
    console.log("Done uploading ");
    return photoret._id;
    },
    base64tos3up: function(photo,str) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        buf = new Buffer(photo.replace(/^data:image\/\w+;base64,/, ""), 'base64');

        var params = {
            Bucket: Meteor.settings.aws.bucket,
            Key: str,
            Body: buf,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        };

        var s3 = new AWS.S3();

        s3.putObject(params, function(err, data) {
            if (err) console.log(err)
            else {
                console.log(data);
                console.log("Successfully uploaded data to s3");
                var urlParams = {
                    Bucket: Meteor.settings.aws.bucket,
                    Key: str
                };
                s3.getSignedUrl('getObject', urlParams, function(err, url) {
                    if (url) {
                        console.log('the url of the image is ' + url);
                    }
                });
            }
        });
    },
    base64tos3: function(photo, latlng) {
    	        check(photo, Match.Any);
    	        check(latlng, Match.Any);
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }


        buf = new Buffer(photo.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
        var params = {
            Bucket: Meteor.settings.aws.bucket,
            Key: str,
            Body: buf,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        };

        var s3 = new AWS.S3();

        s3.putObject(params, function(err, data) {
            if (err) console.log(err)
            else {
                console.log(data);
                console.log("Successfully uploaded data to s3");
                var urlParams = {
                    Bucket: Meteor.settings.aws.bucket,
                    Key: str
                };
                s3.getSignedUrl('getObject', urlParams, function(err, url) {
                    if (url) {
                        console.log('the url of the image is ' + url);
                    }
                });
            }
        });

        Photos.insert({
            urlimage: str,
            createdAt: new Date(),
            owner: this.userId,
            username: userName(),
            loc: {
                type: "Point",
                coordinates: [latlng.lng, latlng.lat]
            },
            likes: [],
            marker: {
                lat: latlng.lat,
                lng: latlng.lng,
                title: userName,
                infoWindowContent: " <h1>" + userName() + "</h1> <img width='100' src='https://" + Meteor.settings.aws.bucket + ".s3-eu-west-1.amazonaws.com/" + str + "' />"
            }
        }, function(error, result) {
            if (!error) {
                Meteor.users.update({
                    _id: this.userId
                }, {
                    $inc: {
                        "profile.photosCount": 1
                    }
                });

                var userradius = Meteor.users.findOne({
                    _id: this.userId
                }, {
                    fields: {
                        "profile.radius": 1
                    }
                });
                var radius = parseInt(userradius.profile.radius);

                if (radius) {
                    console.log('push radius ' + JSON.stringify(radius));
                } else {
                    var radius = 25000;
                    console.log('push radius default ' + JSON.stringify(radius));
                }
                Meteor.users._ensureIndex({
                    "profile.loc": "2dsphere"
                });
                var usernoti = Meteor.users.find({
                    "profile.loc": {
                        $nearSphere: {
                            $geometry: {
                                type: "Point",
                                coordinates: [latlng.lng, latlng.lat]
                            },
                            $maxDistance: radius
                        }
                    },
                    "profile.notifications": true,
                    "_id": {
                        $ne: this.userId
                    }
                }, {
                    fields: {
                        _id: 1
                    }
                });
                var userIds = usernoti.map(function(p) {
                    return p._id
                });
                console.log('push user ' + JSON.stringify(userIds));
                Push.debug = true;
                if (userIds.length > 0) {
                    Push.send({
                        from: 'push',
                        title: 'Nouvelle photo',
                        text: 'Nouvelle photo de ' + userName(),
                        payload: {
                            title: 'Nouvelle photo',
                            photoId: result,
                            pushType: 'photo'
                        },
                        query: {
                            userId: {
                                $in: userIds
                            }
                        }
                    });
                }

                /*Push.debug = true;
				Push.send({
					from: 'push',
					title: 'Nouvelle photo',
					text: 'Nouvelle photo de '+Meteor.user().username,
					payload: {
						title: 'Nouvelle photo',
						photoId: result,
						pushType: 'photo'
					},
					query: {}
				});*/


            }
        });
    },
    deletePhoto: function(photoId) {
        check(photoId, String);
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        var photo = Photos.findOne({
            _id: photoId
        }, {
            "fields": {
                urlimage: 1
            }
        });
        if (photo.urlimage) {
            /*var s3 = new AWS.S3();
            var params = {
                Bucket: Meteor.settings.aws.bucket,
                Key: photo.urlimage
            };
            s3.deleteObject(params, function(err, data) {
                if (err) console.log(err, err.stack); // error
                else console.log(); // deleted
            })*/
            Photos.remove({
                _id: photoId,
                owner: this.userId
            }, function(error) {
                if (!error) {
                    console.log("Photo removed");
                    Meteor.users.update({
                        _id: this.userId
                    }, {
                        $inc: {
                            "profile.photosCount": -1
                        }
                    });

                }
            });
        }
    },
    'likePhoto': function(photoId) {
        check(photoId, String);

        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }

        if (Photos.findOne({
                _id: photoId,
                likes: {
                    $in: [this.userId]
                }
            })) {
            Photos.update({
                _id: photoId
            }, {
                $pull: {
                    likes: this.userId
                }
            })
        } else {
            Photos.update({
                _id: photoId
            }, {
                $push: {
                    likes: this.userId
                }
            });

                    Push.send({
                        from: 'push',
                        title: 'Nouveau J\'aime',
                        text: 'Nouveau J\'aime de ' + userName(),
                        payload: {
                            title: 'Nouveau J\'aime',
                            photoId: photoId,
                            pushType: 'likePhoto'
                        },
                        query: {
                            userId: Photos.findOne({_id: photoId},{fields:{owner:1}}).owner
                        }
                    });
        }
    },
    'favoris': function(userId) {
        check(userId, String);
        console.log(userId);
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }

        if (Meteor.users.findOne({
                _id: this.userId,
                'profile.friends': {
                    $in: [userId]
                }
            })) {
            	console.log('favoris');
            Meteor.users.update({
                _id: this.userId
            }, {
                $pull: {
                    'profile.friends': userId
                }
            })
        } else {
            Meteor.users.update({
                _id: this.userId
            }, {
                $push: {
                    'profile.friends': userId
                }
            })
        }
    },
    'ufriendRequest': function(userId) {
        check(userId, String);
        console.log(userId);
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        Friends.friendRequest(this.userId,userId);
Push.send({
                        from: 'push',
                        title: 'Demande ami',
                        text:  userName() + ' vous demande en ami',
                        payload: {
                            title: 'Demande ami',
                            friendId: this.userId,
                            pushType: 'requestFriend'
                        },
                        query: {
                            userId: userId
                        }
                    });
    },
    'uconfirmRequest': function(userId) {
        check(userId, String);
        console.log(userId);
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        Friends.confirmRequest(this.userId,userId);
Push.send({
                        from: 'push',
                        title: 'Demande accepté',
                        text:  userName() + ' vous a accepté comme ami',
                        payload: {
                            title: 'Demande accepté',
                            friendId: this.userId,
                            pushType: 'confirmFriend'
                        },
                        query: {
                            userId: userId
                        }
                    });
    },
    'udenyRequest': function(userId) {
        check(userId, String);
        console.log(userId);
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        Friends.denyRequest(this.userId,userId);
    },
    'uremoveFriend': function(userId) {
        check(userId, String);
        console.log(userId);
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        Friends.removeFriend(this.userId,userId);
    },
      inviteNewUser: function (email) {
      if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
      	var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
      	check(email, String);
      	Match.test(email, re);
      	console.log("email match "+email+" " + JSON.stringify(Meteor.users.find({'emails.address': email}).count()));
    if (Meteor.users.find({'emails.address': email}).count() == 0) {
    	    console.log("sendEnrollmentEmail");
    // i recommend to create user with initial password otherwise it will be empty string
    var userId = Accounts.createUser({email: email});
    Accounts.sendEnrollmentEmail(userId);
    Meteor.users.update({
                _id: this.userId
            }, {
                $push: {
                    'profile.invites': userId
                }
            });
            Friends.friendRequest(this.userId,userId);

    return userId;
    }else{
    return false;
    }

  },
      usernameup: function (username) {
      if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
      	check(username, String);
      	console.log("username match "+username+" " + JSON.stringify(Meteor.users.find({'username': username}).count()));
    if (Meteor.users.find({'username': username}).count() == 0) {
    	     	Meteor.users.update({_id: this.userId}, {$set: {'username': username,'profile.username':username}});
    	    console.log("usernameup");
    return this.userId;
    }else{
    return false;
    }

  },
   search: function(query, options) {
            options = options || {};

            // guard against client-side DOS: hard limit to 50
            if (options.limit) {
                options.limit = Math.min(50, Math.abs(options.limit));
            } else {
                options.limit = 50;
            }
console.log("query "+query);
            // TODO fix regexp to support multiple tokens
            var regex = new RegExp("^" + query);
            return Meteor.users.find({username: {$regex:  regex}}, options).fetch();
        }


});
