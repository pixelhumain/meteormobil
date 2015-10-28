

Template.login.events({
  'submit .login-form': function (event) {
      event.preventDefault();
      var email = event.target.email.value;
      var password = event.target.password.value;
      Session.set('loading-logging',true);
      Meteor.loginAsPixel(email,password,function(err){
          if(!err) {
            Session.set('loading-logging',false);
              Router.go('/');
          }else{
            Session.set('error-logging',true);
            return false;
          }
      });
  }
});
Template.login.helpers({
  loadingLogging: function () {
return Session.get('loading-logging');
  },
  error: function () {
return Session.get('error-logging');
  },
});
