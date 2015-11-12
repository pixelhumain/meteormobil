GeoCoordinates = new SimpleSchema({
  longitude: {
    type: Number,
    decimal: true
  },
  latitude: {
    type: Number,
    decimal: true
  }
});

GeoPosition = new SimpleSchema({
  type : {
    type : String,
    allowedValues: ['Point']
  },
  coordinates: {
    type: [Number],
    decimal: true
  }
});

PostalAddress = new SimpleSchema({
  addressLocality: {
    type : String,
  },
  streetAddress: {
    type : String,
    optional: true
  },
  addressCountry: {
    type : String,
    optional: true
  },
  codeInsee: {
    type : Number,
  },
  postalCode: {
    type : Number,
    min:5
  }
});

linksCitoyensOrganizations = new SimpleSchema({
  knows : {
    type: [Object],
    optional:true
  },
  memberOf : {
    type: [Object],
    optional:true
  },
  events : {
    type: [Object],
    optional:true
  },
  projects : {
    type: [Object],
    optional:true
  },
  needs : {
    type: [Object],
    optional:true
  }
});
