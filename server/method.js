Meteor.methods({
  createUserAccount: function(user){
    console.log(user);
    check(user, Object);
    check(user.name, String);
    check(user.username, String);
    check(user.email, String);
    check(user.password, String);
    check(user.codepostal, String);
    check(user.city, String);

    var passwordTest = new RegExp("(?=.{8,}).*", "g");
    if (passwordTest.test(user.password) == false) {
      throw new Meteor.Error("Password is Too short");
    }

    var emailTest = new RegExp(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
    if (emailTest.test(user.email) == false) {
      throw new Meteor.Error("Email not valid");
    }

    if (Citoyens.find({email: user.email}).count() !== 0) {
      throw new Meteor.Error("Email not unique");
    }

    if (Citoyens.find({username: user.username}).count() !== 0) {
      throw new Meteor.Error("Username not unique");
    }

      var pswdDigest = SHA256(user.email+user.password)

      let insee = Cities.findOne({insee: user.city});

      let userId = Citoyens.insert({
        name: user.name,
        email: user.email,
        pwd: pswdDigest,
        created: new Date(),
        address: {
          addressLocality: insee.alternateName,
          codeInsee: insee.insee,
          postalCode:insee.cp
        },
        geo: {
          latitude: insee.geo.latitude,
          longitude: insee.geo.longitude
        },
        geoPosition: {
          type: "Point",
          coordinates : [parseFloat(insee.geo.longitude),parseFloat(insee.geo.latitude)]
        }});
        return userId;


    },
    createUserAccountRest: function(user){
      console.log(user);
      check(user, Object);
      check(user.name, String);
      check(user.username, String);
      check(user.email, String);
      check(user.password, String);
      check(user.codepostal, String);
      check(user.city, String);

      var passwordTest = new RegExp("(?=.{8,}).*", "g");
      if (passwordTest.test(user.password) == false) {
        throw new Meteor.Error("Password is Too short");
      }

      var emailTest = new RegExp(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
      if (emailTest.test(user.email) == false) {
        throw new Meteor.Error("Email not valid");
      }

      if (Citoyens.find({email: user.email}).count() !== 0) {
        throw new Meteor.Error("Email not unique");
      }

      if (Citoyens.find({username: user.username}).count() !== 0) {
        throw new Meteor.Error("Username not unique");
      }

        let insee = Cities.findOne({insee: user.city});

  //try {
    var response = HTTP.call( 'POST', 'http://qa.communecter.org/communecter/person/register', {
      params: {
        "name": user.name,
        "email": user.email,
        "username" : user.username,
        "pwd": user.password,
        "cp": insee.cp,
        "city": insee.insee,
        "geoPosLatitude": insee.geo.latitude,
        "geoPosLongitude": insee.geo.longitude
      }
    });
    console.log(response);
    if(response.data.result && response.data.id){
      let userId = response.data.id;
      return userId;
    }else{
      throw new Meteor.Error(response.data.msg);
    }
  /*} catch(e) {
    throw new Meteor.Error("Error server");
  }*/


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
getcitiesbypostalcode: function(cp) {
  check(cp, String);
  return Cities.find({cp: cp}).fetch();
}
});
