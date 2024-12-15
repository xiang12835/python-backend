var ImageTextModel = Backbone.RelationalModel.extend({
    defaults: {
        type: "image_text",
        title: "",
        video_link: "",
        url: "",
        image_url: "",
        item_id:"",
        t_id:"",
        i_id:"",
        box_type:"",
        skip_type:"",
        sort: 0,
        page_name: "",
        image_text_id:"",
        description:'default description',
        form :'image_text_form',

        detail_form: "dialog-popuser-imagetext",
        detail_edit_form: "dialog-popuser-imagetext"
    },
    /***********************************/
    /************PUBLIC Detail****************/
    /**********************************/
    clear_form : function(){
        var form = this.get("detail_form");
        $("#"+form+" #title").val('');
        $("#"+form+" #summary").val('');
        $("#"+form+" #subtitle").val('');
        $("#"+form+" #desc").val('');
        $('#'+form+' #u-url input').val('');
        $('#'+form+' #u-id input').val('');

        $($('#'+form+' #u-img #box-u-screen-success #box-u-screen-content')[0]).attr('src', '');

    },

    get_form_detail: function() {

        var form = this.get("detail_form");
        var data = {
                box_type: $("#"+form+" #div_for_skip_type select").val(),
                video_link: "",
                url: $("#"+form+"  #u-url input").val(),
                t_id: $("#"+form+"  #u-id input").val(),
                i_id: $("#"+form+"  #u-iid input").val(),
                title: $("#"+form+"  #u-title input").val(),
                summary: $("#"+form+"  #u-summary input").val(),
                sub_title: $("#"+form+"  #u-subtitle input").val(),
                image_url: $('#'+form+'  #u-img #imagetext-u-screen-success #imagetext-u-screen-content').attr('src'),
                v_image: $('#'+form+' #u-img #imagetext-u-screen-success #imagetext-u-screen-content').attr('src')
        };
        return data;
    },

    validate: function(data) {
        var d = data;
        if("toJSON" in data){
            d = data.toJSON();
        }
        
        if (isNull(d.title)) {
            return "title 不能为空";
        }
        if (isNull(d.image_url)) {
            return "图片 不能为空";
        }
        return null;
    },
    
    fill_form_detail: function() {
        var edit_data = this;
        var form = this.get("detail_edit_form");
        $("#"+form+" #title").val(edit_data.get('title'));
        $('#'+form+' #u-url input').val(edit_data.get('url'));
        $("#"+form+" #u-summary input").val(edit_data.get('summary')),
        $("#"+form+" #u-subtitle input").val(edit_data.get("sub_title")),
        $("#"+form+" #div_for_skip_type").show();
        $("#"+form+" #div_for_skip_type select").val(edit_data.get('box_type'));
        $('#'+form+' #u-url input').val(edit_data.get('url'));
        $('#'+form+' #u-id input').val(edit_data.get('t_id'));
        $("#"+form+"  #u-iid input").val(edit_data.get('i_id'));
        if (edit_data.get('box_type')=='url'){
            $("#"+form+" #u-url").show();
        }else if (edit_data.get('box_type')=='id'){
            $("#"+form+" #u-id").show();
        }
        $('#'+form+'  #u-img #imagetext-u-screen-success #imagetext-u-screen-content').attr('src', edit_data.get('image_url'));
    },

    edit_form_detail: function(edit_data) {
        var edit_data = this;
        var form = this.get("detail_edit_form");
        edit_data.set('title', $("#"+form+" #title").val());
        edit_data.set("summary",$("#"+form+" #u-summary input").val());
        edit_data.set("sub_title",$("#"+form+" #u-subtitle input").val());
        edit_data.set('box_type',$("#"+form+" #div_for_skip_type select").val());
        edit_data.set('url', $("#"+form+" #u-url #url").val());
        edit_data.set('t_id', $("#"+form+" #u-id #url").val());
        edit_data.set('image_url', $('#'+form+'  #u-img #imagetext-u-screen-success #imagetext-u-screen-content').attr('src'));
        edit_data.set('i_id', $("#"+form+"  #u-iid input").val());
    },

});

