Projects = new Meteor.Collection("projects", {idGeneration : 'MONGO'});

/*
newProject.name = $(".form-project .project-name ").val(),
			//newProject.url = $('.form-project .project-url').val(),
			//newProject.version = $(".form-project .project-version").val(),
			//newProject.licence = $(".form-project .project-licence").val(),
			newProject.startDate=startDateSubmitProj,
			newProject.endDate=endDateSubmitProj,
			newProject.city=$(".form-project #city").val(),
			newProject.postalCode=$(".form-project #postalCode").val(),
			newProject.description=$(".form-project .project-description").val(),
			newProject.geoPosLatitude = $(".form-project #geoPosLatitude").val(),
			newProject.geoPosLongitude = $(".form-project #geoPosLongitude").val(),
			newProject.tags = $(".form-project #tagsProject").val();
*/

this.Schemas = this.Schemas || {};

this.Schemas.ProjectsRest =   new SimpleSchema({
    name : {
      type : String
    },
    description : {
      type : String
    },
    tags : {
      type : [String],
      optional:true
    },
    startDate : {
      type : Date,
      optional:true
    },
    endDate : {
      type : Date,
      optional:true
    },
    country : {
      type : String,
      allowedValues: Countries_SELECT,
      autoform: {
        type: "select",
        options: Countries_SELECT_LABEL,
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
    }
  });


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

this.Schemas.Projects =   new SimpleSchema({
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
  });

  Projects.attachSchema(
    this.Schemas.Projects
  );


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
