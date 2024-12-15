var BallModel = Backbone.Model.extend({
    defaults: {
        type: "ball",
        image_url: "",
        video_link: "",
        url: "",
        title: "",
        item_id: "",
        sort: 0,
        t_id: "",
        box_type: "url",
        skip_type: "",
        skip_short_id: "",
        page_name:"",

        detail_form: "dialog-popuser-ball",
        detail_edit_form: "dialog-popuser-ball"
    },

     /***********************************/
    /************PUBLIC Detail****************/
    /**********************************/
    clear_form : function(){
        var form = this.get("detail_form");
        $("#"+form+" #title").val('');
        $('#'+form+' #u-url input').val('');
        $('#'+form+' #u-page #page_id').val('');
        $('#'+form+' #u-page #page_name').val('');
        $('#'+form+' #u-img #ball-u-screen-success #ball-u-screen-content').attr('src', '');

        if ($("#dialog-popuser-ball #u-page-type #skip_type").val() == "url") {
            $("#dialog-popuser-ball #u-url").show();
            $("#dialog-popuser-ball #u-page").hide();
        } else {
            $("#dialog-popuser-ball #u-url").hide();
            $("#dialog-popuser-ball #u-page").show();
        }
    },


    get_form_detail: function() {
        
        var form = this.get("detail_form");
        var data = {
                box_type: $("#"+form+" #skip_type").val(),
                video_link: "",
                url: $("#"+form+"#u-url input").val(),
                title: $("#"+form+" #title").val(),
                image_url: $('#'+form+' #div_for_common_type_field #u-img #ball-u-screen-success #ball-u-screen-content').attr('src'),
                skip_type: $("#"+form+" #skip_type").val(),
                skip_short_id: $("#"+form+" #div_for_common_type_field #u-page #page_id").val(),
                page_name: $("#"+form+" #div_for_common_type_field #u-page #page_name").val()
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
        $('#'+form+' #u-page #page_id').val(edit_data.get('skip_short_id'));
        $('#'+form+' #u-page #page_name').val(edit_data.get('page_name'));
        var page_type = edit_data.get('box_type');

        if (page_type == 'page' || page_type == 'article' || page_type == 'channel' ) {
            $('#'+form+' #u-page').show();
            $('#'+form+' #u-url').hide();
            $('#'+form+' #u-page-type #skip_type').val(edit_data.get('box_type'));
        }else {
            $("#"+form+" #u-page-type #skip_type").val('url');
            $('#'+form+' #u-url').show();
            $('#'+form+' #u-page').hide();
        }

        $('#'+form+' #u-img #ball-u-screen-success #ball-u-screen-content').attr('src', edit_data.get('image_url'));
    },

    edit_form_detail: function() {
        var edit_data = this;
        var form = this.get("detail_edit_form");
        edit_data.set('title', $("#"+form+" #title").val());
        edit_data.set('url', $("#"+form+" #u-url #url").val());
        edit_data.set('skip_short_id', $("#"+form+" #u-page #page_id").val());
        edit_data.set('page_name', $("#"+form+" #u-page #page_name").val());
        edit_data.set('box_type', $("#"+form+" #u-page-type #skip_type").val());

        edit_data.set('image_url', $('#'+ form +' #u-img #ball-u-screen-success #ball-u-screen-content').attr('src'));
    },
});

var BallCollection = Backbone.RelationalModel.extend({

    defaults: {
        type: "ball",
        title: "",
        module_sort: 5,
        module_id: "",
        ball_id: "",
        pm_id: '',
        is_initial:false,
        items: [],
        form: "ball_form",
        form_field : ["title"]
    },

    /***********************************/
    /************PUBLIC****************/
    /**********************************/

    add: function(new_data) {
        /* 新增节点*/

        var _obj = this;
        var _ball_id = _obj.get('ball_id');

        var is_initial = _obj.get("is_initial");
        if(is_initial){
            this.empty();
        }

        var sort = _obj.get('items').length;
        this.add_model(_obj, new_data.title, new_data.video_link,
                new_data.image_url, sort, new_data.t_id, new_data.box_type,
                new_data.skip_type, new_data.skip_short_id, new_data.url,
                new_data.page_name);


        this.add_view(_ball_id, new_data.title, new_data.image_url);

        this.set('is_initial',false);

    },

    reset: function (_refresh,datas) {

        var _obj = this;
        var _ball_id = _obj.get('ball_id');
        this.empty();

        if (_refresh) {
            this.refresh_model(datas);
        }

        var _len = _obj.get("items").length;
        if (_len>=8)_len = 8;
        
        if(_len>0) {
            for (var i = 0; i < _len; i++) {
                var item = _obj.get("items")[i];
                this.add_view(_ball_id, item.get("title"), item.get("image_url"));
            }
            this.set('is_initial',false);
        } else {
            this.append_default();   
        }
        
    },

    append_default: function(){
        var _ball_id = this.get('ball_id');
        
        for (var i = 0; i < 8; i++) {
                this.add_view(_ball_id, "球标题",
                    "http://picture01-10022394.image.myqcloud.com/1464179083_0a8cf2d49cb6554d6ba19a4bd4668765");
            }

        this.set('is_initial',true);
    },

    new_item : function() {
        var ball = new BallModel;
        return ball;
    },

    /***********************************/
    /************PRIVATE****************/
    /**********************************/
    add_view: function (_ball_id, title, img_url) {
        var ballItemView = new BallItemView;
        $('#' + _ball_id).append(ballItemView.render(title,img_url));
    },

    refresh_model: function(datas){
        var _obj = this;
        dataList.delete_item(_obj, "items");
        for (var v in datas) {
            this.add_model(_obj, datas[v].title, datas[v].video_link,
                datas[v].image_url, v, datas[v].t_id, datas[v].box_type,
                datas[v].skip_type, datas[v].skip_short_id, datas[v].url,
                datas[v].page_name);
        }
    },

    empty: function(){
        var _ball_id = this.get('ball_id');
        $('#' + _ball_id).empty();
    },

    add_model: function (_obj, title, video_link, image_url, sort, t_id, box_type, skip_type, skip_short_id, url, page_name) {
        var ballModel = new BallModel();
        if (!t_id) {
            t_id = ""
        }
        ballModel.set({
            image_url: image_url,
            video_link: video_link,
            url: url,
            title: title,
            item_id: "item_ball_" + sort,
            sort: sort,
            t_id: t_id,
            box_type: box_type,
            skip_type: skip_type,
            skip_short_id: skip_short_id,
            page_name: page_name
        })
        _obj.get("items").push(ballModel);
        debug_log(_obj)
    }
    

});

var StatisBallModel = new BallModel;

