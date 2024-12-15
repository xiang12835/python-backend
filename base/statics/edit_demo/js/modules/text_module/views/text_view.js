

var TextView = Backbone.View.extend({


    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#text-template').html()),


    initialize: function() {
      
    },

    // Re-render the titles of the todo item.
    render: function() {
      
      var default_title = "标题";

      var _form = "text_form";
      var _id= "module_"+sort_index;
      var text_id="text_"+sort_index;
      var data = {"form":_form,"type":TYPE_TEXT,"id":_id,"sort":sort_index,"text_id":text_id};
      var templates = this.template(data);


      $("#sortable").append(templates);
      this.set_data(text_id,_id);

      formView.init_form(_form);
      formView.change_form(_form);
      formView.move_form($("#"+_id));
      
    },

    set_data: function(text_id,_id){

      /*add to struct*/
      current_index = dataList.len();
      var textCollection = new TextCollection;
      dataList.add(textCollection);
      var nowList = dataList.get_index(current_index)
      nowList.set('text_id',text_id);
      nowList.append_default();
      dataList.init_module(nowList,sort_index,_id,"text");

      sort_index++;
    },

    // Remove the item, destroy the model.
    remove: function() {
      this.model.destroy();
    }

  });
