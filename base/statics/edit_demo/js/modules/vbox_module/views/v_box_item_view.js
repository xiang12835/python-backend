var VBoxItemView = Backbone.View.extend({

    tagName: "div",


    template: _.template($('#v-box-item-template').html()),

    initialize: function () {

    },

    // Re-render the titles of the todo item.
    //argument url,title,_summary,_subtitle
    render: function (_url,_title) {
        var img = _url;
        var v_image = arguments[4]?arguments[4]:"";
        img = v_image;
        var data = {
          "item_img":img,
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
