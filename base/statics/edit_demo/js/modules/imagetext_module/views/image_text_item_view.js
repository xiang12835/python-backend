var ImageTextItemView = Backbone.View.extend({

    tagName: "div",

    // Cache the template function for a single item.
    template: _.template($('#image-text-item-template').html()),


    initialize: function () {

    },

    // Re-render the titles of the todo item.
    render: function (_url,_title,sub_title,summary) {
        var data = {
          "item_img":_url,
          "item_title":_title,
          "item_sub_title":sub_title,
          "item_summary":summary
      };
        var templates = this.template(data);

        return templates;
    },

    // Remove the item, destroy the model.
    remove: function () {
        this.model.destroy();
    }

});
