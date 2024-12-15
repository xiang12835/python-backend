var CarouselModel = Backbone.RelationalModel.extend({
    defaults: {
        type: "carousel",
        title: "",
        video_link: "",
        url: "",
        image_url: "",
        item_id: "",
        t_id: "",
        i_id: "",
        box_type: "",
        skip_type: "",
        sort: 0,
        page_name: "",

        detail_form: "dialog-popuser-carousel",
        detail_edit_form: "dialog-popuser-carousel"
    },

    /***********************************/
    /************PUBLIC Detail****************/
    /**********************************/
    clear_form : function(){
        var form = this.get("detail_form");
        $("#"+form+" #title").val('');
        $('#'+form+' #u-url input').val('');
        $('#'+form+' #u-id input').val('');
        $($('#'+form+' #u-img #carousel-u-screen-success #carousel-u-screen-content')[0]).attr('src', '');

    },

    get_form_detail: function() {

        var form = this.get("detail_form");
        var data = {
                box_type: $("#"+form+" #div_for_skip_type select").val(),
                video_link: "",
                url: $("#"+form+"  #u-url input").val(),
                title: $("#"+form+"  #u-title input").val(),
                image_url: $('#'+form+'  #u-img #carousel-u-screen-success #carousel-u-screen-content').attr('src'),
                v_image: $('#'+form+' #u-img #carousel-u-screen-success #carousel-u-screen-content').attr('src'),
                t_id: $("#"+form+"  #u-id input").val(),
                i_id: $("#"+form+"  #u-iid input").val(),
        };
        return data;
    },

    validate: function(data) {
        var d = data;
        if("toJSON" in data){
            d = data.toJSON();
        }
        
        // if (isNull(d.title)) {
        //     return "title 不能为空";
        // }
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
        $("#"+form+" #div_for_skip_type").show();
        $("#"+form+" #div_for_skip_type select").val(edit_data.get('box_type'));
        $('#'+form+' #u-url input').val(edit_data.get('url'));
        $('#'+form+' #u-id input').val(edit_data.get('t_id'));
        $("#"+form+"  #u-iid input").val(edit_data.get('i_id'));

        if (edit_data.get('box_type')=='url'){
            $("#"+form+" #u-url").show();
        }else if (edit_data.get('box_type')=='id'){
            $("#"+form+" #u-iid").show();
            $("#"+form+" #u-id").hide();
        }

        $('#'+form+'  #u-img #carousel-u-screen-success #carousel-u-screen-content').attr('src', edit_data.get('image_url'));
    },

    edit_form_detail: function() {
        var edit_data = this;
        var form = this.get("detail_edit_form");
        edit_data.set('title', $("#"+form+" #title").val());
        edit_data.set('box_type',$("#"+form+" #div_for_skip_type select").val());
        edit_data.set('url', $("#"+form+" #u-url #url").val());
        edit_data.set('t_id', $("#"+form+" #u-id #url").val());
        edit_data.set('image_url', $('#'+form+'  #u-img #carousel-u-screen-success #carousel-u-screen-content').attr('src'));
        edit_data.set('i_id', $("#"+form+"  #u-iid input").val());

    },

});

var CarouselCollection = Backbone.RelationalModel.extend({

    defaults: {
        type: "carousels",
        title: "",
        module_sort: 1,
        module_id: "",
        carousel_id: "",
        pm_id: '',
        items: [],
        is_initial:false,
        form: 'carousel_form',
        form_field : ["title"]
    },

    /***********************************/
    /************PUBLIC****************/
    /**********************************/

    add: function(new_data){
        var _obj = this;
        var _carousel_id = _obj.get('carousel_id');
        var sort = _obj.get("items").length;
        var is_initial = this.get("is_initial");

        if(is_initial){
            this.empty();
        }

        this.add_model(_obj, new_data.title, new_data.video_link, new_data.image_url,
                sort, new_data.t_id, new_data.i_id, new_data.box_type,
                new_data.skip_type, new_data.url, new_data.page_name);

        this.add_view(_carousel_id, new_data.image_url, new_data.title);
        this.set("is_initial",false);
    },


    reset: function (_refresh,datas) {
        var _obj = this;

        var _carousel_id = _obj.get('carousel_id');
        var _len = _obj.get("items").length;
        this.empty();

        if (_refresh) {
            this.refresh_model(datas);
        }

        _len = _obj.get("items").length;
        if (_len) {
            for (var i = 0; i < _len; i++) {
                this.add_view(_carousel_id, _obj.get("items")[i].get("image_url"), _obj.get("items")[i].get("title"))
            }
            this.set("is_initial",false);
        } else {
            this.append_default();   
        }

    },

    append_default: function(){
        var _carousel_id = this.get('carousel_id');
        this.add_view(_carousel_id, "http://picture01-10022394.image.myqcloud.com/1464161582_ac9b213441e4aef25731a8bc8e1dc3bf", "轮播图");
        this.add_view(_carousel_id, "http://picture01-10022394.image.myqcloud.com/1464161582_ac9b213441e4aef25731a8bc8e1dc3bf", "轮播图");
        this.set("is_initial",true);
    },

    new_item : function() {
        var ball = new CarouselModel;
        return ball;
    },

    
    /***********************************/
    /************PRIVATE****************/
    /**********************************/

    add_model: function (_obj, title, video_link, image_url, sort, t_id, i_id, box_type, skip_type, url, page_name) {
        var carouselModel = new CarouselModel();
        if (!t_id) {
            t_id = ""
        }
        if (!i_id) {
            i_id = ""
        }
        carouselModel.set({
            title: title,
            video_link: video_link,
            url: url,
            image_url: image_url,//"http://picture01-10022394.image.myqcloud.com/1464161582_ac9b213441e4aef25731a8bc8e1dc3bf",
            item_id: "item_carousel_" + sort,
            sort: sort,
            t_id: t_id,
            i_id: i_id,
            box_type: box_type,
            skip_type: skip_type,
            page_name: page_name
        })
        _obj.get("items").push(carouselModel);
        debug_log(_obj)
    },

    refresh_model:function(datas) {
        var _obj = this;
        dataList.delete_item(_obj, "items");
        for (var v in datas) {
            this.add_model(_obj, datas[v].title, datas[v].video_link, datas[v].image_url,
                v, datas[v].t_id, datas[v].i_id, datas[v].box_type,
                datas[v].skip_type, datas[v].url, datas[v].page_name);
        }
    },

    empty: function(){
        var _carousel_id = this.get('carousel_id');
        var _len = this.get("items").length;
        if (_len == 0) {
            this.empty_carousel(_carousel_id, 2)
        } else {
            this.empty_carousel(_carousel_id, _len + 1)
        }
    },

    /* view */
    empty_carousel: function (_carousel_id, i) {
        for (i; i > 0; i--) {
            $('#' + _carousel_id).slick('slickRemove', i - 1);
        }
    },

    add_view: function (_carousel_id, url, title) {
        var carousulItemView = new CarousulItemView;
        $('#' + _carousel_id).slick('slickAdd', carousulItemView.render(url, title));
    }

    


});

