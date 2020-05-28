var timeliner_callback = {
    /*
    * 开始
    * */
    start(id) {
        let value = $('#' + id + ' .timeline .node1 div').html();

        //priceTrend.addFeature(value)
    },
    /*
    * 每次经过按钮进行的操作
    * */
    newslide(id, slide) {
        let value = ($(".node_active>.tooltip").attr("value"))
        priceTrend.addFeature(value,false)
    },
    /*
    * 结束
    * */
    end(id) {
        let value = ($(".node_active>.tooltip").attr("value"))
    },
    /*
    * 暂停
    * */
    paused(id, slide) {
        let value = ($(".node_active>.tooltip").attr("value"))
    },
    /*
    * 继续
    * */
    resumed(id, slide) {
        let value = ($(".node_active>.tooltip").attr("value"))
    },
    /*
    * 点击
    * */
    click(id, slide) {
        let value = ($(".node_active>.tooltip").attr("value"))
        priceTrend.addFeature(value,true)
    }
}
var timeliner_operation = {
    _this:null,
    activenode:null,
    start: null,
    stop: null
}