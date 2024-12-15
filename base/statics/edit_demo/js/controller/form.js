var FormView = Backbone.Model.extend({


    defaults: {
        default_form: "title_form"
    },
    is_delete:0,


    onItemSelect: function (_this) {
        if (this.is_delete==0){
            this.do_save();
        } else{
            this.is_delete = 0;
        }
        var i = 0;
        $('#sortable li[id^="module_"]').each(function (_this) {
            this.setAttribute("data-sort", i + 1);
            var li_data = dataList.get_id(this.getAttribute("id"));
            li_data.set('module_sort', i + 1);
            i++;
        });

        var _id = _this.getAttribute('id');
        var _type = _this.getAttribute('data-type');
        var _form = _this.getAttribute('data-form');
        var _sort = _this.getAttribute('data-sort');
        if (!_sort) {
            _sort = 0;
        }
        if (!_type) {
            _type = 0;
        }

        current_index = _sort;

        var _current_data = dataList.get_index(current_index);

        this.set_current_form(_form);

        //填写视频选择
        this.add_video_list(_form, _current_data);
        this.change_form(_form);
        this.move_form(_this);
    },

    set_current_form: function (_form) {
        var _current_data = dataList.get_index(current_index);

        if (_current_data.get('type')== 'v_box') {
            this.set_tail_button(_form,TYPE_V_BOX);
        }else if (_current_data.get('type')== 'box') {
            this.set_tail_button(_form,TYPE_BOX);
        }

        var form_field = _current_data.get("form_field");
        if(typeof(form_field)=="undefined" || form_field==null ){ 
            form_field = [];
        }

        for(var i=0;i<form_field.length;i++){
            var f = form_field[i];
            var field_tag = "#" + _form + " #"+f;
            $(field_tag).val(_current_data.get(f));
        }

        if(_current_data.get('title_skip_type') == '0'){
            $('#box_form #title_link').show();
            $('#box_form #title_skip_info').hide();
        } else {
            $('#box_form #title_link').hide();
            $('#box_form #title_skip_info').show();
        }


        if (_current_data.has('tags')) {
            var tagsListView = new TagsListView;
            var tags_list = _current_data.get('tags');
            $('#' + _form + ' #s-tags-list .form-tags-list').empty();

            for (var i=0;i<tags_list.length;i++) {
                $('#' + _form + ' #s-tags-list .form-tags-list').append(tagsListView.render());
            }
            var tags_li = $('#' + _form + ' #s-tags-list .form-tags-list li');
            for (var i=0;i<tags_list.length;i++) {
                $(tags_li[i]).find("#tag_title").val(tags_list[i].get('title'));
                $(tags_li[i]).find("#tag_skip_type").val(tags_list[i].get('skip_type'));
                $(tags_li[i]).find("#tag_skip_to_url").val(tags_list[i].get('url'));
                $(tags_li[i]).find("#tag_skip_to_id").val(tags_list[i].get('short_id'));
                $(tags_li[i]).find("#tag_skip_to_name").val(tags_list[i].get('page_name'));
                if(tags_list[i].get('skip_type')!="0"){
                    $(tags_li[i]).find("#tag_skip_to_url").hide();
                    $(tags_li[i]).find("#tag_skip_to_name").show();
                    $(tags_li[i]).find("span").show();
                }
            }
            if (tags_list.length>=3){
                if (!$('#s-tags-list #add_tag_button').hasClass('disabled')){
                    $('#s-tags-list #add_tag_button').addClass('disabled')
                }
            }else{
                if ($('#s-tags-list #add_tag_button').hasClass('disabled')){
                    $('#s-tags-list #add_tag_button').removeClass('disabled')
                }
            }
        }
    },

    set_tail_button: function (_form,_type) {
        if (_type == TYPE_BOX){
            $('#' + _form + ' #tail_button').show()
        } else {
            $('#' + _form + ' #tail_button').hide()
        }

    },

    move_form: function (_this) {
        var pos = $(_this).position();
        $("#app-sidebar").animate({ 'top': pos.top + 'px'}, 200, function () {
        });
    },

    add_video_list: function (_form, _obj) {

        if (!_obj.has('items')) {
            return
        }

        var _now_data;
        _now_data = _obj.get('items');
        var _len = _now_data.length;

        //set current form video list
        var form_list_id = "#" + _form + " #s-video-list .form-video-list";
        var list_id = "#" + _form + " #s-video-list";


        $(form_list_id).empty();
        if (_len > 0) {
            if (_form == "ball_form") {
                var smallListView = new SmallBallListView;
            } else {
                var smallListView = new SmallVideoListView;
            }
            var image_column = 'image_url';
            $(list_id).show();
            for (var i = 0; i < _len; i++) {
                if(_obj.get('type') == 'v_box'){
                    smallListView = new SmallVVideoListView;
                    var list_html = smallListView.render(_now_data[i].get("image_url"), _now_data[i].get("sort"), _now_data[i].get("item_id"), _now_data[i].get("v_image"));
                } else {
                    var list_html = smallListView.render(_now_data[i].get("image_url"), _now_data[i].get("sort"), _now_data[i].get("item_id"))
                }
                $(form_list_id).append(list_html);
            }
            /*显示事件*/
            $(".form-video-list li").hover(function () {
                $(this).find('a.v-list-edit').show();
            }, function () {
                $(this).find('a.v-list-edit').hide();
            })
        } else {
            $(list_id).hide();
        }

        if (_obj.has('tail_items')) {
            _now_data = _obj.get('tail_items');
            _len = _now_data.length;

            //set current form video list
            form_list_id = "#" + _form + " #s-tail-list .form-video-list";
            list_id = "#" + _form + " #s-tail-list";


            $(form_list_id).empty();

            if (_len > 0) {
                var smallListView = new SmallBallListView;

                $(list_id).show()
                for (var i = 0; i < _len; i++) {
                    $(form_list_id).append(
                        smallListView.render(_now_data[i].get("image_url"), _now_data[i].get("sort"), _now_data[i].get("item_id"))
                    )
                }
                /*显示事件*/
                $(".form-video-list li").hover(function () {
                    $(this).find('a.v-list-edit').show();
                }, function () {
                    $(this).find('a.v-list-edit').hide();
                })
            } else {
                $(list_id).hide();
            }
        }
    },

    update_title: function (_id, _title) {
        $('#' + _id + ' [name="title"]').html(_title);
    },

    init_form: function (_form) {
        if ($('#' + _form + ' #title')) {
            $('#' + _form + ' #title').val("")
        }
        if ($('#' + _form + ' #title_link')) {
            $('#' + _form + ' #title_link').val("")
        }

        function clear_form(_form) {
            var form_lis_id = "#" + _form + " #s-video-list .form-video-list";
            $(form_lis_id).empty();
        }

        clear_form(_form);

        function setCurrentFormData(_formView, _form) {

            var _current_data = dataList.get_index(current_index);

            //1.设置标题url
            _formView.set_current_form(_form);

            //2.设置当前module 视频
            _formView.add_video_list(_form, _current_data);
        }

        setCurrentFormData(this, _form);
    },

    change_form: function (change_form_to) {
        /*show form*/

        var form = this.get("default_form");
        $("#" + form).hide();
        $("#" + change_form_to).show();
        this.set({"default_form": change_form_to});
    },

    box_get_skip_list: function (_type, _app_id, _page, _fun_name, _callback_name) {
        _callback_name = arguments[4]?arguments[4]:"";

        var url = "/default/skip/" + _type + "?app_id=" + _app_id + "&page=" + _page +"&fun_name=" + _fun_name;
        $("#dialog-popuser-skip").empty();
        $("#dialog-popuser-skip").load(url);

    },

    add_tag_list: function(_this) {
        var tagsListView = new TagsListView;
        if ($('#s-tags-list .form-tags-list li').length<3){
            $('#s-tags-list .form-tags-list').append(tagsListView.render());
        }
        if ($('#s-tags-list .form-tags-list li').length>=3){
            $(_this).addClass('disabled');
        }
        videoView.get_tags_data()
    },
    del_tag_list: function(_this){
        $(_this).parent().remove();
        if ($('#s-tags-list #add_tag_button').hasClass('disabled')){
            $('#s-tags-list #add_tag_button').removeClass('disabled')
        }
        videoView.get_tags_data()
    },
    tag_skip_type_change: function(_this,_app_id){
        var _type = ""
        var _skip_type = $(_this).val()
        if (_skip_type == '0') {
            $(_this).next().show()
            $(_this).next().next().hide()
            $(_this).next().next().next().next().hide()
        } else {
            $(_this).next().hide()
            $(_this).next().next().show()
            $(_this).next().next().next().next().show()
            if (_skip_type == '1') {
                _type = "page";
            } else if (_skip_type == '2') {
                _type = "article";
            } else if (_skip_type == '3') {
                 _type = "channel";
            }
            if (_type) {
                this.set('choice_tag',_this);
                this.box_get_skip_list(_type, _app_id, 1, 'formView.choice_tags_skip')
                $("#dialog-popuser-skip").dialog({
                    resizable: false,
                    width: 500,
                    height: 350,
                    modal: true,
                    show: {
                        effect: "explode",
                        duration: 300
                    },
                    hide: {
                        effect: "explode",
                        duration: 300
                    }
                });
            }
        }
    },
    tags_list_choice_button: function(_this,_app_id){
        this.tag_skip_type_change($(_this).parent().find('#tag_skip_type'),_app_id);
    },
    choice_tags_skip: function (_short_id, _name) {
        //save _sort_id in skip
        var _this = this.get('choice_tag')
        $(_this).parent().find('#tag_skip_to_name').val(_name);
        $(_this).parent().find('#tag_skip_to_id').val(_short_id);
        $("#dialog-popuser-skip").dialog("close");
        videoView.get_tags_data()
    },

    listenTagSortEvent: function(){
        $(".tags-sortable").sortable({
            stop: function () {
                videoView.get_tags_data()
            }
        });
    },

    box_form_change_skip: function (_skip_type, _app_id) {
        /*change title skip*/
        var _type = ""
        if (_skip_type == '0') {
            $('#box_form #title_link').show();
            $('#box_form #title_skip_info').hide()
        } else {
            $('#box_form #title_link').hide();
            $('#box_form #title_skip_info').show()
            if (_skip_type == '1') {
                _type = "page";
            } else if (_skip_type == '2') {
                _type = "article";
            } else if (_skip_type == '3') {
                 _type = "channel";
            }
            if (_type) {
                this.box_get_skip_list(_type, _app_id, 1, 'formView.choice_title_skip')
                $("#dialog-popuser-skip").dialog({
                    resizable: false,
                    width: 500,
                    height: 350,
                    modal: true,
                    show: {
                        effect: "explode",
                        duration: 300
                    },
                    hide: {
                        effect: "explode",
                        duration: 300
                    }
                });
            }
        }
    },

    choice_title_skip: function (_short_id, _name) {
        //save _sort_id in skip

        $('#box_form #title_skip_name').val(_name);
        $('#box_form #title_skip_to_id').val(_short_id);
        $("#dialog-popuser-skip").dialog("close");
        this.do_save()
    },

    do_save: function () {
        var _change_data = dataList.get_index(current_index);
        var _form = _change_data.get("form");

        //修改数据结构内容
        var form_field = _change_data.get("form_field");

        if(typeof(form_field)=="undefined" || form_field==null ){ 
            form_field = [];
        }

        for(var i=0;i<form_field.length;i++){
            var f = form_field[i];
            var field_tag = "#" + _form + " #"+f;
            _change_data.set(f, $(field_tag).val());
        }

        //*********//
        this.update_title(_change_data.get('module_id'), _change_data.get('title'));
    },

    del_module: function (_i) {
        var r = confirm("确认删除当前模块？");
        if (r == true) {
            var _del_data = dataList.get_index(current_index);

            //1.删除当前module
            var _module = _del_data.get("module_id");
            dataList.get("data").splice(current_index, 1);
            current_index--;
            $("#app-entry #" + _module).remove();
            this.is_delete = 1;

            //3.更新当前下面的一个module
            var next_item_index = current_index;
            var now_data = dataList.get_index(next_item_index);
            var now_module = now_data.get("module_id");
            this.onItemSelect($("#app-entry #" + now_module)[0]);
        }
    }

});

var formView = new FormView;

