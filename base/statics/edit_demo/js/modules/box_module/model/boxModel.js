
var VideoModel = Backbone.RelationalModel.extend({
    defaults: {
        type: "video",
        summary: "",
        image_url: "",
        url: "",
        title: "",
        video_link: "",
        sub_title: "",
        item_id: "",
        t_id: "",
        i_id:"",
        box_type: "",
        skip_type: "",
        sort: 0,
        page_name: "",

        detail_form: "dialog-popuser-box",
        detail_edit_form: "dialog-popuser-box"
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
                image_url: $('#'+form+'  #u-img #box-u-screen-success #box-u-screen-content').attr('src'),
                v_image: $('#'+form+' #u-img #box-u-screen-success #box-u-screen-content').attr('src')
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
            return "url 不能为空";
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
        $('#'+form+'  #u-img #box-u-screen-success #box-u-screen-content').attr('src', edit_data.get('image_url'));
    },

    edit_form_detail: function() {
        var edit_data = this;

        var form = this.get("detail_edit_form");
        edit_data.set('title', $("#"+form+" #title").val());
        edit_data.set("summary",$("#"+form+" #u-summary input").val());
        edit_data.set("sub_title",$("#"+form+" #u-subtitle input").val());
        edit_data.set('box_type',$("#"+form+" #div_for_skip_type select").val());
        edit_data.set('url', $("#"+form+" #u-url #url").val());
        edit_data.set('t_id', $("#"+form+" #u-id #url").val());
        edit_data.set('image_url', $('#'+form+'  #u-img #box-u-screen-success #box-u-screen-content').attr('src'));
        edit_data.set('i_id', $("#"+form+"  #u-iid input").val());
    }    

});

var TailModel = Backbone.RelationalModel.extend({
    defaults: {
        type: "box_tail",
        image_url: "",
        url: "",
        desc: "",
        title: "",
        item_id: "",
        video_link: "",
        t_id: "",
        box_type: "url",
        skip_type: "",
        sort: 0,
        page_name: ""
    }
});

var TagsModel = Backbone.RelationalModel.extend({
    defaults: {
        type: "box_tag",
        title: "",
        sort: 0,
        skip_type: 0,
        short_id: "",
        page_name: "",
        tag_id:""
    }
});

