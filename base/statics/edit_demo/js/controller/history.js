

function load_history(_data) {
        try {
            var h_data = _data["data"];
            var _form;
        } catch (e) {
            return
        }

        if (h_data) {
            for (var i = 0; i < h_data.length; i++) {
                var _type = h_data[i]["type"];
                switch (_type) {
                    case TYPE_HEAD_Name:
                        console.log("here head");
                        _form = 'title_form';
                        dataList.get_index(current_index).set("title", h_data[i]["title"]);
                        dataList.get_index(current_index).set("pm_id", h_data[i]["pm_id"]);
                        formView.init_form(_form);
                        break;
                    case TYPE_CAROUSEL_Name:
                        console.log("here c");
                        _form = 'carousel_form';
                        var carouselView = new CarouselView;
                        carouselView.render();
                        dataList.get_index(current_index).set("title", h_data[i]["title"]);
                        dataList.get_index(current_index).set("pm_id", h_data[i]["pm_id"]);
                        var datas = h_data[i]["items"];
                        dataList.reset_item(true , datas);
                        break;
                    case TYPE_BOX_Name:
                        console.log("here box");
                        _form = 'box_form';
                        var boxView = new BoxView;
                        boxView.render();
                        dataList.get_index(current_index).set("title", h_data[i]["title"]);
                        dataList.get_index(current_index).set("title_link", h_data[i]["title_link"]);
                        dataList.get_index(current_index).set("pm_id", h_data[i]["pm_id"]);
                        dataList.get_index(current_index).set("title_skip_type", h_data[i]["title_skip_type"]);
                        dataList.get_index(current_index).set("title_skip_name", h_data[i]["title_skip_name"]);
                        dataList.get_index(current_index).set("title_skip_short_id", h_data[i]["title_skip_short_id"]);
                        for (tag in h_data[i]["tags"]){
                            var tagsmodel = new TagsModel
                            tagsmodel.set(h_data[i]["tags"][tag]);
                            dataList.get_index(current_index).get("tags").push(tagsmodel);
                        }
                        var data_items = h_data[i]["items"];
                        dataList.reset_item(true , data_items);
                        
                        var data_tail_items = h_data[i]["tail_items"];
                        dataList.reset_item(true , data_tail_items, TYPE_BOX_TAIL);
                        break;
                    case TYPE_V_BOX_Name:
                        console.info("here v_box");
                        _form = 'box_form';
                        v_boxView = new VBoxView;
                        v_boxView.render();

                        dataList.get_index(current_index).set("title", h_data[i]["title"]);
                        dataList.get_index(current_index).set("title_link", h_data[i]["title_link"]);
                        dataList.get_index(current_index).set("pm_id", h_data[i]["pm_id"]);
                        dataList.get_index(current_index).set("title_skip_type", h_data[i]["title_skip_type"]);
                        dataList.get_index(current_index).set("title_skip_name", h_data[i]["title_skip_name"]);
                        dataList.get_index(current_index).set("title_skip_short_id", h_data[i]["title_skip_short_id"]);
                        for (tag in h_data[i]["tags"]){
                            var tagsmodel = new TagsModel
                            tagsmodel.set(h_data[i]["tags"][tag]);
                            dataList.get_index(current_index).get("tags").push(tagsmodel);
                        }
                        var datas = h_data[i]["items"];
                        dataList.reset_item(true ,datas);
                        break;
                    case TYPE_ADV_Name:
                        console.log("here adv");
                        _form = 'adv_form';
                        var advView = new AdvView;
                        advView.render();
                        dataList.get_index(current_index).set("title", h_data[i]["title"]);
                        dataList.get_index(current_index).set("pm_id", h_data[i]["pm_id"]);
                        var datas = h_data[i]["items"];
                        dataList.reset_item(true , datas);
                        break;
                    case TYPE_BALL_Name:
                        console.log("here ball");
                        _form = 'ball_form';
                        var ballView = new BallView;
                        ballView.render();
                        dataList.get_index(current_index).set("title", h_data[i]["title"]);
                        dataList.get_index(current_index).set("pm_id", h_data[i]["pm_id"]);
                        var datas =  h_data[i]["items"];
                        dataList.reset_item(true, datas);
                        break;
                    case TYPE_IMAGE_TEXT_Name:
                        console.log("here image_text");
                        _form = 'image_text_form';
                        var imageTextView = new ImageTextView;
                        imageTextView.render();
                        dataList.get_index(current_index).set("title", h_data[i]["title"]);
                        dataList.get_index(current_index).set("pm_id", h_data[i]["pm_id"]);
                        var datas = h_data[i]["items"];
                        dataList.reset_item(true , datas);
                        break;
                    case TYPE_TEXT_Name:
                        console.log("here image_text");
                        _form = 'text_form';
                        var textView = new TextView;
                        textView.render();
                        dataList.get_index(current_index).set("title", h_data[i]["title"]);
                        dataList.get_index(current_index).set("pm_id", h_data[i]["pm_id"]);
                        var datas = h_data[i]["items"];
                        //alert(data);
                        dataList.reset_item(true , datas);
                        break;
                    default:
                        break;
                }

                formView.init_form(_form);
                formView.do_save(TYPE_DICK[dataList.get_index(current_index).get("type")]);
                
            }
        }
}
