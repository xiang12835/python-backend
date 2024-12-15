var VideoView = Backbone.Model.extend({


    defaults: {
        url_field: "#dialog-popuser #div_for_video_type_field #url",
        video_type_field: "#dialog-popuser #skip_type",
        add_video_loading: false,
        last_form: ""
    },

    add_video: function(_i, app_id) {

        var _obj = dataList.get_index(current_index);
        var itemModel = _obj.new_item(); 
        itemModel.clear_form();

        var show_form = itemModel.get("detail_form");
        this.edit_box_type_change(show_form);

        $("#"+show_form).dialog({
            resizable: false,
            width: 700,
            minheight: 300,
            modal: true,
            show: {
                effect: "explode",
                duration: 300
            },
            hide: {
                effect: "explode",
                duration: 300
            },
            buttons: {
                "确定": function () {
                    var data = itemModel.get_form_detail();
                    var error_message = itemModel.validate(data);

                    if(error_message==null){
                        dataList.add_item(data);
                        $("#"+show_form).dialog("close");
                    } else{
                        alert(error_message);
                    }
                },
                "取消": function () {
                    videoList.splice(0, videoList.length);
                    $(this).dialog("close");
                }
            }
        });
    },
    get_tags_data: function () {
        var tags_li = $('#s-tags-list .form-tags-list li')
        var _obj = dataList.get_index(current_index);
        dataList.empty_items(_obj,'tags');

        for (var i=0; i < tags_li.length; i++) {
            var tagsmodel = new TagsModel
            tagsmodel.set({
                type: "box_tags",
                title: $(tags_li[i]).find("#tag_title").val(),
                sort: i,
                skip_type: $(tags_li[i]).find("#tag_skip_type").val(),
                url: $(tags_li[i]).find("#tag_skip_to_url").val(),
                short_id: $(tags_li[i]).find("#tag_skip_to_id").val(),
                page_name: $(tags_li[i]).find("#tag_skip_to_name").val(),
                tag_id: ""
            });
            _obj.get("tags").push(tagsmodel);
        }

    },

    edit_video: function(_this) {
        var _id = _this.getAttribute('id');
        var _obj = dataList.get_index(current_index);
        var _now_data;
        var _now_type;
        if (_id.indexOf("box_tail_") > 0 && _obj.has('tail_items')){
            _now_data = _obj.get('tail_items');
            _now_type = "box_tail";
        }else if (_obj.has('items')) {
            _now_data = _obj.get('items');
            _now_type = "";
        } else {
            return;
        }

        var _len = _now_data.length;
        var edit_data;
        for (var _sort = 0; _sort < _len; _sort++) {
            if (_now_data[_sort].get("item_id") == _id) {
                edit_data = _now_data[_sort];
                break;
            }
        }

        edit_data.fill_form_detail();
        var show_form = edit_data.get("detail_edit_form");
        this.edit_box_type_change(show_form);

        $("#"+show_form).dialog({
            resizable: false,
            width: 700,
            minheight: 300,
            modal: true,
            show: {
                effect: "explode",
                duration: 300
            },
            hide: {
                effect: "explode",
                duration: 300
            },
            buttons: {
                "保存": function () {

                    edit_data.edit_form_detail();
                    var error_message = edit_data.validate(edit_data);
                    if(error_message!=null){
                        alert(error_message);
                        return;
                    }

                    if (_now_type == 'box_tail'){
                        dataList.reset_item(false , _now_data, TYPE_BOX_TAIL);
                    } else {
                        dataList.reset_item(false , _now_data);
                    }

                    $(this).dialog("close");
                },
                "删除": function () {
                    if (_now_type == 'box_tail'){
                        _now_data.splice(_sort, 1);
                        dataList.reset_item(false, _now_data, TYPE_BOX_TAIL);
                    }else{
                        _now_data.splice(_sort, 1);
                        dataList.reset_item(false , _now_data);
                    }
                    $(this).dialog("close");
                }
            }
        });
    },

    show_page_skip: function (_app_id, _fun_name, _type) {
        /*change title skip*/
        if (_type!='url') {
            formView.box_get_skip_list(_type, _app_id, 1, _fun_name);
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
    },

    

    choice_page_skip_new: function (_short_id, _name) {
        $("#dialog-popuser-ball  #u-page #page_name").val(_name);
        $("#dialog-popuser-ball  #u-page #page_id").val(_short_id);
        $("#dialog-popuser-skip").dialog("close");
    },


    showorhideurltext: function() {
        if ($("#dialog-popuser-ball #skip_type").val() == "url") {
            $("#dialog-popuser-ball #skip_url").show();
            $('#dialog-popuser-ball #u-page').hide();
        } else {
            $("#dialog-popuser-edit #skip_url").hide();
            $('#dialog-popuser-ball #u-page').show();
        }
    },

    showorhidepagetext: function() {
        if ($("#dialog-popuser-ball #u-page-type #skip_type").val() == "url") {
            $("#dialog-popuser-ball #u-url").show();
            $("#dialog-popuser-ball #u-page").hide();
        } else {
            $("#dialog-popuser-ball #u-url").hide();
            $("#dialog-popuser-ball #u-page").show();
        }
    },

    edit_box_type_change: function(aselect){
        if($("#"+aselect+" #div_for_skip_type select").val() == "id"){
            $("#"+aselect+" #u-iid").show();
            $("#"+aselect+" #u-url").hide();
        }else if($("#"+aselect+" #div_for_skip_type select").val() == "url"){
            $("#"+aselect+" #u-url").show();
            $("#"+aselect+" #u-iid").hide();
        }
    },

    listenTypeChangeEvent: function(){

        $("#dialog-popuser-ball #u-page-type #skip_type").change(function () {
            videoView.showorhidepagetext();
        });

        /*注册id/url 切换*/
        $("#dialog-popuser-box #div_for_skip_type select").change(function () {
            videoView.edit_box_type_change("dialog-popuser-box");
        });
        $("#dialog-popuser-vbox #div_for_skip_type select").change(function () {
            videoView.edit_box_type_change("dialog-popuser-vbox");
        });
        $("#dialog-popuser-imagetext #div_for_skip_type select").change(function () {
            videoView.edit_box_type_change("dialog-popuser-imagetext");
        });
        $("#dialog-popuser-carousel #div_for_skip_type select").change(function () {
            videoView.edit_box_type_change("dialog-popuser-carousel");
        });

        $("#dialog-popuser-adv #div_for_skip_type select").change(function () {
            videoView.edit_box_type_change("dialog-popuser-adv");
        });
    },

    listenVideoSortEvent: function() {
        $(".vl-sortable").sortable({
            stop: function () {
                var i = 0;
                var _obj = dataList.get_index(current_index);
                if (_obj.has('items')) {
                    var _now_data = _obj.get('items')
                    var _len = _now_data.length
                } else {
                    return
                }
                $(this).find('li[id^="item_"]').each(function (_this) {
                    this.setAttribute("data-sort", i);
                    for (var j = 0; j < _len; j++) {
                        if (_now_data[j].get("item_id") == this.getAttribute("id")) {
                            _now_data[j].set("sort", i);
                            break;
                        }
                    }
                    i++;
                });
                _now_data.sort(function (a, b) {
                    return a.get("sort") - b.get("sort")
                });
                dataList.reset_item(false,_now_data);
                //debug_log(dataList);
            }
        });
    }

});

var videoView = new VideoView;