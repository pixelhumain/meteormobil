pageSession = new ReactiveDict('pageProjects');

Template.listProjects.helpers({
  citoyen () {
    return Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())});
  }
});

Template.projectsAdd.onCreated(function () {
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);
});

Template.projectsEdit.onCreated(function () {
  pageSession.set('postalCode', null);
  pageSession.set('country', null);
  pageSession.set('city', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);
});

Template.projectsAdd.helpers({

});

Template.projectsEdit.helpers({
  project () {
    let project = Projects.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    let projectEdit = {};
    projectEdit._id = project._id._str;
    projectEdit.name = project.name;
    projectEdit.description = project.description;
    projectEdit.startDate = project.startDate;
    projectEdit.endDate = project.endDate;
    projectEdit.tags = project.tags;
    projectEdit.country = project.address.addressCountry;
    projectEdit.postalCode = project.address.postalCode;
    projectEdit.city = project.address.codeInsee;
    if(project && project.address && project.address.streetAddress){
    projectEdit.streetAddress = project.address.streetAddress;
    }
    projectEdit.geoPosLatitude = project.geo.latitude;
    projectEdit.geoPosLongitude = project.geo.longitude;
    return projectEdit;
  }
});



Template.projectsFields.helpers({
  optionsInsee () {
    let postalCode = '';
    let country = '';
    postalCode = pageSession.get('postalCode') || AutoForm.getFieldValue('postalCode');
    country = pageSession.get('country') || AutoForm.getFieldValue('country');
    if(postalCode && country){
      let insee = Cities.find({cp:postalCode,country:country});
      console.log(insee.fetch());
      if(insee){
        return insee.map(function (c) {
          return {label: c.alternateName, value: c.insee};
        });
      }
    }else{return false;}
  },
  latlng () {
    let city = pageSession.get('city') || AutoForm.getFieldValue('city');
    let latitude = pageSession.get('geoPosLatitude') || AutoForm.getFieldValue('geoPosLatitude');
    let longitude = pageSession.get('geoPosLongitude') || AutoForm.getFieldValue('geoPosLongitude');
    return city && latitude && longitude;
  },
  longitude (){
    return pageSession.get('geoPosLongitude') || AutoForm.getFieldValue('geoPosLongitude');
  },
  latitude (){
    return pageSession.get('geoPosLatitude') || AutoForm.getFieldValue('geoPosLatitude');
  }
});


Template.projectsFields.onRendered(function() {
  var self = this;
  self.autorun(function() {
    let postalCode = pageSession.get('postalCode')  || AutoForm.getFieldValue('postalCode');
    let country = pageSession.get('country')  || AutoForm.getFieldValue('country');
      console.log(`${postalCode} ${country}`);
    console.log('recompute');
    if (!!postalCode) {
      self.subscribe('cities',postalCode,country);
    }
  });
});


Template.projectsFields.events({
  'keyup input[name="postalCode"],change input[name="postalCode"]': function(e, tmpl) {
    e.preventDefault();
    pageSession.set( 'postalCode', tmpl.$(e.currentTarget).val() );
  },
  'change select[name="country"]': function(e, tmpl) {
    e.preventDefault();
    console.log(tmpl.$(e.currentTarget).val());
    pageSession.set( 'country', tmpl.$(e.currentTarget).val() );
  },
  'change select[name="city"]': function(e, tmpl) {
    e.preventDefault();
    console.log(tmpl.$(e.currentTarget).val());
    pageSession.set( 'city', tmpl.$(e.currentTarget).val() );
    let insee = Cities.findOne({insee:tmpl.$(e.currentTarget).val()});
    pageSession.set( 'geoPosLatitude', insee.geo.latitude);
    pageSession.set( 'geoPosLongitude', insee.geo.longitude);
    console.log(insee.geo.latitude);
    console.log(insee.geo.longitude);
  },
  'change input[name="streetAddress"]': function(event,template){

    function addToRequest(request, dataStr){
      if(dataStr == "") return request;
      if(request != "") dataStr = " " + dataStr;
      return transformNominatimUrl(request + dataStr);
    }

    //remplace les espaces par des +
    function transformNominatimUrl(str){
      var res = "";
      for(var i = 0; i<str.length; i++){
        res += (str.charAt(i) == " ") ? "+" : str.charAt(i);
      }
      return res;
    };


    let postalCode = '';
    let country = '';
    let streetAddress = '';
    postalCode = AutoForm.getFieldValue('postalCode');
    country = template.find('select[name="country"]').options[template.find('select[name="country"]').selectedIndex].text;
    console.log(country);
    streetAddress = AutoForm.getFieldValue('streetAddress');

    var request = "";

    request = addToRequest(request, streetAddress);
    request = addToRequest(request, postalCode);
    request = addToRequest(request, country);
    request = transformNominatimUrl(request);
    request = "?q=" + request;


    if(event.currentTarget.value.length>5){
      HTTP.get( 'http://nominatim.openstreetmap.org/search'+request+'&format=json&polygon=0&addressdetails=1', {},
      function( error, response ) {
        if ( error ) {
          console.log( error );
        } else {
          console.log(response.data);
          if (response.data.length > 0) {
            pageSession.set( 'geoPosLatitude', response.data[0].lat);
            pageSession.set( 'geoPosLongitude', response.data[0].lon);
            console.log(response.data[0].lat);
            console.log(response.data[0].lon);
          }

          return;
        }
      }
    );
  }
}
});

AutoForm.addHooks(['addProject', 'editProject'], {
  after: {
    method : function(error, result) {
      if (error) {
        console.log("Insert Error:", error);
      } else {
        //console.log("Insert Result:", result);
        Router.go('listProjects');
      }
    },
    "method-update" : function(error, result) {
      if (error) {
        console.log("Update Error:", error);
      } else {
        //console.log("Update Result:", result);
        Router.go('listProjects');
      }
    }
  },
  onError: function(formType, error) {
    let ref;
    if (error.errorType && error.errorType === 'Meteor.Error') {
       //if ((ref = error.reason) === 'Name must be unique') {
      //this.addStickyValidationError('name', error.reason);
      //AutoForm.validateField(this.formId, 'name');
    //}
  }
  }
});

AutoForm.addHooks(['addProject'], {
  before: {
    method : function(doc, template) {
      return doc;
    }
  }
});
