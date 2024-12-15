var TextModel = Backbone.Model.extend({

    defaults: {
        type: "text",
        text: "",
        item_id: "",
        sort: 0,
        t_id: "",
        box_type: "",
        page_name: "",
        detail_form: "dialog-popuser-text",
        detail_edit_form: "dialog-popuser-text"
    },

    /***********************************/
    /************PUBLIC Detail****************/
    /**********************************/
    clear_form : function(){
        var form = this.get("detail_form");
        //$('#'+form+' #u-text textarea').val('');
        var um = UM.getEditor('body_holder');
        var text = um.setContent('');
    },

    get_form_detail: function() {

        var form = this.get("detail_form");
        var um = UM.getEditor('body_holder');
        var text = um.getContent();
        var data = {
            "text": text,
        }
        return data;
    },

    validate: function(data) {
        var d = data;
        if("toJSON" in data){
            d = data.toJSON();
        }

        if (isNull(d.text)) {
            return "text 不能为空";
        }
        return null;
    },

    fill_form_detail: function() {
        var edit_data = this;
        var form = this.get("detail_edit_form");

        var um = UM.getEditor('body_holder');
        um.setContent(edit_data.get('text'));
        //$('#'+form+' #u-text textarea').val(edit_data.get('text'));
    },

    edit_form_detail: function() {
        var edit_data = this;
        var form = this.get("detail_edit_form");
        //var text = $('#'+form+' #u-text textarea').val();
        var um = UM.getEditor('body_holder');
        var text = um.getContent();

        edit_data.set('text', text);
    },

});

var TextCollection = Backbone.RelationalModel.extend({

    defaults: {
        type: "text",
        text: "",
        module_sort: 3,
        module_id:"",
        text_id:"",
        pm_id:'',
        is_initial:false,
        items:[],
        form: "text_form",
        form_field : ["text"]
    },


    /***********************************/
    /************PUBLIC****************/
    /**********************************/



    add: function(new_data) {
        var _obj = this;
        var _text_id = _obj.get('text_id');
        var sort = _obj.get("items").length;
        var is_initial = _obj.get("is_initial");
        if(is_initial){
            this.empty();
        }

        this.add_model(_obj, new_data.text, sort, new_data.t_id, new_data.box_type, new_data.page_name);

        this.add_view(_text_id, new_data.text);
        _obj.set('is_initial',false);
    },

    reset: function(_refresh , datas) {

        var _obj = this;
        
        var _text_id = _obj.get('text_id');
        var _len = _obj.get("items").length;
        
        this.empty();

        if (_refresh) {
            this.refresh_model(datas);
        }

        var _len = _obj.get("items").length;
        if (_len) {
            for (var i = 0; i < _len; i++) {
                this.add_view(_text_id, _obj.get("items")[i].get("text"));
            }
            this.set('is_initial',false);
        } else {
            this.append_default();
        }

    },

    append_default: function(){
        var _text_id = this.get('text_id');
        this.add_view(_text_id, "...");
        this.set('is_initial',true);
    },

    new_item : function() {
        var ball = new TextModel;
        return ball;
    },

    


    /***********************************/
    /************PRIVATE****************/
    /**********************************/
    
    add_view: function(text_id, text) {
        var textItemView = new TextItemView;
        $('#' + text_id).append(textItemView.render(text));
    },

    refresh_model: function(datas){
        var _obj = this;
        dataList.delete_item(_obj, "items");
        
        for (var v in datas) {
            this.add_model(_obj, datas[v].text , v, datas[v].t_id, datas[v].box_type, datas[v].page_name);
        }
    },

    add_model: function(_obj, text, sort, t_id, box_type,  page_name) {

        var textModel = new TextModel();
        if (!t_id) {
            t_id = ""
        }

        textModel.set({
            text: text,
            item_id: "item_text_" + sort,
            sort: sort,
            t_id: t_id,
            box_type: box_type,
            page_name: page_name
        })

        _obj.get("items").push(textModel);
        debug_log(_obj)
    },


    empty: function(){
        var _text_id = this.get('text_id');
        $('#' + _text_id).html('');
    },

});
