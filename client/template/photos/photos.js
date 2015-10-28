
  Template.photos.onCreated(function(){
    Session.setDefault('limit', 5);
    Session.setDefault('selectuserId', false);
  });

    Template.photos.helpers({
      photos () {
      	      return Photos.find({}, {sort: {"createdAt": -1},limit: Session.get('limit') });
      },
      countPhotos () {
          return Photos.find({}, {sort: {"createdAt": -1}}).count();
      },
      isLimit () {
         return  Photos.find({}, {sort: {"createdAt": -1}}).count() > Session.get('limit');
      }
      });

  Template.photos.events({
    'click .give-me-more': function(evt) {
    let newLimit = Session.get('limit') + 10;
    Session.set('limit', newLimit);
    }
  });

  Template.photoImage.helpers({
  image () {
        return Photosimg.find({_id:this.urlimage});
      }
  	});
