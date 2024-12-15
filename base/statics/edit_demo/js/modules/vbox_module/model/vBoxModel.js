
var VVideoModel = Backbone.RelationalModel.extend({
    defaults: {
        type: "video",
        summary: "",
        image_url: "",
        url: "",
        title: "",
        video_link:"",
        sub_title: "",
        item_id:"",
        t_id:"",
        i_id:"",
        box_type:"",
        skip_type:"",
        sort: 0,
        v_image:"",
        page_name: "",

        detail_form: "dialog-popuser-vbox",
        detail_edit_form: "dialog-popuser-vbox"
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

        $($('#'+form+' #u-img #vbox-u-screen-success #vbox-u-screen-content')[0]).attr('src', '');

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
                image_url: $('#'+form+'  #u-img #vbox-u-screen-success #vbox-u-screen-content').attr('src'),
                v_image: $('#'+form+' #u-img #vbox-u-screen-success #vbox-u-screen-content').attr('src')
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
        if (isNull(d.v_image)) {
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
        $('#'+form+'  #u-img #vbox-u-screen-success #vbox-u-screen-content').attr('src', edit_data.get('image_url'));
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
        edit_data.set('image_url', $('#'+form+'  #u-img #vbox-u-screen-success #vbox-u-screen-content').attr('src'));
        edit_data.set('v_image', $('#'+form+'  #u-img #vbox-u-screen-success #vbox-u-screen-content').attr('src'));
        edit_data.set('i_id', $("#"+form+"  #u-iid input").val());
    },

});


var VBoxModel = Backbone.RelationalModel.extend({

    defaults: {
        type: "v_box",
        title: "",
        title_link: "",
        module_sort: 2,
        module_id:"",
        box_id:"",
        pm_id:'',
        title_skip_type:0,
        title_skip_short_id:"",
        title_skip_name:"",
        tags:[],
        items:[],
        tail_items:[],
        is_initial:false,
        form: "box_form",
        form_field : ["title","title_link","title_skip_type","title_skip_short_id","title_skip_name"]
    },

    initialize: function(options){
        this.set('items',[]);
        this.set('tail_items',[]);
        this.set('tags',[]);
    },


    add_view: function(box_id, url, title, summary, subtitle, v_image) {
        
        var boxItemView = new VBoxItemView;
        $('#' + box_id).append(boxItemView.render(url, title, summary, subtitle, v_image, 4));
        
    },

    /***********************************/
    /************PUBLIC****************/
    /**********************************/

    add: function(new_data){
        var _obj = this;
        var _box_id = _obj.get('box_id');
        var sort = _obj.get("items").length;

        var is_initial = this.get("is_initial");
        if(is_initial){
            this.empty();
        }

        this.add_model(_obj, new_data.title, new_data.summary, new_data.sub_title,
                    new_data.video_link, new_data.image_url, sort, new_data.t_id,new_data.i_id,
                    new_data.box_type, new_data.skip_type
                    , new_data.url, new_data.image_url, new_data.page_name);

        this.add_view(_box_id, new_data.image_url,
                                         new_data.title,
                                         new_data.summary,
                                         new_data.sub_title,
                                         new_data.v_image);

        this.set("is_initial",false);
    },

    
    reset: function(_refresh,datas) {
        var _obj = this;

        var _box_id = _obj.get('box_id');
        this.empty();
        if (_refresh) {
            this.refresh_model(datas);
        }

        var len = _obj.get("items").length;
        if (len>0) {
            for (var i = 0; i < len; i++) {

                var item = _obj.get("items")[i];
                this.add_view(_box_id, item.get("image_url"),
                                         item.get("title"),
                                         item.get("summary"),
                                         item.get("sub_title"),
                                         item.get("v_image")
                );
            }
            this.set("is_initial",false);
        } else {
            this.append_default();
        }

    },


    append_default: function(){
        var _box_id = this.get('box_id');
        var default_h_image = "http://picture01-10022394.image.myqcloud.com/1464161582_ac9b213441e4aef25731a8bc8e1dc3bf";
        var default_v_image = 'http://r1.ykimg.com/050D000055E6685B67BC3C6B8508231A';
        this.add_view(_box_id, default_h_image, "视频标题", "腰封", "副标题", default_v_image);
        this.add_view(_box_id, default_h_image, "视频标题", "腰封", "副标题", default_v_image);
        this.set("is_initial",true);
    },

    new_item : function() {
        var ball = new VVideoModel;
        return ball;
    },


    /***********************************/
    /************PRIVATE****************/
    /**********************************/

    refresh_model: function(datas){
        var _obj = this;
        dataList.delete_item(_obj, "items");
            for (var v in datas) {
                this.add_model(_obj, datas[v].title, datas[v].summary, datas[v].sub_title,
                    datas[v].video_link, datas[v].image_url, v, datas[v].t_id,datas[v].i_id,
                    datas[v].box_type, datas[v].skip_type
                    , datas[v].url, datas[v].image_url, datas[v].page_name);
            }
    },


    add_model: function(_obj, title, summary, sub_title, video_link, image_url, sort, t_id, i_id, box_type, skip_type, url, v_image, page_name) {
        var boxVideoModel = new VVideoModel();
        if (!t_id) {
            t_id = ""
        }
        if (!i_id) {
            i_id = ""
        }

        boxVideoModel.set({
            summary: summary,
            image_url: image_url,
            video_link: video_link,
            url: url,
            title: title,
            sub_title: sub_title,
            item_id: "item_box_" + sort,
            sort: sort,
            t_id: t_id,
            i_id: i_id,
            box_type: box_type,
            skip_type: skip_type,
            v_image: v_image,
            page_name: page_name
        });
        _obj.get("items").push(boxVideoModel);
    },

    empty: function(){
        var _box_id = this.get('box_id');
        $('#' + _box_id).empty();
    }

    
});


var StatisVBoxModel = new VBoxModel;
