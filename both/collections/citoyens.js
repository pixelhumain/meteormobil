Citoyens = new Meteor.Collection("citoyens", {idGeneration : 'MONGO'});

GeoCoordinates =new SimpleSchema({
  latitude: {
    type: Number,
    decimal: true
  },
  longitude: {
    type: Number,
    decimal: true
  },
});

PostalAddress =new SimpleSchema({
  addressLocality: {
    type : String,
  },
  codeInsee: {
    type : Number,
  },
  postalCode: {
    type : Number,
    min:5
  }
});

Citoyens.attachSchema(
  new SimpleSchema({
    name : {
      type : String
    },
    email : {
      type : String,
      regEx: SimpleSchema.RegEx.Email,
      unique: true
    },
    pwd : {
      type : String
    },
    address : {
      type : PostalAddress
    },
    geo : {
      type : GeoCoordinates
    },
    created: {
      type: Date,
      autoValue: function() {
        if (this.isInsert) {
          return new Date();
        } else if (this.isUpsert) {
          return {
            $setOnInsert: new Date()
          };
        } else {
          this.unset();
        }
      },
      denyUpdate: true
    }
  }));
