Events = new Meteor.Collection("events", {idGeneration : 'MONGO'});

/*
//From Post/Form name to database field name
private static $dataBinding = array(
"name" => array("name" => "name", "rules" => array("required")),
"type" => array("name" => "type"),
"streetAddress" => array("name" => "address.streetAddress"),
"postalCode" => array("name" => "address.postalCode"),
"city" => array("name" => "address.codeInsee"),
"addressLocality" => array("name" => "address.addressLocality"),
"addressCountry" => array("name" => "address.addressCountry"),
"geo" => array("name" => "geo"),
"description" => array("name" => "description"),
"allDay" => array("name" => "allDay"),
"startDate" => array("name" => "startDate", "rules" => array("eventStartDate")),
"endDate" => array("name" => "endDate", "rules" => array("eventEndDate"))
);
*/

var GeoCoordinates = new SimpleSchema({
  longitude: {
    type: Number,
    decimal: true
  },
  latitude: {
    type: Number,
    decimal: true
  }
});

var GeoPosition = new SimpleSchema({
  type : {
    type : String,
    allowedValues: ['Point']
  },
  coordinates: {
    type: [Number],
    decimal: true
  }
});

var PostalAddress = new SimpleSchema({
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

var linksEvents = new SimpleSchema({
  attendees : {
    type: [Object],
    optional:true
  },
  organizer : {
    type: [Object],
    optional:true
  },
  creator : {
    type: [Object],
    optional:true
  }
});

//pourquoi des fois creator et des fois author ?
//passer le champ created en ISOdate pareil pour startDate et endDate
//quel sont les types ?

Events.attachSchema(
  new SimpleSchema({
    name : {
      type : String
    },
    type : {
      type : String,
      allowedValues: ['events']
    },
    address : {
      type : PostalAddress
    },
    geo : {
      type : GeoCoordinates
    },
    geoPosition : {
      type : GeoPosition
    },
    description : {
      type : String
    },
    allDay : {
      type : Boolean,
      defaultValue:false
    },
    startDate : {
      type : Date
    },
    endDate : {
      type : Date
    },
    links : {
      type : linksEvents,
      optional:true
    },
    creator : {
      type: String,
      autoValue: function() {
        if (this.isInsert) {
          return Meteor.userId();
        } else if (this.isUpsert) {
          return {
            $setOnInsert: Meteor.userId()
          };
        } else {
          this.unset();
        }
      },
      denyUpdate: true
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
