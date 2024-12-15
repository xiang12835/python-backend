var BoxItemView = Backbone.View.extend({

    //... is a list tag.
    tagName: "div",

    // Cache the template function for a single item.
    template: _.template($('#box-item-template').html()),



    initialize: function () {
        
    },

    // Re-render the titles of the todo item.
    //argument url,title,_summary,_subtitle
    render: function (_url,_title) {
        var data = {
          "item_img":_url,
          "item_title":_title,
          "item_summary":arguments[2]?arguments[2]:" ",
          "item_subtitle":arguments[3]?arguments[3]:" "
      };
        var templates = this.template(data);


        return templates;
    },

    // Remove the item, destroy the model.
    remove: function () {
        this.model.destroy();
    }

});
