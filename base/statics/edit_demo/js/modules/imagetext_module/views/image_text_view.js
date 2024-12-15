var ImageTextView = Backbone.View.extend({

    //... is a list tag.
    tagName: "li",

    // Cache the template function for a single item.
    template: _.template($('#image-text-template').html()),

    // The DOM events specific to an item.
    // events: {
    //   "click .app-carousel"   : "toggleDone",
    //   "dblclick .view"  : "edit",
    // },

    initialize: function () {
        //this.listenTo(this.model, 'change', this.render);
        //this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the titles of the todo item.
    render: function () {
        var default_image = 'http://picture01-10022394.image.myqcloud.com/1464161582_ac9b213441e4aef25731a8bc8e1dc3bf';
        var default_title = '图文标题';
        var default_subtitle = '子标题';
        var default_summary = '说明';
        var _form = "image_text_form";
        var _id = "module_" + sort_index;
        var image_text_id = "image_text_" + sort_index;
        var imageTextItemView = new ImageTextItemView;


        var data = {
            "form": _form,
            "type": TYPE_IMAGE_TEXT,
            "id": _id,
            "sort": sort_index,
            "image_text_id": image_text_id,
            'image': default_image,
            'title': default_title
        };
        var templates = this.template(data);

        $("#sortable").append(templates);
        $('#'+image_text_id).append(imageTextItemView.render(default_image,default_title,default_subtitle,default_summary));

        this.setdata(image_text_id,_id);
        
        formView.init_form(_form);
        formView.change_form(_form);
        formView.move_form($("#"+_id));
        sort_index++;
    },

    setdata:function(image_text_id,_id){
        current_index = dataList.len();
        /*add to struct*/
        var icollection = new ImageTextCollection;
        dataList.add(icollection);
        var nowList = dataList.get_index(current_index);
        nowList.set('image_text_id', image_text_id);
        nowList.append_default();
        dataList.init_module(nowList, sort_index, _id, "图文");
    },

    // Remove the item, destroy the model.
    remove: function () {
        this.model.destroy();
    }

});
