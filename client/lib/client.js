Meteor.startup(function () {

  Session.setDefault('GPSstart', false);

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

  function success(state) {
    if(state === 'Enabled') {
      console.log("GPS Is Enabled");
      Session.set('GPSstart', true);
      Location.locate(function(pos){
        Session.set('geo',pos);
        console.log(pos);
      }, function(err){
        console.log(err);
        Session.set('geo',null);
      });
    }
  }

  function failure() {
    console.log("Failed to get the GPS State");
    Session.set('GPSstart', false);
  }

  var options = {
    dialog: true
  }

  Location.getGPSState(success, failure, options);

  Template.registerHelper('distance',function (coordinates) {
    let geo = Location.getReactivePosition();
    let rmetre=geolib.getDistance(
      {latitude: parseFloat(coordinates.latitude), longitude: parseFloat(coordinates.longitude)},
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

Template.registerHelper('diffInText',
function(start, end) {
  var a = moment(start);
  var b = moment(end);
  var diffInMs = b.diff(a); // 86400000 milliseconds
  var diffInDays = b.diff(a, 'days'); // 1 day
  var diffInDayText=moment.duration(diffInMs).humanize();
  return diffInDayText;
}
);


});

Tracker.autorun(function() {
  if (Meteor.userId()) {
    Meteor.subscribe('users');
  }
});

Tracker.autorun(function() {
  if (Reload.isWaitingForResume()) {
    alert("Fermer et ré-ouvrir cette application pour obtenir la nouvelle version!");
    //window.location.reload();
  }
});
