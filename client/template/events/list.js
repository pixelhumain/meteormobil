Template.listEvents.helpers({
  citoyen () {
    return Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())});
  }
});

Template.eventsEdit.helpers({
  event () {
    return Events.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
  }
});

Template.eventsFields.helpers({

});
