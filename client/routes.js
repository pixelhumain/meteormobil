
Router.configure({
  loadingTemplate: 'loading'
});

Router.map(function() {

  this.route('home', {
    path: '/',
    waitOn: function() {
      return Meteor.subscribe('citoyen');
    }
  });

  this.route('camera-page');

  this.route("login", {
    path: '/login'
  });

  this.route("signin", {
    path: '/signin'
  });

  this.route("listEvents", {
    path: '/events',
    template: "listEvents",
    loadingTemplate: 'loading',
    waitOn: function() {
      return Meteor.subscribe('citoyen');
    }
  });

  this.route("newsListEvents", {
    template: "newsListEvents",
    path: 'news/event/:_id',
    loadingTemplate: 'loading',
    waitOn: function() {
      return Meteor.subscribe('newsListEvents', this.params._id);
    }
  });


  this.route("newsDetailEvents", {
    template: "newsDetailEvents",
    path: 'news/event/:_id/new/:newsId',
    waitOn: function() {
      return Meteor.subscribe('newsDetailEvents', this.params._id, this.params.newsId);
    }
  });

  this.route("newsAddEvent", {
    template: "newsAddEvent",
    path: 'news/event/:_id/add',
    data: function() {
      Session.set('eventId', this.params._id);
      return null;
    },
    waitOn: function() {
      //return Meteor.subscribe('newsAddEvent', this.params._id);
    }
  });

  this.route("newsEditEvent", {
    template: "newsEditEvent",
    path: 'news/event/:_id/edit/:newsId',
    data: function() {
      Session.set('eventId', this.params._id);
      return null;
    },
    waitOn: function() {
      //return Meteor.subscribe('newsEditEvent', this.params.newsId);
    }
  });

});

Router.configure({
  layoutTemplate: "layout"
});

let ensurePixelSignin = function () {
  if (Meteor.user() && Meteor.user().username) {
    this.next();
  } else {
    this.render('login');
  }
};

Router.onBeforeAction(ensurePixelSignin, {except: ['login','signin']});
