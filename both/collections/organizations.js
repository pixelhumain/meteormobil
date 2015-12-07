Organizations = new Meteor.Collection("organizations", {idGeneration : 'MONGO'});

this.Schemas = this.Schemas || {};

this.Schemas.OrganizationsRest = new SimpleSchema({
    organizationName : {
      type : String
    },
    organizationEmail : {
      type : String,
      regEx: SimpleSchema.RegEx.Email
    },
    organizationCountry : {
      type : String,
      allowedValues: Countries_SELECT,
      autoform: {
        type: "select",
        options: Countries_SELECT_LABEL,
      }
    },
    description : {
      type : String
    },
    tagsOrganization : {
      type : [String],
      optional: true
    },
    type : {
      type : String,
      autoform: {
        type: "select",
        options: function () {
          if (Meteor.isClient) {
            let listSelect = Lists.findOne({name:'organisationTypes'});
            if(listSelect && listSelect.list){
              return _.map(listSelect.list,function (value,key) {
                return {label: value, value: key};
              });
            }
          }
        }
      }
    },
    category : {
      type : [String],
      optional: true,
      autoform: {
        type: "select-checkbox",
        options: function () {
          if (Meteor.isClient) {
            let type = '';
            type = AutoForm.getFieldValue('type');
            if(type){
              let slug = type+'Categories'
              console.log(slug);
              let categories = Lists.findOne({name:slug});
              if(categories && categories.list){
                return _.map(categories.list,function (value,key) {
                  return {label: value, value: key};
                });
              }
            }else{return;}
          }
        }
      }
    },
    streetAddress: {
      type : String,
      optional: true
    },
    postalCode: {
      type : String,
      min:5,
      max:9
    },
    city: {
      type : String,
      autoform: {
        type: "select"
      }
    },
    geoPosLatitude: {
      type: Number,
      decimal: true
    },
    geoPosLongitude: {
      type: Number,
      decimal: true
    },
    role: {
      type : String,
      allowedValues: roles_SELECT,
      optional: true,
      autoform: {
        type: "select",
        options: roles_SELECT_LABEL,
      }
    }
  });

this.Schemas.Organizations = new SimpleSchema({
    name : {
      type : String
    },
    email : {
      type : String,
      regEx: SimpleSchema.RegEx.Email
    },
    shortDescription : {
      type : String,
      optional: true,
    },
    description : {
      type : String
    },
    tags : {
      type : [String],
      optional: true
    },
    url : {
      type : String,
      optional: true
    },
    telephone : {
      type : String,
      optional: true
    },
    type : {
      type : String,
      autoform: {
        type: "select",
        options: function () {
          if (Meteor.isClient) {
            let listSelect = Lists.findOne({name:'organisationTypes'});
            if(listSelect && listSelect.list){
              return _.map(listSelect.list,function (value,key) {
                return {label: value, value: key};
              });
            }
          }
        }
      }
    },
    category : {
      type : [String],
      optional: true,
      autoform: {
        type: "select-checkbox",
        options: function () {
          if (Meteor.isClient) {
            let type = '';
            type = AutoForm.getFieldValue('type');
            if(type){
              let slug = type+'Categories'
              console.log(slug);
              let categories = Lists.findOne({name:slug});
              if(categories && categories.list){
                return _.map(categories.list,function (value,key) {
                  return {label: value, value: key};
                });
              }
            }else{return;}
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
      type : GeoPosition,
      optional: true
    },
    /*links : {
      type : linksOrganizations,
      optional:true
    },*/
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
      denyUpdate: true,
      optional: true
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
      denyUpdate: true,
      optional: true
    }
  });

Organizations.attachSchema(
  this.Schemas.Organizations
);

  Organizations.helpers({
    members () {
      //this.links.members
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
