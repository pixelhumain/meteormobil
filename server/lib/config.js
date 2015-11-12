Accounts.registerLoginHandler(function(loginRequest) {
  if(!loginRequest.email || !loginRequest.pwd) {
    return null;
  }
  var pswdDigest = SHA256(loginRequest.email+loginRequest.pwd)
  //var pswdDigest = CryptoJS.SHA256(loginRequest.email+loginRequest.pwd).toString();

  var userId = null;
  var userC = Citoyens.findOne({email: loginRequest.email,pwd:pswdDigest},{fields:{pwd:0}});

  if(!userC) {
    throw new Meteor.Error(Accounts.LoginCancelledError.numericError, 'Communecter Login Failed');;
  } else {
    //ok valide
    var userM = Meteor.users.findOne({'_id':userC._id._str});
    console.log(userM);
    if(userM && userM.profile &&  userM.profile.pixelhumain){
      //Meteor.user existe
      userId= userM._id;
      Meteor.users.update(userId,{$set: {'profile.pixelhumain': userC,emails:[userC.email]}});
    }else{
      //Meteor.user n'existe pas
      //username ou emails
      userId = Meteor.users.insert({_id:userC._id._str,emails:[userC.email]});
      Meteor.users.update(userId,{$set: {'profile.pixelhumain': userC}});
    }
  }

  var stampedToken = Accounts._generateStampedLoginToken();
  Meteor.users.update(userId,
    {$push: {'services.resume.loginTokens': stampedToken}}
  );
  this.setUserId(userId);

  return {
    userId: userId,
    token: stampedToken.token
  }
});
