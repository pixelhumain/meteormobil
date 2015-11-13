//Person
Citoyens = new Meteor.Collection("citoyens", {idGeneration : 'MONGO'});

//Social
var socialNetwork = new SimpleSchema({
  facebook: {
    type : String,
    optional: true
  },
  twitter: {
    type : String,
    optional: true
  },
  github: {
    type : String,
    optional: true
  },
  skype: {
    type : String,
    optional: true
  }
});

//Preferences
var preferencesCitoyen = new SimpleSchema({
  bgClass: {
    type : String,
    optional: true
  },
  bgUrl: {
    type : String,
    optional: true
  }
});

//Roles
var rolesCitoyen = new SimpleSchema({
  tobeactivated: {
    type : Boolean,
    defaultValue:true
  },
  betaTester: {
    type : Boolean,
    defaultValue:false
  },
  standalonePageAccess: {
    type : Boolean,
    defaultValue: true
  },
  superAdmin: {
    type : Boolean,
    defaultValue: false
  }
});

//TODO recuperer l'image du profil pour avatar
//profilImageUrl

Citoyens.attachSchema(
  new SimpleSchema({
    name : {
      type : String
    },
    username : {
      type : String,
      unique: true
    },
    email : {
      type : String,
      regEx: SimpleSchema.RegEx.Email,
      unique: true
    },
    pwd : {
      type : String
    },
    birthDate: {
      type: Date,
      optional: true
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
    socialNetwork : {
      type : socialNetwork,
      optional: true
    },
    shortDescription : {
      type : String,
      optional: true
    },
    telephone: {
      type : String,
      optional: true
    },
    preferences : {
      type : preferencesCitoyen,
      optional: true
    },
    roles : {
      type : rolesCitoyen
    },
    links : {
      type : linksCitoyensOrganizations,
      optional:true
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

  Citoyens.helpers({
    knows () {
      //this.links.knows
      if(this && this.links && this.links.knows){
        let knowsIds = _.map(this.links.knows, function(num, key){
          let objectId = new Mongo.ObjectID(key);
          return objectId;
        });
        return Citoyens.find({_id:{$in:knowsIds}});
      }
    },
    countKnows () {
      if(this && this.links && this.links.knows){
        let knowsIds = _.map(this.links.knows, function(num, key){
          let objectId = new Mongo.ObjectID(key);
          return objectId;
        });
        return Citoyens.find({_id:{$in:knowsIds}}).count();
      }
    },
    knowsOrganizations () {
      //this.links.knows
      if(this && this.links && this.links.knows){
        let knowsIds = _.map(this.links.knows, function(num, key){
          let objectId = new Mongo.ObjectID(key);
          return objectId;
        });
        return Organizations.find({_id:{$in:knowsIds}});
      }
    },
    countKnowsOrganizations () {
      if(this && this.links && this.links.knows){
        let knowsIds = _.map(this.links.knows, function(num, key){
          let objectId = new Mongo.ObjectID(key);
          return objectId;
        });
        return Organizations.find({_id:{$in:knowsIds}}).count();
      }
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
    news () {
      return News.find({'scope.citoyens':{$in:[Router.current().params._id]}},{sort: {"created": -1},limit: Session.get('limit') });
    },
    countNews () {
      return News.find({'scope.citoyens':{$in:[Router.current().params._id]}}).count();
    },
    new () {
      return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
    }
  });
