
 function userName() {
    return Meteor.user().username || Meteor.user().profile.name;
}

  let onSuccess = function (imageData) {

    let str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";

    Meteor.call("cfsbase64tos3up",imageData,str, function (error, photoret) {
      if(photoret){
      	     console.log('photoret '+photoret);
    	      Photos.insert({
            urlimage: photoret,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: userName()
        }, function(error, result) {
            if (!error) {
                /*Meteor.users.update({
                    _id: Meteor.userId()
                }, {
                    $inc: {
                        "profile.photosCount": 1
                    }
                });*/
                //call push
                //Meteor.call('pushphoto',{lat:latLng.latitude,lng:latLng.longitude},result);

            }
        });
        }
    	});


    Router.go("/photos");
  };

Template.layout.events({
  "click .logout": function (event) {
      event.preventDefault();
      Meteor.logout();
      Router.go('/login');
  },
  "click .photo-link": function () {
    const options = {
      width: 350,
      height: 350,
      quality: 75
      };
    //MeteorCamera
    MeteoricCamera.getPicture(options,function (error, data) {
      // we have a picture
      if (! error) {
        onSuccess(data);
      }else{
        console.log(error);
        }
    });
  }
});

Template.home.helpers({
    users: function () {
      return Meteor.users.find({});
    },
    countUsers: function () {
      return Meteor.users.find({}).count();
    }
  });
