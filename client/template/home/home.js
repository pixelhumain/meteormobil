
 function userName() {
    return Meteor.user().username || Meteor.user().profile.name;
}


Template.layout.events({
  "click .logout": function (event) {
      event.preventDefault();
      Meteor.logout();
      Router.go('/login');
  }
});

Template.layout.helpers({
    '_home': function () {
      return  TAPi18n.__('home');
    },
    '_events': function () {
      return  TAPi18n.__('events');
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

  Template.listEvents.helpers({
      users: function () {
        return Meteor.users.find({});
      },
      countUsers: function () {
        return Meteor.users.find({}).count();
      },
      citoyen: function () {
        return Citoyens.findOne({});
      },
      events: function () {
        return Events.find({});
      },
      countEvents: function () {
        return Events.find({}).count();
      },
      isStart : function () {
        let start = moment(this.startDate).toDate();
        let now = moment().toDate();
        return moment(start).isBefore(now); // True
      },
      countAttendees : function () {
        return this.links && this.links.attendees && _.size(this.links.attendees);
      }
    });
