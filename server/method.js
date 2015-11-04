function userName() {
  return Meteor.user().username || Meteor.user().profile.name;
}

Meteor.methods({
  createUserAccount: function(user){
    console.log(user);
    check(user, Object);
    check(user.name, String);
    check(user.email, String);
    check(user.password, String);
    check(user.codepostal, String);
    check(user.city, String);

    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    Match.test(user.email, re);
    console.log("email match "+user.email+" " + JSON.stringify(Citoyens.find({email: user.email}).count()));
    if (Citoyens.find({email: user.email}).count() == 0) {

      console.log(user.email+user.password);
      var pswdDigest = CryptoJS.SHA256(user.email+user.password).toString();
      console.log(pswdDigest);

      let insee = Cities.findOne({insee: user.city});
      console.log(insee);
      console.log({name: user.name,email: user.email,pwd: pswdDigest,created: new Date(),address:{ addressLocality: insee.alternateName,codeInsee: insee.insee,postalCode: insee.cp},geo:{latitude: insee.geo.latitude,longitude: insee.geo.longitude}});
      let userId = Citoyens.insert({name: user.name,email: user.email,pwd: pswdDigest,created: new Date(),address: { addressLocality: insee.alternateName,codeInsee: insee.insee,postalCode: insee.cp},geo: {latitude: insee.geo.latitude,longitude: insee.geo.longitude}});
        return userId;
      }else{
        throw new Meteor.Error("Email not unique");
      }

    },
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
    cfsbase64tos3up: function(photo,str,type,idType) {
      check(photo, Match.Any);
      check(str, Match.Any);
      if (!this.userId) {
        throw new Meteor.Error("not-authorized");
      }


      var fsFile = new FS.File();
      fsFile.attachData(photo,{'type':'image/jpeg'});
      fsFile.extension('jpg');
      fsFile.name(str);
      fsFile.metadata = {owner: this.userId,type:type,id:idType};
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
    deletePhoto: function(photoId) {
      check(photoId, String);
      if (!this.userId) {
        throw new Meteor.Error("not-authorized");
      }
      var photo = Documents.findOne({
        id: photoId
      }, {
        "fields": {
          objId: 1
        }
      });
      if (photo && photo.objId) {
        /*var s3 = new AWS.S3();
        var params = {
        Bucket: Meteor.settings.aws.bucket,
        Key: photo.urlimage
      };
      s3.deleteObject(params, function(err, data) {
      if (err) console.log(err, err.stack); // error
      else console.log(); // deleted
    })*/
        News.remove({
          _id: new Mongo.ObjectID(photoId),
          author: this.userId
        });
        Documents.remove({
          id: photoId,
          author: this.userId
        });
        Photosimg.remove({_id:photo.objId})
      }else{
        News.remove({
          _id: new Mongo.ObjectID(photoId),
          author: this.userId
        });
      }
    },
    'likePhoto': function(photoId) {
      check(photoId, String);

      if (!this.userId) {
        throw new Meteor.Error("not-authorized");
      }

      if (News.findOne({
        _id: new Mongo.ObjectID(photoId),
        likes: {
          $in: [this.userId]
        }
      })) {
        News.update({
          _id: new Mongo.ObjectID(photoId)
        }, {
          $pull: {
            likes: this.userId
          }
        })
      } else {
        News.update({
          _id: new Mongo.ObjectID(photoId)
        }, {
          $push: {
            likes: this.userId
          }
        });

        /*Push.send({
        from: 'push',
        title: 'Nouveau J\'aime',
        text: 'Nouveau J\'aime de ' + userName(),
        payload: {
        title: 'Nouveau J\'aime',
        photoId: photoId,
        pushType: 'likePhoto'
      },
      query: {
      userId: News.findOne({_id: new Mongo.ObjectID(photoId)},{fields:{author:1}}).author
    }
  });*/
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
  if (options.limit) {
    options.limit = Math.min(50, Math.abs(options.limit));
  } else {
    options.limit = 50;
  }
  console.log("query "+query);
  var regex = new RegExp("^" + query);
  return Meteor.users.find({username: {$regex:  regex}}, options).fetch();
},
getcitiesbypostalcode: function(cp) {
  check(cp, String);
  //console.log(cp);
  //console.log(Cities.findOne({cp: cp}));
  return Cities.find({cp: cp}).fetch();
}
});
