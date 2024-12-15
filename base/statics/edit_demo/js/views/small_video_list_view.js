var SmallVideoListView = Backbone.View.extend({

    //... is a list tag.
    tagName: "li",

    // Cache the template function for a single item.
    template: _.template($('#small-video-list-template').html()),

    initialize: function () {
        
    },

    // Re-render the titles of the todo item.
    //argument url,title,_summary,_subtitle
    render: function (_img_url,_sort,_item_id) {
        var data = {
          "img_url":_img_url,
          "sort":_sort,
          "_item_id":_item_id,
      };
        var templates = this.template(data);
        return templates;
    },

    // Remove the item, destroy the model.
    remove: function () {
        this.model.destroy();
    }

});

var SmallBallListView = Backbone.View.extend({

    //... is a list tag.
    tagName: "li",

    // Cache the template function for a single item.
    template: _.template($('#small-ball-list-template').html()),

    initialize: function () {

    },

    // Re-render the titles of the todo item.
    //argument url,title,_summary,_subtitle
    render: function (_img_url,_sort,_item_id) {
        var data = {
          "img_url":_img_url,
          "sort":_sort,
          "_item_id":_item_id,
      };
        var templates = this.template(data);
        return templates;
       
    },

    // Remove the item, destroy the model.
    remove: function () {
        this.model.destroy();
    }

});

var SmallVVideoListView = Backbone.View.extend({
    tagName: "li",

    // Cache the template function for a single item.
    template: _.template($('#small-v-video-list-template').html()),


    initialize: function () {
        
    },

    // Re-render the titles of the todo item.
    //argument url,title,_summary,_subtitle
    render: function (_img_url,_sort,_item_id,_v_image) {
        var data = {
          "img_url":_img_url,
          "sort":_sort,
          "_item_id":_item_id,

          "v_image":_v_image,
      };
        var templates = this.template(data);

        //console.log(templates);

        return templates;
        
    },

    // Remove the item, destroy the model.
    remove: function () {
        this.model.destroy();
    }

});

var TagsListView = Backbone.View.extend({
    
    tagName: "li",

    // Cache the template function for a single item.
    template: _.template($('#tag-skip-list-template').html()),

    initialize: function () {
        
    },

    // Re-render the titles of the todo item.
    //argument url,title,_summary,_subtitle
    render: function () {
        var data = {};
        var templates = this.template(data);

        return templates;
    },

    // Remove the item, destroy the model.
    remove: function () {
        this.model.destroy();
    }

});