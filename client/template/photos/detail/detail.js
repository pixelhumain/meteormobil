
  Template.photoImagedetail.helpers({
  image () {
        return Photosimg.find({_id:this.urlimage});
      }
  	});

    Template.menuAuthor.helpers({
        isAuthor: function() {
            if (this.owner === Meteor.userId()) {
                return true;
            } else {
                return false;
            }
        },
        likesCount: function() {
            if (this.likes && this.likes.length) {
                return this.likes.length;
            }
            return 0;
        }

    });

    Template.menuAuthor.events({
        "click .delete-photo": function(e, t) {
            var photoId = e.currentTarget.id;
            var ok = confirm("Supprimer la photo ?");
            if (ok) {
                Meteor.call('deletePhoto', photoId);
            }
            e.preventDefault();
        },
        "click .like-photo": function(e, t) {
            var photoId = e.currentTarget.id;
            Meteor.call('likePhoto', photoId);
            e.preventDefault();
        }
    });
