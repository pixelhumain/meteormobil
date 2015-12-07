

Router.configure({
  layoutTemplate: "layout",
  loadingTemplate: "loading"
});

var homeSubs = new SubsManager({cacheLimit: 9999, expireIn: 9999});
var singleSubs = new SubsManager({cacheLimit: 20, expireIn: 3});

Router.map(function() {

  this.route('home', {
    path: '/',
    waitOn: function() {

      /*let radius = Session.get('radius') ? Session.get('radius') : 25000;
      let GPSstart = Session.get('GPSstart');
      if (GPSstart) {
        let latlng = Location.getReactivePosition();
        if(latlng){
          Meteor.subscribe('citoyenOnlineProx', {
            latitude: parseFloat(latlng.latitude),
            longitude: parseFloat(latlng.longitude)
          }, radius);
        }
      }*/
Meteor.subscribe('users');
    }
  });

  this.route('camera-page');

  this.route("login", {
    path: '/login'
  });

  this.route("signin", {
    path: '/signin'
  });

  this.route("listProjects", {
    path: '/projects',
    template: "listProjects",
    loadingTemplate: 'loading',
    waitOn: function() {
      Meteor.subscribe('citoyen');
      Meteor.subscribe('citoyenProjects');
    }
  });

  this.route("projectsAdd", {
    template: "projectsAdd",
    path: 'projects/add',
    data: function() {

    },
    waitOn: function() {
      Meteor.subscribe('lists');
    }
  });

  this.route("projectsEdit", {
    template: "projectsEdit",
    path: 'projects/:_id/edit',
    data: function() {
      return null;
    },
    waitOn: function() {
      return [ Meteor.subscribe('lists') , Meteor.subscribe('scopeDetail', 'projects', this.params._id) ];
    }
  });

  this.route("listOrganizations", {
    path: '/organizations',
    template: "listOrganizations",
    loadingTemplate: 'loading',
    waitOn: function() {
      Meteor.subscribe('citoyen');
      Meteor.subscribe('citoyenOrganizations');
    }
  });

  this.route("organizationsAdd", {
    template: "organizationsAdd",
    path: 'organizations/add',
    data: function() {

    },
    waitOn: function() {
      Meteor.subscribe('lists');
    }
  });

  this.route("organizationsEdit", {
    template: "organizationsEdit",
    path: 'organizations/:_id/edit',
    data: function() {
      return null;
    },
    waitOn: function() {
      return [ Meteor.subscribe('lists') , Meteor.subscribe('scopeDetail', 'organizations', this.params._id) ];
    }
  });

  this.route("listCitoyens", {
    path: '/citoyens',
    template: "listCitoyens",
    loadingTemplate: 'loading',
    waitOn: function() {
      Meteor.subscribe('citoyen');
      Meteor.subscribe('citoyenCitoyens');
    }
  });

  this.route("listEvents", {
    path: '/events',
    template: "listEvents",
    loadingTemplate: 'loading',
    waitOn: function() {
      Meteor.subscribe('citoyen');
      Meteor.subscribe('citoyenEvents');
    }
  });

  this.route("eventsAdd", {
    template: "eventsAdd",
    path: 'events/add',
    data: function() {

    },
    waitOn: function() {
      Meteor.subscribe('lists');
    }
  });

  this.route("eventsEdit", {
    template: "eventsEdit",
    path: 'events/:_id/edit',
    data: function() {
      return null;
    },
    waitOn: function() {
      return [ Meteor.subscribe('lists') , Meteor.subscribe('scopeDetail', 'events', this.params._id) ];
    }
  });

  this.route("newsList", {
    template: "newsList",
    path: 'news/:scope/:_id',
    loadingTemplate: 'loading',
    data: function() {
      Session.set('scopeId', this.params._id);
      Session.set('scope', this.params.scope);
      return null;
    },
    waitOn: function() {
      Meteor.subscribe('scopeDetail', this.params.scope, this.params._id);
      return singleSubs.subscribe('newsList', this.params.scope, this.params._id);
    }
  });


  this.route("newsDetail", {
    template: "newsDetail",
    path: 'news/:scope/:_id/new/:newsId',
    data: function() {
      Session.set('scopeId', this.params._id);
      Session.set('scope', this.params.scope);
      return null;
    },
    waitOn: function() {
      Meteor.subscribe('scopeDetail', this.params.scope, this.params._id);
      return Meteor.subscribe('newsDetail', this.params.newsId);
    }
  });

  this.route("newsAdd", {
    template: "newsAdd",
    path: 'news/:scope/:_id/add',
    data: function() {
      Session.set('scopeId', this.params._id);
      Session.set('scope', this.params.scope);
      return null;
    },
    waitOn: function() {
    }
  });

  this.route("newsEdit", {
    template: "newsEdit",
    path: 'news/:scope/:_id/edit/:newsId',
    data: function() {
      Session.set('scopeId', this.params._id);
      Session.set('scope', this.params.scope);
      return null;
    },
    waitOn: function() {
      Meteor.subscribe('scopeDetail', this.params.scope, this.params._id);
      return Meteor.subscribe('newsDetail', this.params.newsId);
    }
  });

});


let ensurePixelSignin = function () {
  if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.pixelhumain) {
    this.next();
  } else {
    this.render('login');
  }
};

Router.onBeforeAction(ensurePixelSignin, {except: ['login','signin']});
