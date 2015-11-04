Template.newsListEvents.onCreated(function(){
  Session.setDefault('limit', 5);
});

Template.newsListEvents.helpers({
  event: function () {
    return Events.findOne({_id:new Mongo.ObjectID(Router.current().params._id)});
  },
  creatorEvent: function () {
    return Citoyens.findOne({_id:new Mongo.ObjectID(this.creator)});
  },
  news: function () {
    return News.find({'scope.events':{$in:[this._id._str]}},{sort: {"created": -1},limit: Session.get('limit') });
  },
  countNews: function () {
    return News.find({'scope.events':{$in:[this._id._str]}}).count();
  },
  isLimit: function (countNews) {
    return  countNews > Session.get('limit');
  }
});

Template.newsEvent.helpers({
  authorNews: function () {
    return Citoyens.findOne({_id:new Mongo.ObjectID(this.author)});
  },
  docNews: function () {
    return Documents.findOne({id:this._id._str});
  },
  photoNews: function () {
    return Photosimg.find({_id:this.objId});
  }
});


Template.newsFields.helpers({
_name: function () {
  return  TAPi18n.__('news-name');
},
_text: function () {
  return  TAPi18n.__('news-text');
}
});

Template.newsListEvents.events({
  "click .give-me-more": function(evt) {
    let newLimit = Session.get('limit') + 10;
    Session.set('limit', newLimit);
  },
  "click .photo-link": function (event, template) {
    var self = this;
    var options = {
      width: 500,
      height: 500,
      quality: 75
    };
    //MeteorCamera
    MeteoricCamera.getPicture(options,function (error, data) {
      // we have a picture
      if (! error) {

        var str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";
        //console.log(self._id._str);
        Meteor.call("cfsbase64tos3up",data,str,"events",self._id._str, function (error, photoret) {
          if(photoret){

            /*console.log({
            date: new Date(),
            created: new Date(),
            id: Meteor.userId(),
            author: Meteor.userId(),
            type:"events",
            scope:{events:[self._id._str]}
          });*/

          var newsId = News.insert({
            type:"events",
            date: new Date(),
            created: new Date(),
            id: Meteor.userId(),
            author : Meteor.userId(),
            scope:{events:[self._id._str]}
          });

          console.log(newsId)

          /*console.log({
          id:newsId._str, //mettre idnews newsId._str plustot que event self._id._str
          type:"events",
          collection:"cfs.photosimg.filerecord",
          objId:photoret,
          moduleId : "meteor.communecter",
          doctype : "image",
          author : Meteor.userId(),
          "name" : str,
          "contentKey" : "event.news"});*/

          Documents.insert({
            id:newsId._str, //mettre idnews newsId._str plustot que event self._id._str
            type:"events",
            collection:"cfs.photosimg.filerecord",
            objId:photoret,
            author : Meteor.userId(),
            moduleId : "meteor.communecter",
            doctype : "image",
            "name" : str,
            "contentKey" : "event.news"}, function(error, result) {
              if (!error) {
                //Meteor.call('push',selfresult.str);
                console.log('result',result);
                Router.go('newsListEvents', {_id:self._id._str});
              }else{
                console.log('error',error);
              }
            });

          }
        });
      }});

    }
  });


  AutoForm.addHooks(['addNew', 'editNew'], {
    after: {
      insert: function(error, result) {
        if (error) {
          console.log("Insert Error:", error);
        } else {
          console.log("Insert Result:", result);

          var self = this;
          var selfresult=result;
          var eventId=Session.get('eventId');
          var options = {
            width: 500,
            height: 500,
            quality: 75
          };
          //MeteorCamera
          //if (Meteor.isCordova) {
            MeteoricCamera.getPicture(options,function (error, data) {
              // we have a picture
              if (! error) {

                var str = +new Date + Math.floor((Math.random() * 100) + 1) + ".jpg";

                Meteor.call("cfsbase64tos3up",data,str,"events",eventId, function (error, photoret) {
                  if(photoret){
                    console.log('photoret '+photoret);
                    console.log({
                    id:selfresult._str, //mettre idnews newsId._str plustot que event self._id._str
                    type:"events",
                    collection:"cfs.photosimg.filerecord",
                    objId:photoret,
                    moduleId : "meteor.communecter",
                    doctype : "image",
                    author : Meteor.userId(),
                    "name" : str,
                    "contentKey" : "event.news"});

                    Documents.insert({
                      id:selfresult._str, //mettre idnews newsId._str plustot que event self._id._str
                      type:"events",
                      collection:"cfs.photosimg.filerecord",
                      objId:photoret,
                      author : Meteor.userId(),
                      moduleId : "meteor.communecter",
                      doctype : "image",
                      "name" : str,
                      "contentKey" : "event.news"}, function(error, result) {
                        if (!error) {
                          //Meteor.call('push',selfresult.str);
                          console.log('result',result);
                          Router.go('newsListEvents', {_id:eventId});
                        }else{
                          console.log('error',error);
                        }
                      });
                    }
                  });
                }});
              /*}else{
                //Meteor.call('push',selfresult.str);
                Router.go('newsListEvents', {_id:eventId});
              }*/
            }
          },
          update: function(error, result) {
            if (error) {
              console.log("Update Error:", error);
            } else {
              console.log("Update Result:", result);

              Router.go('newsListEvents', {_id: Session.get('eventId')});
            }
          }
        }
      });

      AutoForm.addHooks(['addNew'], {
        before: {
          insert: function(doc, template) {
            console.log(Session.get('eventId'));
            doc.scope = {"events":[Session.get('eventId')]};
            doc.type = "events";
            return doc;
          }
        }
      });
