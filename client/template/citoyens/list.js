Template.listCitoyens.helpers({
  citoyen () {
    return Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())});
  }
});
