
var VBoxView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#v-box-template').html()),

    initialize: function() {
    },

    // Re-render the titles of the todo item.
    render: function() {
      var default_url = "http://picture01-10022394.image.myqcloud.com/1464161582_ac9b213441e4aef25731a8bc8e1dc3bf";
      var default_v_image = "http://picture01-10022394.image.myqcloud.com/1464161848_7b57c2efec8191d29083e9b84aa3ca5a";
      var default_title = "视频标题";
      var default_summary = "腰封";
      var default_subtitle = "副标题";
      var _form = "box_form";
      var _id= "module_"+sort_index;
      var box_id="video_box_"+sort_index;
      var box_name="视频盒子"+sort_index;
      var data = {"form":_form,"type":TYPE_V_BOX,"id":_id,"sort":sort_index,"box_id":box_id,"box_name":box_name};
      var templates = this.template(data);
      var boxItemView = new VBoxItemView;
      $("#sortable").append(templates);
      
      this.setdata(box_id,_id);

      formView.init_form(_form);
      formView.change_form(_form);
      formView.move_form($("#"+_id));
      sort_index++;
    },

    setdata: function(box_id,_id){
      /*add to struct*/
      current_index = dataList.len();
      var boxModel = new VBoxModel;
      dataList.add(boxModel);
      var nowList= dataList.get_index(current_index);
      nowList.set('box_id',box_id);
      nowList.append_default();
      dataList.init_module(nowList,sort_index,_id,"视频盒子");
    },

    // Remove the item, destroy the model.
    remove: function() {
      this.model.destroy();
    }

  });
