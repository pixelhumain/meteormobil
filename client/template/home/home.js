

Template.layout.events({
  "click .logout" (event) {
    event.preventDefault();
    Meteor.logout();
    //Meteor.logoutOtherClients
    Router.go('/login');
  }
});

Template.layout.helpers({
  '_home' () {
    return  TAPi18n.__('home');
  },
  '_events' () {
    return  TAPi18n.__('events');
  },
  '_projects' () {
    return  TAPi18n.__('projects');
  },
  '_organizations' () {
    return  TAPi18n.__('organizations');
  },
  '_citoyens' () {
    return  TAPi18n.__('citoyens');
  },
  citoyen () {
    return Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())});
  }
});


Template.home.helpers({
  users () {
    return Meteor.users.find({});
  },
  countUsers () {
    return Meteor.users.find({}).count();
  }
});
