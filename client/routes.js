


Router.map(function() {

    this.route('home', {
        path: '/'
    });

    this.route('camera-page');

    this.route("login", {
      path: '/login'
    });

    this.route("photos", {
      path: '/photos'
    });

    this.route("photoDetail", {
        template: "photoDetail",
        path: 'photo/:_id',
        waitOn: function() {
            //return Meteor.subscribe('photoDetail', this.params._id);
        },
        data: function() {
            let templateData = {
                photo: Photos.find({
                    _id: this.params._id
                })
            };
            return templateData;
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

Router.onBeforeAction(ensurePixelSignin, {except: ['login']});
