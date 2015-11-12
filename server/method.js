Meteor.methods({
  createUserAccount: function(user){
    console.log(user);
    check(user, Object);
    check(user.name, String);
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

    if (Citoyens.find({email: user.email}).count() == 0) {

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
        }else{
          throw new Meteor.Error("Email not unique");
        }

      },
   createUserAccountRest: function(user){
        console.log(user);
        check(user, Object);
        check(user.name, String);
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

        if (Citoyens.find({email: user.email}).count() == 0) {

          //var pswdDigest = SHA256(user.email+user.password)

          let insee = Cities.findOne({insee: user.city});

            /*let userId = Citoyens.insert({
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
              }});*/


/*
- name : string
- email : well formated email
- postalCode : existing postalCode
- geoPosLatitude : float
- geoPosLongitude : float
- pwd : non encrypted password
- city : String
- pendingUserId : String.
*/

              var response = HTTP.call( 'POST', 'http://qa.communecter.org/communecter/person/register', {
                data: {
                  "name": user.name,
                  "email": user.email,
                  "pwd": user.password,
                  "postalCode": insee.cp,
                  "city": insee.insee,
                  "geoPosLatitude": parseFloat(insee.geo.latitude),
                  "geoPosLongitude": parseFloat(insee.geo.longitude)
                }
              });
              console.log(response);
console.log({
  "name": user.name,
  "email": user.email,
  "pwd": user.password,
  "postalCode": insee.cp,
  "city": insee.insee,
  "geoPosLatitude": parseFloat(insee.geo.latitude),
  "geoPosLongitude": parseFloat(insee.geo.longitude)
});
              if(response && response.statusCode===200){
                if(response.data.result && response.data.id){
                  let userId = response.data.id;

                }else{
                  throw new Meteor.Error(response.data.msg);
                }
              }else{
                  throw new Meteor.Error("error server");
              }



              return userId;
            }else{
              throw new Meteor.Error("Email not unique");
            }

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
