var BallView = Backbone.View.extend({


    tagName: "li",

    // Cache the template function for a single item.
    template: _.template($('#ball-template').html()),


    initialize: function () {
        
    },

    // Re-render the titles of the todo item.
    render: function () {
        var default_url_icon = "http://picture01-10022394.image.myqcloud.com/1464179083_0a8cf2d49cb6554d6ba19a4bd4668765";
        var default_title = "球标题";

        var _form = "ball_form";
        var _id = "module_" + sort_index;
        var ball_id = "ball_" + sort_index;
        var data = {"form": _form, "type": TYPE_BALL, "id": _id, "sort": sort_index, "ball_id": ball_id};
        var templates = this.template(data);

        var ballItemView = new BallItemView;
        $("#sortable").append(templates);
        
        
        /*add to struct*/
        this.set_data(ball_id,_id);

        formView.init_form(_form);
        formView.change_form(_form);
        formView.move_form($("#" + _id));

        sort_index++;
    },

    set_data: function(ball_id,_id){
        current_index = dataList.len();
        var ballCollection = new BallCollection;
        dataList.add(ballCollection);
        var nowList = dataList.get_index(current_index)
        nowList.set('ball_id', ball_id);
        nowList.append_default();
        dataList.init_module(nowList, sort_index, _id, "球");
    },

    // Remove the item, destroy the model.
    remove: function () {
        this.model.destroy();
    }

});
