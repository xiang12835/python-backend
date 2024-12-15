

var AdvView = Backbone.View.extend({


    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#adv-template').html()),


    initialize: function() {
      
    },

    // Re-render the titles of the todo item.
    render: function() {
      var default_img_src = "http://picture01-10022394.image.myqcloud.com/1464179201_88b757133689ac02b9bafb12e73a7497";
      var default_title = "广告标题";

      var _form = "adv_form";
      var _id= "module_"+sort_index;
      var adv_id="adv_"+sort_index;
      var data = {"form":_form,"type":TYPE_ADV,"id":_id,"sort":sort_index,"adv_id":adv_id};
      var templates = this.template(data);

      var advItemView = new AdvItemView;

      //console.log(templates);

      $("#sortable").append(templates);
      $('#'+adv_id).slick({
                dots: false,
                autoplay: true,
                autoplaySpeed: 5000,
                infinite: true,
                speed: 700,
                cssEase: 'linear',
                arrows: false
      });
      
      this.set_data(adv_id,_id);

      formView.init_form(_form);
      formView.change_form(_form);
      formView.move_form($("#"+_id));
      
    },

    set_data: function(adv_id,_id){

      /*add to struct*/
      current_index = dataList.len();
      var advCollection = new AdvCollection;
      dataList.add(advCollection);
      var nowList= dataList.get_index(current_index)
      nowList.set('adv_id',adv_id);
      nowList.append_default();
      dataList.init_module(nowList,sort_index,_id,"广告");

      sort_index++;
    },

    // Remove the item, destroy the model.
    remove: function() {
      this.model.destroy();
    }

  });