var BoxModel = Backbone.RelationalModel.extend({

    defaults: {
        type: "box",
        title: "",
        title_link: "",
        module_sort: 2,
        module_id: "",
        box_id: "",
        box_tail_id: "",
        pm_id: '',
        title_skip_type: 0,
        title_skip_short_id: "",
        title_skip_name: "",
        tags: [],
        items: [],
        tail_items: [],
        is_initial:false,
        form: "box_form",
        form_field : ["title","title_link","title_skip_type","title_skip_short_id","title_skip_name"]

    },

    initialize: function(options){
        this.set('items',[]);
        this.set('tail_items',[]);
        this.set('tags',[]);
    },

    /***********************************/
    /************PUBLIC****************/
    /**********************************/

    add: function(new_data){
        var _obj = this;
        
        if (new_data.box_tail != true) {
            var _box_id = _obj.get('box_id');
            var is_initial = _obj.get("is_initial");
            if(is_initial){
                $('#' + _box_id).empty();
            }

            var sort = _obj.get("items").length;;
            this.add_box_item(_obj, new_data.title, new_data.summary, new_data.sub_title, new_data.video_link,
                    new_data.image_url, sort, new_data.t_id, new_data.i_id, new_data.box_type,
                    new_data.skip_type, new_data.url, new_data.page_name);

            this.add_box(_box_id, new_data.image_url,
                            new_data.title,
                            new_data.summary,
                            new_data.sub_title);
            this.set("is_initial",false);
        } else {
            var _box_id = _obj.get('box_tail_id');
            var sort = _obj.get("tail_items").length;
            this.add_tail_box_item(_obj, new_data.title, new_data.desc, new_data.video_link,
                new_data.image_url, sort, new_data.t_id, new_data.box_type,
                new_data.skip_type, new_data.url, new_data.page_name);


            this.add_box_tail(_box_id,
                    new_data.image_url,
                    new_data.title,
                    new_data.desc);
        }
    },


    reset: function (_refresh,datas) {
        var _obj = this;
        var tail = arguments[2] ? arguments[2] : 0;
        if (tail == TYPE_BOX_TAIL) {

            var _box_id = _obj.get('box_tail_id');
            var _len = _obj.get("tail_items").length;
            if (_len == 0) {
                this.empty_box_tail(_box_id, 1)
            } else {
                this.empty_box_tail(_box_id, _len + 1)
            }
            
            if (_refresh) {
                this.refresh_tail(datas);
            }

            var len = _obj.get("tail_items").length;
            for (var i = 0; i < len; i++) {
                var item = _obj.get("tail_items")[i];
                this.add_box_tail(_box_id,
                    item.get("image_url"),
                    item.get("title"),
                    item.get("desc"));
            }
            
        } else {
            var _box_id = _obj.get('box_id');

            $('#' + _box_id).empty();
            if (_refresh) {
                this.refresh_item(datas);
            }
            var len = _obj.get("items").length;
            if (len > 0) {
                for (var i = 0; i < len; i++) {

                    var item = _obj.get("items")[i];
                    this.add_box(_box_id, item.get("image_url"),
                        item.get("title"),
                        item.get("summary"),
                        item.get("sub_title"));
                }
                this.set("is_initial",false);
            } else {
                this.append_default();
            }
        }
    },

    append_default: function(){
        var _box_id = this.get('box_id');
        this.add_box(_box_id, "http://picture01-10022394.image.myqcloud.com/1464161582_ac9b213441e4aef25731a8bc8e1dc3bf", "视频标题", "腰封", "副标题");
        this.add_box(_box_id, "http://picture01-10022394.image.myqcloud.com/1464161582_ac9b213441e4aef25731a8bc8e1dc3bf", "视频标题", "腰封", "副标题");
        this.set('is_initial',true);
    },

    new_item : function() {
        var ball = new VideoModel;
        return ball;
    },


    /***********************************/
    /************PRIVATE****************/
    /**********************************/

    add_box: function (box_id, url, title, summary, subtitle) {
        var boxItemView = new BoxItemView;
        $('#' + box_id).append(boxItemView.render(url, title, summary, subtitle));
    },

    add_box_tail: function (box_id, icon, title, desc) {
        var boxTailItemView = new BoxTailItemView;
        $('#' + box_id).slick('slickAdd', boxTailItemView.render(icon, title, desc));
    },

    refresh_tail:function(datas){
        var _obj = this;
        dataList.delete_item(_obj, "tail_items");
        for (var v in datas) {
            this.add_tail_box_item(_obj, datas[v].title, datas[v].desc, datas[v].video_link,
                datas[v].image_url, v, datas[v].t_id, datas[v].box_type,
                datas[v].skip_type, datas[v].url, datas[v].page_name);
        }
    },

    refresh_item:function(datas){
        var _obj = this;
        dataList.delete_item(_obj, "items");
        for (var v in datas) {
            this.add_box_item(_obj, datas[v].title, datas[v].summary, datas[v].sub_title, datas[v].video_link,
                datas[v].image_url, v, datas[v].t_id, datas[v].i_id, datas[v].box_type,
                datas[v].skip_type, datas[v].url, datas[v].page_name);
        }
    },


    add_box_item: function (_obj, title, summary, sub_title, video_link, image_url, sort, t_id, i_id, box_type, skip_type, url, page_name) {
        var boxVideoModel = new VideoModel();
        if (!t_id) {
            t_id = "";
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
            page_name: page_name
        })
        _obj.get("items").push(boxVideoModel);
    },

    add_tail_box_item: function (_obj, title, desc, video_link, image_url, sort, t_id, box_type, skip_type, url, page_name) {
        var _boxTailModel = new TailModel();
        if (!t_id) {
            t_id = "";
        }

        _boxTailModel.set({
            image_url: image_url,
            video_link: video_link,
            url: url,
            title: title,
            desc: desc,
            item_id: "item_box_tail_" + sort,
            sort: sort,
            t_id: t_id,
            box_type: box_type,
            skip_type: skip_type,
            page_name: page_name
        });
        _obj.get("tail_items").push(_boxTailModel);
    },

    empty_box_tail: function (_box_id, i) {
        for (i; i > 0; i--) {
            $('#' + _box_id).slick('slickRemove', i - 1);
        }
    }

    

});


var StatisBoxModel = new BoxModel;



