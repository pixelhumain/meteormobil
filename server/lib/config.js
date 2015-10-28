Accounts.registerLoginHandler(function(loginRequest) {
  //there are multiple login handlers in meteor.
  //a login request go through all these handlers to find it's login hander
  //so in our login handler, we only consider login requests which has admin field
  if(!loginRequest.email || !loginRequest.pwd) {
    return null;
  }
  console.log(loginRequest.email+loginRequest.pwd);
  var pswdDigest = CryptoJS.SHA256(loginRequest.email+loginRequest.pwd).toString();
console.log(pswdDigest)

  //todo verification pwd
  var userId = null;
  var userC = Citoyens.findOne({email: loginRequest.email,pwd:pswdDigest},{fields:{pwd:0}});

  if(!userC) {
    return null;
  } else {
    //ok valide
    var userM = Meteor.users.findOne({'_id':userC._id._str});
    console.log(userM);
    if(userM && userM.profile &&  userM.profile.pixelhumain){
      //Meteor.user existe
      userId= userM._id;
      console.log('Update');
      Meteor.users.update(userId,{$set: {'profile.pixelhumain': userC}});
    }else{
      //Meteor.user n'existe pas
      console.log(userC);
      userId = Meteor.users.insert({_id:userC._id._str,username:userC.name});
      Meteor.users.update(userId,{$set: {'profile.pixelhumain': userC}});
    }
  }

  var stampedToken = Accounts._generateStampedLoginToken();
    Meteor.users.update(userId,
      {$push: {'services.resume.loginTokens': stampedToken}}
    );

  //send loggedin user's user id
  return {
    userId: userId,
  token: stampedToken.token
  }
});
