var AdvModel = Backbone.Model.extend({
    defaults: {
        type: "adv",
        image_url: "",
        video_link: "",
        url: "",
        title: "",
        item_id: "",
        sort: 0,
        t_id: "",
        i_id: "",
        box_type: "",
        skip_type: "",
        page_name: "",

        detail_form: "dialog-popuser-adv",
        detail_edit_form: "dialog-popuser-adv"
    },

    /***********************************/
    /************PUBLIC Detail****************/
    /**********************************/
    clear_form : function(){
        var form = this.get("detail_form");
        $('#'+form+' #u-url input').val('');
        $('#'+form+' #u-img #adv-screen-success #adv-screen-content').attr('src', '');
    },

    get_form_detail: function() {

        var form = this.get("detail_form");
        var data = {
                box_type: $("#"+form+" #div_for_skip_type select").val(),
                video_link: "",
                url: $("#"+form+"  #u-url input").val(),
                title: $("#"+form+"  #u-title input").val(),
                image_url: $('#'+form+'  #u-img #adv-u-screen-success #adv-u-screen-content').attr('src'),
                v_image: $('#'+form+' #u-img #adv-u-screen-success #adv-u-screen-content').attr('src'),
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

        if (isNull(d.url) && isNull(d.i_id)) {
            return "url或id 不能为空";
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
        $("#"+form+" #div_for_skip_type").show();
        $("#"+form+" #div_for_skip_type select").val(edit_data.get('box_type'));
        $('#'+form+' #u-url input').val(edit_data.get('url'));
        $('#'+form+' #u-id input').val(edit_data.get('t_id'));
        $("#"+form+"  #u-iid input").val(edit_data.get('i_id'));

        console.log(edit_data);

        if (edit_data.get('skip_type')=='url'){
            $("#"+form+" #u-url").show();
        }else if (edit_data.get('skip_type')=='id'){
            $("#"+form+" #u-iid").show();
            $("#"+form+" #u-id").hide();
        }

        $('#'+form+'  #u-img #adv-u-screen-success #adv-u-screen-content').attr('src', edit_data.get('image_url'));
    },

    edit_form_detail: function() {
        var edit_data = this;
        var form = this.get("detail_edit_form");
        edit_data.set('title', $("#"+form+" #title").val());
        edit_data.set('box_type',$("#"+form+" #div_for_skip_type select").val());
        edit_data.set('url', $("#"+form+" #u-url #url").val());
        edit_data.set('t_id', $("#"+form+" #u-id #url").val());
        edit_data.set('image_url', $('#'+form+'  #u-img #adv-u-screen-success #adv-u-screen-content').attr('src'));

        edit_data.set('i_id', $("#"+form+"  #u-iid input").val());
    },

});

var AdvCollection = Backbone.RelationalModel.extend({

    defaults: {
        type: "adv",
        title: "",
        module_sort: 3,
        module_id:"",
        adv_id:"",
        pm_id:'',
        is_initial:false,
        items:[],
        form: "adv_form",
        form_field : ["title"]
    },


    /***********************************/
    /************PUBLIC****************/
    /**********************************/



    add: function(new_data) {
        var _obj = this;
        var _adv_id = _obj.get('adv_id');
        var sort = _obj.get("items").length;
        var is_initial = _obj.get("is_initial");
        if(is_initial){
            this.empty();
        }

        this.add_model(_obj, new_data.title, new_data.video_link,
                    new_data.image_url, sort, new_data.t_id, new_data.box_type,
                new_data.skip_type, new_data.url, new_data.page_name,new_data.i_id);

        this.add_view(_adv_id, new_data.image_url, new_data.title);

        _obj.set('is_initial',false);
    },

    reset: function(_refresh , datas) {

        var _obj = this;
        
        var _adv_id = _obj.get('adv_id');
        var _len = _obj.get("items").length;
        
        this.empty();

        if (_refresh) {
            this.refresh_model(datas);
        }

        var _len = _obj.get("items").length;
        if (_len) {
            for (var i = 0; i < _len; i++) {
                this.add_view(_adv_id, _obj.get("items")[i].get("image_url"), _obj.get("items")[i].get("title"));
            }
            this.set('is_initial',false);
        } else {
            this.append_default();
        }

    },

    append_default: function(){
        var _adv_id = this.get('adv_id');
        this.add_view(_adv_id, "http://picture01-10022394.image.myqcloud.com/1464179201_88b757133689ac02b9bafb12e73a7497", "广告标题");
        this.add_view(_adv_id, "http://picture01-10022394.image.myqcloud.com/1464179201_88b757133689ac02b9bafb12e73a7497", "广告标题");
        this.set('is_initial',true);
    },

    new_item : function() {
        var ball = new AdvModel;
        return ball;
    },

    


    /***********************************/
    /************PRIVATE****************/
    /**********************************/
    
    add_view: function(_adv_id, img_url, title) {
        var advItemView = new AdvItemView;
        $('#' + _adv_id).slick('slickAdd', advItemView.render(title, img_url));
    },

    refresh_model: function(datas){
        var _obj = this;
        dataList.delete_item(_obj, "items");
        
        for (var v in datas) {
            this.add_model(_obj, datas[v].title, datas[v].video_link,
                    datas[v].image_url, v, datas[v].t_id, datas[v].box_type,
                datas[v].skip_type, datas[v].url, datas[v].page_name,datas[v].i_id);
        }
    },

    add_model: function(_obj, title, video_link, image_url, sort, t_id, box_type, skip_type, url, page_name,i_id) {
        var advModel = new AdvModel();
        if (!t_id) {
            t_id = ""
        }
        advModel.set({
            image_url: image_url,
            video_link: video_link,
            url: url,
            title: title,
            item_id: "item_adv_" + sort,
            sort: sort,
            t_id: t_id,
            i_id: i_id,
            box_type: box_type,
            skip_type: skip_type,
            page_name: page_name
        })
        _obj.get("items").push(advModel);
        debug_log(_obj)
    },


    empty: function(){
        var _adv_id = this.get('adv_id');
        var _len = this.get("items").length;

        if (_len == 0) {
            this.empty_adv(_adv_id, 2)
        } else {
            this.empty_adv(_adv_id, _len + 1)
        }
    },

    empty_adv: function (_adv_id, i) {
        for (i; i > 0; i--) {
            $('#' + _adv_id).slick('slickRemove', i - 1);
        }
    }
    
});
