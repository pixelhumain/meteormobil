News = new Meteor.Collection("news", {idGeneration : 'MONGO'});

//quel sont les types ?

News.attachSchema(
  new SimpleSchema({
    name : {
      type : String,
      optional: true
    },
    text : {
      type : String,
      optional: true
    },
    date: {
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
    id : {
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
    },
    type : {
      type: String,
      allowedValues: ['events']
    },
    tags : {
      type: [String],
      optional: true
    },
    likes : {
      type: [String],
      optional: true
    },
    scope : {
      type: Object
    },
    "scope.events" : {
      type: [String]
    }
})
);
