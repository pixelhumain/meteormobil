Organizations = new Meteor.Collection("organizations", {idGeneration : 'MONGO'});

/*
private static $dataBinding = array(
    "name" => array("name" => "name", "rules" => array("required", "organizationSameName")),
    "email" => array("name" => "email", "rules" => array("email")),
    "created" => array("name" => "created"),
    "creator" => array("name" => "creator"),
    "type" => array("name" => "type"),
    "shortDescription" => array("name" => "shortDescription"),
    "description" => array("name" => "description"),
    "address" => array("name" => "address"),
    "streetAddress" => array("name" => "address.streetAddress"),
    "postalCode" => array("name" => "address.postalCode"),
    "city" => array("name" => "address.codeInsee"),
    "addressLocality" => array("name" => "address.addressLocality"),
    "addressCountry" => array("name" => "address.addressCountry"),
    "geo" => array("name" => "geo"),
    "tags" => array("name" => "tags"),
    "typeIntervention" => array("name" => "typeIntervention"),
    "typeOfPublic" => array("name" => "typeOfPublic"),
    "url"=>array("name" => "url"),
    "telephone" => array("name" => "telephone"),
    "video" => array("name" => "video")
);
*/


Organizations.attachSchema(
  new SimpleSchema({
    organizationSameName : {
      type : String
    },
    email : {
      type : String,
      regEx: SimpleSchema.RegEx.Email,
      unique: true
    },
    shortDescription : {
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
    telephone : {
      type : String
    },
    type : {
      type : String,
      allowedValues: ['NGO','LocalBusiness','Group','GovernmentOrganization']
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
    typeIntervention : {
      type : String
    },
    typeOfPublic : {
      type : String
    },
    links : {
      type : linksCitoyensOrganizations,
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

  Organizations.helpers({
    members () {
      //this.links.knows
      if(this && this.links && this.links.members){
        let membersIds = _.map(this.links.members, function(num, key){
          let objectId = new Mongo.ObjectID(key);
          return objectId;
        });
        return Citoyens.find({_id:{$in:membersIds}});
      }
    },
    countMembers () {
      return this.links && this.links.members && _.size(this.links.members);
    },
    memberOf () {
      //this.links.memberOf
      if(this && this.links && this.links.memberOf){
        let memberOfIds = _.map(this.links.memberOf, function(num, key){
          let objectId = new Mongo.ObjectID(key);
          return objectId;
        });
        var inputDate = new Date();
        return Organizations.find({_id:{$in:memberOfIds}});
      }
    },
    countMemberOf () {
      //this.links.memberOf
      if(this && this.links && this.links.memberOf){
        let memberOfIds = _.map(this.links.memberOf, function(num, key){
          let objectId = new Mongo.ObjectID(key);
          return objectId;
        });
        var inputDate = new Date();
        return Organizations.find({_id:{$in:memberOfIds}}).count();
      }
    },
    events () {
      //this.links.events
      if(this && this.links && this.links.events){
        let eventsIds = _.map(this.links.events, function(num, key){
          let objectId = new Mongo.ObjectID(key);
          return objectId;
        });
        var inputDate = new Date();
        return Events.find({_id:{$in:eventsIds},endDate:{$gte:inputDate}});
      }
    },
    countEvents () {
      //this.links.events
      if(this && this.links && this.links.events){
        let eventsIds = _.map(this.links.events, function(num, key){
          let objectId = new Mongo.ObjectID(key);
          return objectId;
        });
        var inputDate = new Date();
        return Events.find({_id:{$in:eventsIds},endDate:{$gte:inputDate}}).count();
      }
    },
    projects () {
      //this.links.projects
      if(this && this.links && this.links.projects){
        let projectsIds = _.map(this.links.projects, function(num, key){
          let objectId = new Mongo.ObjectID(key);
          return objectId;
        });
        var inputDate = new Date();
        return Projects.find({_id:{$in:projectsIds},endDate:{$gte:inputDate}});
      }
    },
    countProjects () {
      //this.links.projects
      if(this && this.links && this.links.projects){
        let projectsIds = _.map(this.links.projects, function(num, key){
          let objectId = new Mongo.ObjectID(key);
          return objectId;
        });
        var inputDate = new Date();
        return Projects.find({_id:{$in:projectsIds},endDate:{$gte:inputDate}}).count();
      }
    },
    creatorProfile: function () {
      return Citoyens.findOne({_id:new Mongo.ObjectID(this.creator)});
    },
    news () {
      return News.find({'scope.organizations':{$in:[Router.current().params._id]}},{sort: {"created": -1},limit: Session.get('limit') });
    },
    countNews () {
      return News.find({'scope.organizations':{$in:[Router.current().params._id]}}).count();
    },
    new () {
      return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
    },
    isCreator () {
      return this.creator === Meteor.userId();
    }
  });
