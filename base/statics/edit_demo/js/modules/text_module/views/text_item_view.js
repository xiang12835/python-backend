var TextItemView = Backbone.View.extend({


    tagName: "div",

    // Cache the template function for a single item.
    template: _.template($('#text-item-template').html()),


    initialize: function () {

    },

    // Re-render the titles of the todo item.
    //argument url,title,_summary,_subtitle
    render: function (text) {

    
        var data = {
          "item_text":text.replace(/\n/g,""),
        };

        var templates = this.template(data);
        return templates;
        
    },

    // Remove the item, destroy the model.
    remove: function () {
        this.model.destroy();
    }

});
