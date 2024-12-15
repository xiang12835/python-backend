

var BoxView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#box-template').html()),

    // The DOM events specific to an item.
    // events: {
    //   "click .app-carousel"   : "toggleDone",
    //   "dblclick .view"  : "edit",
    // },

    initialize: function() {
      //this.listenTo(this.model, 'change', this.render);
      //this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the titles of the todo item.
    render: function() {
      var default_url = "http://picture01-10022394.image.myqcloud.com/1464161582_ac9b213441e4aef25731a8bc8e1dc3bf";
      var default_url_icon = "http://picture01-10022394.image.myqcloud.com/1464179083_0a8cf2d49cb6554d6ba19a4bd4668765";
      var default_title = "标题";
      var default_summary = "腰封";
      var default_subtitle = "副标题";
      var default_desc = "尾部推荐说明";
      var _form = "box_form";
      var _id= "module_"+sort_index;
      var box_id="video_box_"+sort_index;
      var box_name="视频盒子"+sort_index;
      var box_tail_id = "box_tail_id_"+sort_index;
      var data = {
          "form":_form,
          "type":TYPE_BOX,
          "id":_id,
          "sort":sort_index,
          "box_id":box_id,
          "box_name":box_name,
          "box_tail_id":box_tail_id
      };
      var templates = this.template(data);
      var boxItemView = new BoxItemView;

      //console.log(templates);

      $("#sortable").append(templates);
      $('#'+box_id).append(boxItemView.render(default_url,default_title,default_summary,default_subtitle));
      $('#'+box_id).append(boxItemView.render(default_url,default_title,default_summary,default_subtitle));

      $('#'+box_tail_id).slick({
            dots: false,
//            autoplay: true,
//            autoplaySpeed: 5000,
            infinite: false,
            arrows:false,
            slidesToShow: 1.5,
            slidesToScroll: 1
      });
      

      /*add to struct*/
      this.setdata(box_id,box_tail_id,_id);

      formView.init_form(_form);
      formView.change_form(_form);
      formView.move_form($("#"+_id));
      sort_index++;
    },

    setdata: function(box_id,box_tail_id,_id){
      current_index = dataList.len();
      var boxModel = new BoxModel;
      dataList.add(boxModel);
      var nowList= dataList.get_index(current_index);
      nowList.set('box_id',box_id);
      nowList.set('box_tail_id',box_tail_id);
      nowList.append_default();
      dataList.init_module(nowList,sort_index,_id,"视频盒子");
    },

    // Remove the item, destroy the model.
    remove: function() {
      this.model.destroy();
    }

  });
