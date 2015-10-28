Meteor.startup(function () {

let language = window.navigator.userLanguage || window.navigator.language;
if (language.indexOf('-') !== -1)
    language = language.split('-')[0];

if (language.indexOf('_') !== -1)
    language = language.split('_')[0];

 //console.log(language);
 //alert('language: ' + language + '\n');

	Helpers.setLanguage(language);

    TAPi18n.setLanguage(language)
      .done(function () {
        //Session.set("showLoadingIndicator", false);
      })
      .fail(function (error_message) {
        console.log(error_message);
      });


Template.registerHelper('distance',function (coordinates) {
    	let geo = Location.getReactivePosition();
    	let rmetre=geolib.getDistance(
    {latitude: parseFloat(coordinates[1]), longitude: parseFloat(coordinates[0])},
    {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)});
if(rmetre>1000){
var rkm=rmetre/1000;
return 	rkm+' km';
	}else{
return 	rmetre+' m';
		}

});

Template.registerHelper('equals',
    function(v1, v2) {
        return (v1 === v2);
    }
);

Template.registerHelper('langChoix',
function() {
    return Helpers.language();
  }
);

});

Tracker.autorun(function() {
  if (Meteor.userId()) {
      Meteor.subscribe('citoyen');
      Meteor.subscribe('photos');
      Meteor.subscribe('users');
      Meteor.subscribe('photosimg');
    }
});

Tracker.autorun(function() {
    if (Reload.isWaitingForResume()) {
        alert("Fermer et ré-ouvrir cette application pour obtenir la nouvelle version!");
    }
});
