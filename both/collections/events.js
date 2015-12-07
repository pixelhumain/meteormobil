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


var linksEvents = new SimpleSchema({
  events : {
    type: [Object],
    optional:true
  },
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
  },
  needs : {
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
      autoform: {
        type: "select",
        options: function () {
          if (Meteor.isClient) {
            let listSelect = Lists.findOne({name:'eventTypes'});
            if(listSelect && listSelect.list){
              return _.map(listSelect.list,function (value,key) {
                return {label: value, value: key};
              });
            }
          }
        }
      }
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

  Events.helpers({
    creatorProfile: function () {
      return Citoyens.findOne({_id:new Mongo.ObjectID(this.creator)});
    },
    isCreator () {
      return this.creator === Meteor.userId();
    },
    countAttendees () {
      return this.links && this.links.attendees && _.size(this.links.attendees);
    },
    isStart () {
      let start = moment(this.startDate).toDate();
      let now = moment().toDate();
      return moment(start).isBefore(now); // True
    },
    news () {
      return News.find({'scope.events':{$in:[Router.current().params._id]}},{sort: {"created": -1},limit: Session.get('limit') });
    },
    countNews () {
      return News.find({'scope.events':{$in:[Router.current().params._id]}}).count();
    },
    new () {
      return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
    }
  });
