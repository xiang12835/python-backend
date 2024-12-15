/*注册全局事件*/

//type define
var TYPE_HEAD = 0;
var TYPE_CAROUSEL = 1;
var TYPE_BOX = 2;
var TYPE_BOX_TAIL = 21;
var TYPE_ADV = 3;
var TYPE_V_BOX = 4;
var TYPE_BALL = 5;
var TYPE_IMAGE_TEXT = 6;
var TYPE_TEXT = 7;

var TYPE_HEAD_Name = "head";
var TYPE_CAROUSEL_Name = "carousels";
var TYPE_BOX_Name = "box";
var TYPE_BOX_TAIL_Name = "box_tail";
var TYPE_ADV_Name = "adv";
var TYPE_V_BOX_Name = "v_box";
var TYPE_BALL_Name = "ball";
var TYPE_IMAGE_TEXT_Name = 'image_text';
var TYPE_TEXT_Name = "text";

var TYPE_DICK = {
    "head": 0,
    "carousels": 1,
    "box": 2,
    "adv": 3,
    'v_box': 4,
    "ball": 5,
    'image_text': 6,
    'text': 7
};

var sort_index = 1;
var current_index = 0;
var videoList = [];

 $(document).ready(function (){
    $("#title_skip_type").change(function () {
        var st = this.value;
        formView.box_form_change_skip(st, app_id );
    });
    $("#title_skip_button").click(function (){
        var st = $('#title_skip_type').val();
        formView.box_form_change_skip(st, app_id );
    });


    /*******************************/
    /***********跳转类型配置***********/
    /*******************************/
    $("#dialog-popuser-ball #page_skip_button").click(function (){
        videoView.show_page_skip(app_id, 'videoView.choice_page_skip_new', $("#dialog-popuser-ball #skip_type").val());
    });
});


$(document).ready(function () {

    /* register layout*/
    dataList.register_sortable_layout();

    /* register common videoView */
    videoView.listenTypeChangeEvent();
    videoView.listenVideoSortEvent();
    formView.listenTagSortEvent();

    /* load history data*/
    var his_data = $("#history").attr("data-value");
    load_history(eval("(" + his_data + ")"));


    //初始化，主要是设置上传参数，以及事件处理方法(回调函数)
    var img_upload_arr = ['box-u-screen',
                          'ball-u-screen',
                           'adv-u-screen',
                           'vbox-u-screen',
                           'imagetext-u-screen', 
                           'carousel-u-screen',
                           'image-text'];

    for (var index = 0; index < img_upload_arr.length; index++) {
        add_upload_handler(generate_upload_dict(img_upload_arr[index]));
    }

});


/*注册module事件*/
$(document).ready(function () {
    /* 处理轮播图事件 */
    $("#btn_carousel").click(function () {
        formView.do_save();

        var carouselView = new CarouselView;
        carouselView.render();
    });

    /* 处理盒子事件 */
    $("#btn_box").click(function () {
        formView.do_save();

        var boxView = new BoxView;
        boxView.render();
    });
    $("#btn_v_box").click(function () {
        formView.do_save();
        var v_boxView = new VBoxView;
        v_boxView.render();
    });

    /* 处理广告事件 */
    $("#adv_box").click(function () {
        formView.do_save();


        var advView = new AdvView;
        advView.render();
    });

    /* 处理球事件 */
    $("#ball_box").click(function () {
        formView.do_save();

        var ballView = new BallView;
        ballView.render();
    });

    /* 处理图文事件 */
    $("#image_text_box").click(function () {
        formView.do_save();
        var imageTextView = new ImageTextView;
        imageTextView.render();
    });

    $("#text_box").click(function(event) {
        /* Act on the event */
        formView.do_save();
        var textView = new TextView;
        textView.render();
    });


    formView.init_form("title_form");
});

