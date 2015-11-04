var  templateDictionary = new ReactiveDict('templateDictionary');

Template.login.onCreated(function () {
  //Session.set('error',null);
  templateDictionary.set( 'error', false );
  templateDictionary.set( 'loading-logging', false );
});

Template.login.onRendered(function () {
  //Session.set('error',null);
});

Template.login.events({
  'submit .login-form': function (event,template) {
    event.preventDefault();
    var email = event.target.email.value;
    var password = event.target.password.value;
    if(!email || !password){
      //Session.set('error', 'Error Fields.');
      templateDictionary.set( 'error', 'you do not complete all fields.' );
      return;
    }
    //Session.set('loading-logging',true);
    templateDictionary.set( 'loading-logging', true );
    Meteor.loginAsPixel(email,password,function(error){
      if(!error) {
        //Session.set('error',null);
        //Session.set('loading-logging',false);
        templateDictionary.set( 'loading-logging', false );
        templateDictionary.set( 'error', null );
        Router.go('/');
      }else{
        //Session.set('loading-logging',false);
        //Session.set('error',error.reason);
        //console.log(error);
        templateDictionary.set( 'loading-logging', false );
        templateDictionary.set( 'error', error.error );
        return null;
      }
    });
  }
});
Template.login.helpers({
  loadingLogging: function () {
    //return Session.get('loading-logging');
    return templateDictionary.get( 'loading-logging' );
  },
  error: function () {
    //return Session.get('error');
    return templateDictionary.get( 'error' );
  },
});

Template.login.onCreated(function () {
  //Session.set('error',null);
  templateDictionary.set( 'error', false );
  templateDictionary.set( 'loading-signup', false );
  templateDictionary.set( 'cities', null );

});

Template.signin.onRendered(function () {
  //Session.set('error',null);
  //Session.set('cities',null);
});

Template.signin.events({
  'keyup #fulladdressselect': function(event,template){
    var str = "";
    if(template.find('#codepostal').value.length>0 && template.find('#codepostal').value != null)
    str += template.find('#codepostal').value;

    if(event.currentTarget.value.length>0 && event.currentTarget.value.length != null){
      if(str != "") str += " ";
      str += event.currentTarget.value;
    }

    if(event.currentTarget.value.length>5){
      HTTP.get( 'http://nominatim.openstreetmap.org/search/'+encodeURIComponent(str)+'?format=json&polygon=0&addressdetails=1', {},
      function( error, response ) {
        if ( error ) {
          console.log( error );
        } else {
          console.log( JSON.stringify(response));
          //Session.set('cities',response.data);
          templateDictionary.set( 'cities', response.data );
          return;
        }
      }
    );
  }
},
'keyup #codepostal, change #codepostal': function(event,template){
  if(event.currentTarget.value.length==5){
    Meteor.call('getcitiesbypostalcode',event.currentTarget.value,function(error, data){
      //console.log( JSON.stringify(data));
      //Session.set('cities',data);
      templateDictionary.set( 'cities', data);
      return;
    })
    /*HTTP.get( 'http://nominatim.openstreetmap.org/search?postalcode='+event.currentTarget.value+'&format=json&polygon=1&addressdetails=1', {},
    function( error, response ) {
    if ( error ) {
    console.log( error );
  } else {
  console.log( JSON.stringify(response.data));
  Session.set('cities',response.data);
  return;
}
}
);*/
}else{
  //Session.set('cities',null);
  templateDictionary.set( 'cities', null );
  return;
}
},
'submit .signup-form': function (event,template) {
  event.preventDefault();
  //Session.set('error', null);
  templateDictionary.set( 'error', null );
  var trimInput = function(val) {
    return val.replace(/^\s*|\s*$/g, "");
  }

  var email = trimInput(event.target.email.value);
  var password = event.target.password.value;
  var repassword = event.target.repassword.value;
  var name = trimInput(event.target.name.value);
  var codepostal = trimInput(event.target.codepostal.value);
  if(event.target.city && event.target.city.value){
    var city = trimInput(event.target.city.value);
  }

  if(!email || !password || !repassword || !name || !codepostal || !city){
    //Session.set('error', 'Error Fields.');
    templateDictionary.set( 'error', 'you do not complete all fields.' );
    return;
  }

  var isValidCodepostal = function(val, field) {
    if (val.length === 5) {
      return true;
    } else {
      //Session.set('error', 'Error Postcode.');
      templateDictionary.set( 'error', 'Postcode must be 5 digits.' );
      return false;
    }
  }

  var isValidName = function(val, field) {
    if (val.length >= 6) {
      return true;
    } else {
      //Session.set('error', 'Name Too short.');
      templateDictionary.set( 'error', 'Name is Too short.' );
      return false;
    }
  }

  var isValidPassword = function(val, field) {
    if (val.length > 7) {
      return true;
    } else {
      //Session.set('error', 'Password Too short.');
      templateDictionary.set( 'error', 'Password is Too short.' );
      return false;
    }
  }
  if(!isValidName(name)){
    return;
  }
  if (!isValidPassword(password)){
    return;
  }
  if(!isValidCodepostal(codepostal)){
    return;
  }
  if(password != repassword){
    //Session.set('error','Not the same password');
    templateDictionary.set( 'error', 'Not the same password' );
    return;
  }

  //verifier
  var user = {};
  user.email = email;
  user.password = password;
  user.name = name;
  user.repassword = repassword;
  user.codepostal = codepostal;
  //numero insee
  user.city = city;

  //verifier email et unique
  //Session.set('error',null);
  //Session.set('loading-signup',true);
  templateDictionary.set( 'loading-signup', true );
  templateDictionary.set( 'error', null );
  Meteor.call("createUserAccount",user, function (error) {
    if(error){
      console.log(error.error);
      //Session.set('error',error.error);
      templateDictionary.set( 'error', error.error );
    }else{
      Meteor.loginAsPixel(email,password,function(err){
        if(!err) {
          //Session.set('error',null);
          //Session.set('loading-signup',false);
          templateDictionary.set( 'loading-signup', false );
          templateDictionary.set( 'error', null );
          Router.go('/');
        }else{
          //Session.set('loading-signup',false);
          //Session.set('error',err);
          templateDictionary.set( 'loading-signup', false );
          templateDictionary.set( 'error', err );
          return false;
        }
      });
    }
  });
}
});

Template.signin.helpers({
  loadingLogging: function () {
    //return Session.get('loading⁻signup');
    return templateDictionary.get( 'loading⁻signup' );
  },
  error: function () {
    ///return Session.get('error');
    return templateDictionary.get( 'error' );
  },
  city: function(){
    //return Session.get('cities');
    return templateDictionary.get( 'cities' );
  }
});