var ImageTextCollection = Backbone.RelationalModel.extend({

    defaults: {
        type: "image_text",
        title: "",
        module_sort: 1,
        module_id:"",
        image_text_id:"",
        pm_id:'',
        items:[],
        is_initial:false,
        form :'image_text_form',
        form_field : ["title"]
    },

    /***********************************/
    /************PUBLIC****************/
    /**********************************/

    add: function(new_data){
        var _obj = this;
        var _image_text_id = _obj.get('image_text_id');
        var sort = _obj.get("items").length;

        var is_initial = this.get("is_initial");
        if(is_initial){
            this.empty();
        }

        this.add_model(_obj, new_data.title, new_data.video_link,
                new_data.image_url, sort, new_data.t_id, new_data.box_type,
                new_data.skip_type, new_data.url, new_data.page_name,
                new_data.sub_title, new_data.summary);

        this.add_view(_image_text_id,
                    new_data.image_url,new_data.title,
                    new_data.sub_title,new_data.summary);

        this.set("is_initial",false);
    },

   
    reset: function (_refresh , datas) {
        var _obj = this;

        var _image_text_id = _obj.get('image_text_id');
        var _len = _obj.get("items").length;
        this.empty();
        
        if (_refresh) {
            this.refresh_model(datas);
        }

        _len = _obj.get("items").length;
        if (_len) {
            for (var i = 0; i < _len; i++) {
                var item = _obj.get('items')[i];
                this.add_view(_image_text_id,
                    item.get("image_url"),item.get("title"),
                    item.get("sub_title"),item.get("summary"))
            }
            this.set("is_initial",false);
        } else {
            this.append_default();
        }

        
    },

    append_default: function(){
        var _image_text_id = this.get('image_text_id');
        this.add_view(_image_text_id,
                'http://picture01-10022394.image.myqcloud.com/1464161582_ac9b213441e4aef25731a8bc8e1dc3bf',
                '图文-标题', '图文-时长', '图文-描述');
        this.set("is_initial",true);
    },

    new_item : function() {
        var ball = new ImageTextModel;
        return ball;
    },

    

    /***********************************/
    /************PRIVATE****************/
    /**********************************/
    
     refresh_model: function(datas){
        var _obj = this;
        dataList.delete_item(_obj, "items");
        for (var v in datas) {
            this.add_model(_obj, datas[v].title, datas[v].video_link,
                datas[v].image_url, v, datas[v].t_id, datas[v].box_type,
                datas[v].skip_type, datas[v].url, datas[v].page_name,
                datas[v].sub_title, datas[v].summary,datas[v].i_id);
        }
    },


    add_model: function(_obj, title, video_link, image_url, sort, t_id, box_type, skip_type, url, page_name, sub_title, summary,i_id) {
        var imageTextModel = new ImageTextModel();
        if (!t_id) {
            t_id = ""
        }
        imageTextModel.set({
            title: title,
            video_link: video_link,
            url: url,
            image_url: image_url, //"http://picture01-10022394.image.myqcloud.com/1464161582_ac9b213441e4aef25731a8bc8e1dc3bf",
            item_id: "item_image_text_" + sort,
            sort: sort,
            t_id: t_id,
            box_type: box_type,
            skip_type: skip_type,
            page_name: page_name,
            sub_title: sub_title,
            summary: summary,
            i_id:i_id,
        });
        _obj.get("items").push(imageTextModel);
        debug_log(_obj)
    },

    empty: function(){
        var _image_text_id = this.get('image_text_id');
        $('#' + _image_text_id).empty();
    },

    /* view */
    empty_image_text: function (_image_text_id, i) {
        $('#' + _image_text_id + ' .app-image-text').remove();
    },

    add_view: function(_image_text_id, url, title, sub_title, summary) {
        var imageTextItemView = new ImageTextItemView;
        title = sub_byte_string(title, 22);
        sub_title = sub_byte_string(sub_title || '', 66);
        $('#' + _image_text_id).append(imageTextItemView.render(url, title, sub_title, summary));
    }


});

