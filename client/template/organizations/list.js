pageSession = new ReactiveDict('pageOrganizations');

Template.listOrganizations.helpers({
  citoyen () {
    return Citoyens.findOne({_id:new Mongo.ObjectID(Meteor.userId())});
  }
});

Template.organizationsAdd.onCreated(function () {
  pageSession.set( 'postalCode', null);
  pageSession.set( 'organizationCountry', null);
  pageSession.set('city', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);
});

Template.organizationsEdit.onCreated(function () {
  pageSession.set( 'postalCode', null);
  pageSession.set( 'organizationCountry', null);
  pageSession.set('city', null);
  pageSession.set('geoPosLatitude', null);
  pageSession.set('geoPosLongitude', null);
});

Template.organizationsAdd.helpers({

});

Template.organizationsEdit.helpers({
  organization () {
    let organization = Organizations.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
    let organizationEdit = {};
    organizationEdit._id = organization._id._str;
    organizationEdit.organizationName = organization.name;
    organizationEdit.organizationEmail = organization.email;
    organizationEdit.description = organization.description;
    organizationEdit.type = organization.type;
    organizationEdit.category = organization.category;
    organizationEdit.organizationCountry = organization.address.addressCountry;
    organizationEdit.postalCode = organization.address.postalCode;
    organizationEdit.city = organization.address.codeInsee;
    if(organization && organization.address && organization.address.streetAddress){
    organizationEdit.streetAddress = organization.address.streetAddress;
    }
    organizationEdit.geoPosLatitude = organization.geo.latitude;
    organizationEdit.geoPosLongitude = organization.geo.longitude;
    return organizationEdit;
  }
});



Template.organizationsFields.helpers({
  optionsInsee () {
    let postalCode = '';
    let organizationCountry = '';
    postalCode = pageSession.get('postalCode') || AutoForm.getFieldValue('postalCode');
    organizationCountry = pageSession.get('organizationCountry') || AutoForm.getFieldValue('organizationCountry');
    if(postalCode && organizationCountry){
      let insee = Cities.find({cp:postalCode,country:organizationCountry});
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


Template.organizationsFields.onRendered(function() {
  var self = this;
  self.autorun(function() {
    let postalCode = pageSession.get('postalCode')  || AutoForm.getFieldValue('postalCode');
    let organizationCountry = pageSession.get('organizationCountry')  || AutoForm.getFieldValue('organizationCountry');
      console.log(`${postalCode} ${organizationCountry}`);
    console.log('recompute');
    if (!!postalCode) {
      self.subscribe('cities',postalCode,organizationCountry);
    }
  });
});

Template.organizationsFields.events({
  'keyup input[name="postalCode"],change input[name="postalCode"]': function(e, tmpl) {
    e.preventDefault();
    pageSession.set( 'postalCode', tmpl.$(e.currentTarget).val() );
  },
  'change select[name="organizationCountry"]': function(e, tmpl) {
    e.preventDefault();
    console.log(tmpl.$(e.currentTarget).val());
    pageSession.set( 'organizationCountry', tmpl.$(e.currentTarget).val() );
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
    let organizationCountry = '';
    let streetAddress = '';
    postalCode = AutoForm.getFieldValue('postalCode');
    organizationCountry = template.find('select[name="organizationCountry"]').options[template.find('select[name="organizationCountry"]').selectedIndex].text;
    console.log(organizationCountry);
    streetAddress = AutoForm.getFieldValue('streetAddress');

    var request = "";

    request = addToRequest(request, streetAddress);
    request = addToRequest(request, postalCode);
    request = addToRequest(request, organizationCountry);
    request = transformNominatimUrl(request);

    if(event.currentTarget.value.length>5){
      /*HTTP.get( 'http://nominatim.openstreetmap.org/search?q='+request+'&format=json&polygon=0&addressdetails=1', {},
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
    );*/
    ///+Meteor.settings.public.googlekey
    HTTP.get( 'https://maps.googleapis.com/maps/api/geocode/json?address=' + request + '&key='+Meteor.settings.public.googlekey, {},
    function( error, response ) {
      if ( error ) {
        console.log( error );
      } else {
        console.log(response.data);
        if (response.data.results.length > 0 && response.data.status != "ZERO_RESULTS") {
          pageSession.set( 'geoPosLatitude', response.data.results[0].geometry.location.lat);
          pageSession.set( 'geoPosLongitude', response.data.results[0].geometry.location.lng);
          console.log(response.data.results[0].geometry.location.lat);
          console.log(response.data.results[0].geometry.location.lng);
        }
        return;
      }
    }
  );
  }
}
});

AutoForm.addHooks(['addOrganization', 'editOrganization'], {
  after: {
    method : function(error, result) {
      if (error) {
        console.log("Insert Error:", error);
      } else {
        //console.log("Insert Result:", result);
        Router.go('listOrganizations');
      }
    },
    "method-update" : function(error, result) {
      if (error) {
        console.log("Update Error:", error);
      } else {
        //console.log("Update Result:", result);
        Router.go('listOrganizations');
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

AutoForm.addHooks(['addOrganization'], {
  before: {
    method : function(doc, template) {
      return doc;
    }
  }
});
