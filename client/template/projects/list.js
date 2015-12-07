Template.listProjects.helpers({
  citoyen () {
    return Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())});
  }
});

Template.projectsEdit.helpers({
  project () {
    return Projects.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
  }
});

Template.projectsFields.helpers({

});
