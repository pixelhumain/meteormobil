Projects = new Meteor.Collection("projects", {idGeneration : 'MONGO'});

/*
private static $dataBinding = array(
    "name" => array("name" => "name", "rules" => array("required")),

    "address" => array("name" => "address"),
    "postalCode" => array("name" => "address.postalCode"),
    "city" => array("name" => "address.codeInsee"),
    "addressCountry" => array("name" => "address.addressCountry"),

    "geo" => array("name" => "geo"),

    "description" => array("name" => "description"),
    "startDate" => array("name" => "startDate", "rules" => array("projectStartDate")),
    "endDate" => array("name" => "endDate", "rules" => array("projectEndDate")),
    "tags" => array("name" => "tags"),
    "url" => array("name" => "url"),
    "licence" => array("name" => "licence"),
    "avancement" => array("name" => "properties.avancement"),
);
*/


var linksProjects = new SimpleSchema({
  events : {
    type: [Object],
    optional:true
  },
  organizer : {
    type: [Object],
    optional:true
  },
  contributors : {
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

Projects.attachSchema(
  new SimpleSchema({
    name : {
      type : String
    },
    description : {
      type : String
    },
    tags : {
      type : [String]
    },
    url : {
      type : String
    },
    licence : {
      type : String
    },
    'properties' : {
      type : Object
    },
    'properties.avancement' : {
      type : String
    },
    type : {
      type : String,
      allowedValues: ['projects']
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
    startDate : {
      type : Date
    },
    endDate : {
      type : Date
    },
    links : {
      type : linksProjects,
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


  Projects.helpers({
    creatorProfile: function () {
      return Citoyens.findOne({_id:new Mongo.ObjectID(this.creator)});
    },
    isCreator () {
      return this.creator === Meteor.userId();
    },
    countContributors () {
      return this.links && this.links.contributors && _.size(this.links.contributors);
    },
    isStart () {
      let start = moment(this.startDate).toDate();
      let now = moment().toDate();
      return moment(start).isBefore(now); // True
    },
    news () {
      return News.find({'scope.projects':{$in:[Router.current().params._id]}},{sort: {"created": -1},limit: Session.get('limit') });
    },
    countNews () {
      return News.find({'scope.projects':{$in:[Router.current().params._id]}}).count();
    },
    new () {
      return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
    }
  });
