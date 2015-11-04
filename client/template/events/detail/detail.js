Template.newsDetailEvents.helpers({
  event : function () {
    return Events.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
  },
  news : function () {
    return News.find({_id:new Mongo.ObjectID(Router.current().params.newsId)});
  },
  docNews : function () {
    return Documents.findOne({id:Router.current().params.newsId});
  },
  photoNews : function () {
    return Photosimg.find({_id:this.objId});
  },
  authorNews : function () {
    return Citoyens.findOne({_id:new Mongo.ObjectID(this.author)});
  },
  isAuthor : function () {
    if (this.author === Meteor.userId()) {
      return true;
    } else {
      return false;
    }
  },
  likesCount : function () {
    if (this.likes && this.likes.length) {
      return this.likes.length;
    }
    return 0;
  }
});

Template.newsDetailEvents.events({
  "click .delete-photo": function(e, t) {
    var photoId = e.currentTarget.id;
    var ok = confirm("Supprimer la photo ?");
    if (ok) {
      Meteor.call('deletePhoto', this._id._str);
    }
    e.preventDefault();
  },
  "click .like-photo": function(e, t) {
    var photoId = e.currentTarget.id;
    console.log(this._id._str);
    Meteor.call('likePhoto', this._id._str);
    e.preventDefault();
  }
});
