
/*Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL"
});*/

Meteor.loginAsPixel = function(email,password, callback) {
  var loginRequest = {email: email, pwd: password};
  Accounts.callLoginMethod({
    methodArguments: [loginRequest],
    userCallback: callback
  });
};
