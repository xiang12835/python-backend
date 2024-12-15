var AdvItemView = Backbone.View.extend({


    tagName: "div",

    // Cache the template function for a single item.
    template: _.template($('#adv-item-template').html()),


    initialize: function () {

    },

    // Re-render the titles of the todo item.
    //argument url,title,_summary,_subtitle
    render: function (_title,img_src) {
        var data = {
          "item_title":_title,
          "item_img":img_src
      };
        var templates = this.template(data);

        return templates;
        
    },

    // Remove the item, destroy the model.
    remove: function () {
        this.model.destroy();
    }

});
