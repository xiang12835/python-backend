/* model
 * 参数说明
  * type 类型
  * title\title_link\
  * pm_id  page_module_id
  * xxx_id 某个模块id
  * module_sort: 排序,
  * module_id: html的id,
  * */

var HeadModel = Backbone.Model.extend({
    defaults: {
        type: "head",
        title: "微页面标题",
        module_sort: 0,
        module_id:'module_0',
        pm_id:'',
        form: 'title_form',
        form_field : ["title"]
    }
});


var DataStructList = Backbone.Model.extend({
    defaults: {
        data: []
    },

    add: function (obj) {
        this.get("data").push(obj);
    },
    get_index: function (i) {
        return this.get("data")[i];
    },
    get_id: function (_id) {
        var now_data = this.get("data");
        for(var i=0;i<this.len(0);i++ ){
            if( now_data[i].get("module_id")==_id){
                return now_data[i]
            }
        }
    },
    len: function () {
        return this.get("data").length;
    },
    my_sort: function(){
        this.get("data").sort(function(a,b){
            return a.get('module_sort')- b.get('module_sort')
        })
    },
    remove_index: function(i) {
        for(var j=0;j<this.len(0);j++){
            var d = this.get("data").shift();
            if(j!=i){
                this.get("data").push(d);
            }
        }
    },

    register_sortable_layout : function(){

        $(document).ready(function () {
            $("#sortable").sortable({
                stop: function (event, ui) {
                    var i = 0;
                    $('#sortable li[id^="module_"]').each(function (_this) {
                        this.setAttribute("data-sort", i + 1);
                        var li_data = dataList.get_id(this.getAttribute("id"));
                        li_data.set('module_sort', i + 1);
                        i++;
                    });
                    dataList.my_sort();
                    formView.onItemSelect(ui.item[0]);
                }
            });

        });
    },

    init_module: function(obj,_sort,_id,_name){
        obj.set('module_sort',_sort);
        obj.set('module_id',_id);
        obj.set('items',[]);
        obj.set('title',_name+_sort);
        debug_log(dataList)
    },
    empty_items: function(obj,items){
        var _len = obj.get(items).length
        for (var i = 0; i <= _len; i++){
            obj.get(items).pop();
        }
    },

    update_id: function(_re) {
        if (_re["status"] == "success") {
            var _data = _re["data"];
            for (var i = 0; i < _data.length; i++) {
                var _module = _data[i]["module_id"];
                var _d = dataList.get_id(_module);
                _d.set("pm_id", _data[i]["pm_id"]);
                var _items;
                if (_data[i]["items"]) {
                    _items = _data[i]["items"];
                    for (var j = 0; j < _items.length; j++) {
                        _d.get("items")[j].set(_items[j]);
                    }
                }
                if (_data[i]["tail_items"]) {
                    _items = _data[i]["tail_items"];
                    for (j = 0; j < _items.length; j++) {
                        _d.get("tail_items")[j].set(_items[j]);
                    }
                }
            }
        }
    },

    save: function (surl,page_id,async_flag) {
        var local_url = arguments[3]?arguments[3]:""
        $.ajax({
            type: "post",
            url: surl,
            data: {result: JSON.stringify(this.toJSON()), page_id: page_id},
            async: async_flag,
            success: function (msg) {

                var _re = eval("(" + msg + ")");
                dataList.update_id(_re);
                if (local_url){
                    window.location = local_url;
                }
            },
            error: function (xhr) {
                console.log(xhr);
                alert("请求异常，请重新上传");
            }
        });
    },

    add_item: function(new_data) {
        var currentModel = dataList.get_index(current_index);
        currentModel.add(new_data);
        formView.add_video_list(currentModel.get("form"), currentModel);
    },


    reset_item: function(_refresh, datas,_i) {
        var currentModel = dataList.get_index(current_index);
        currentModel.reset(_refresh , datas ,_i);
        formView.add_video_list(currentModel.get("form"), currentModel);
    },

    delete_item: function(_obj, _type) {
            while (_obj.get(_type).length) {
                _obj.get(_type).pop(_obj.get(_type).length);
            }
    }
});


function debug_log(obj) {
    console.log(JSON.stringify(obj.toJSON(), null, 4));
}



var defaultHead = new HeadModel;
var dataList = new DataStructList;
dataList.add(defaultHead);




