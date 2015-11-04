Documents = new Meteor.Collection("documents", {idGeneration : 'MONGO'});

Documents.attachSchema(
  new SimpleSchema({
    id : {
      type : String,
    },
    type : {
      type : String
    },
    collection : {
      type : String
    },
    objId : {
      type : String
    },
    moduleId : {
      type : String
    },
    doctype : {
      type : String
    },
    name : {
      type : String
    },
    contentKey : {
      type : String
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
    },
    author : {
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
    }
}));
