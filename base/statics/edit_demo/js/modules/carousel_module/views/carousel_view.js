

var CarouselView = Backbone.View.extend({


    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#carousel-template').html()),


    initialize: function() {
      
    },

    // Re-render the titles of the todo item.
    render: function() {
      var default_url = "http://picture01-10022394.image.myqcloud.com/1464161582_ac9b213441e4aef25731a8bc8e1dc3bf";
      var default_title = "轮播图"
      var _form = "carousel_form";
      var _id= "module_"+sort_index;
      var carousel_id="carousel_"+sort_index;
      var carousulItemView = new CarousulItemView;

      var data = {
          "form":_form,
          "type":TYPE_CAROUSEL,
          "id":_id,
          "sort":sort_index,
          "carousel_id":carousel_id
      };
      var templates = this.template(data);

      //console.log(templates);

      $("#sortable").append(templates);
      $('#'+carousel_id).slick({
                dots: true,
                autoplay: true,
                autoplaySpeed: 5000,
                infinite: true,
                speed: 700,
                cssEase: 'linear',
                arrows: false
      });
      
      this.setdata(carousel_id,_id);

      formView.init_form(_form)
      formView.change_form(_form);
      formView.move_form($("#"+_id));
      sort_index++;
    },

    setdata: function(carousel_id,_id){
      current_index = dataList.len();
      /*add to struct*/
      var icollection = new CarouselCollection;
      dataList.add(icollection);
      var nowList= dataList.get_index(current_index);
      nowList.set('carousel_id',carousel_id);
      nowList.append_default();

      dataList.init_module(nowList,sort_index,_id,"轮播图");
    },

    // Remove the item, destroy the model.
    remove: function() {
      this.model.destroy();
    }

  });
