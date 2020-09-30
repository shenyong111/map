var map = null;
var mapView = null;
var layers = {};
var symbol = null;
var oldSymbol = null;
var showLayer = null;
var oldGraphic = null;
function init() {

    symbol = {type: "simple-line",color: [0,169,41,0],outline: {color: [255,252,0],width: 3}};
    oldSymbol = {type: "simple-line",color: [0,169,41,0],outline: {color: [0, 190, 76,0],width: 3}};
    
    var webTileLayer = new esri.layers.WebTileLayer({
        urlTemplate: "http://gissvc4an.cindata.cn/arcgis/rest/services/comm/ChinaBlack/MapServer/tile/{level}/{row}/{col}",
        tileInfo: new esri.layers.support.TileInfo(gxdTileInfo)
    });
    var baseMap = new esri.Basemap({
        baseLayers: [webTileLayer],
        title: "企业地图",
        id: "baseMap"
    });
    map = new esri.Map({ basemap: baseMap });
    mapView = new esri.views.MapView({ container: "gxdMap", map: map, zoom: 11, center: [126.63618132,45.75971535] });
    mapView.ui.remove("attribution");
    mapView.ui.move("zoom","bottom-left");
    mapView.popup.actions = [];
    mapView.popup.dockOptions.buttonEnabled = false;
    cityIds.forEach(function(item,i){
        layers[item] = new esri.layers.FeatureLayer(serverUrl.replace("XXXX",item));
        if(i>0){
            layers[item].visible = false;
        }
        map.layers.add(layers[item]);
    });
    showLayer = new esri.layers.GraphicsLayer();
    map.layers.add(showLayer);
    esri.core.WatchUtils.whenFalse(mapView, 'stationary', function(evt){
        esri.core.WatchUtils.whenTrueOnce(mapView, 'stationary', function(evt){
            queryRealTime();
        });
    });
    mapView.on("pointer-move", function(event){
        mapView.hitTest(event)
            .then(function(response){
                pointerMove(response);
            });
    });
}

function queryRealTime() {
    var ex= mapView.extent;
    if (ex == undefined) {
        return;
    }
    console.log("地图级别："+mapView.zoom);
    if(mapView.zoom>8){
        var x1 =ex.xmin;
        var x2 =ex.xmax;
        var y1 =ex.ymin;
        var y2 =ex.ymax;
        var p1 = getPointByCoords(x1, y1);
        var p2 = getPointByCoords(x1, y2);
        var p3 = getPointByCoords(x2, y2);
        var p4 = getPointByCoords(x2, y1);
        var gon = new esri.geometry.Polygon(mapView.spatialReference);
        gon.addRing([p1, p2, p3, p4, p1]);
        //判断是否缩放，如果是清空标注
        $(".popuid").remove();
        var geo84 = JSON.stringify(GPS.mercator_decrypt_range(gon.rings[0]));
        queryDataByShape("precinct","8","gr",geo84,1000,1,600,18);
    }else{
        showLayer.removeAll();
    }
    
}

function queryDataByShape(mark,condition,gtType,geometry,distance,
        page,pageSize,level){
    $.ajax({
        type: "post",
        url : 'http://lbs.cindata.cn/gxdyun/geom/queryDataByGeometry',
        data : {mark:mark,condition:condition,
                gtType:gtType,geometry:geometry,distance:distance,
                page:page,pageSize:pageSize,level:level,geoType:"arcgis"},
        success : function(resultData){
            queryDataByShapeCallBack(resultData,condition);
        }
    });
}

function queryDataByShapeCallBack(response,condition){
    var time = new Date().getTime()+"";
    if(response.status==200&&response.data.length>0){
        for(var i=0;i<response.data.length;i++){
            var item = response.data[i];
            item.mark = condition;
            var graphic = new esri.Graphic({geometry:item.geometry,symbol:oldSymbol,attributes:item});
            addShowGraphic(showLayer,time,graphic);
        }
    }
    clearShowGraphic(showLayer,time);
}

function addShowGraphic(layer,time,marker){
    var isExist = false;
    var graphics = layer.graphics;
    for(var i=0;i<graphics.items.length;i++){
        var mk = graphics.items[i];
        if(mk.attributes.addressId==marker.attributes.addressId){
            isExist = true;
            mk.attributes.time = time;
            return false;
        }
    }
    if(!isExist){
        marker.attributes.time = time;
        layer.add(marker);
    }
}

function clearShowGraphic(layer,time){
    var graphics = layer.graphics;
    for(var i=0;i<graphics.items.length;i++){
        var mk = graphics.items[i];
        if(time!=mk.attributes.time){
            layer.remove(mk);
        }
    }
}

function pointerMove(response){
    try{
        var graphic = response.results.filter(function (result) {
            return (result.graphic.attributes);
        })[0].graphic;
        showLabel(graphic,response.screenPoint);
    }catch(e){
        showLayer.removeAll();
        $(".popuid").remove();
    }
}

function showLabel(graphic,screenPoint) {
    var $popuid = $(".popuid");
    if($popuid.length>0){
        if($popuid.attr("addressId")==graphic.attributes.OBJECTID){
            return;
        }
    }
    showLayer.removeAll();
    $(".popuid").remove();
    var graphic = new esri.Graphic({ geometry: graphic.geometry, symbol: symbol, attributes: graphic.attributes });
    showLayer.add(graphic);
    var $label = $(".label-tail").clone();
    var picMLength = calcStringPixelsCount("房价："+graphic.attributes.Contour+"元/㎡","14px")+40;
    var MonDiv=document.createElement("div");
    MonDiv.setAttribute('class',"popuid");
    MonDiv.setAttribute('addressId',graphic.attributes.OBJECTID);
    MonDiv.style.left=screenPoint.x-(picMLength/2)-8+"px";
    MonDiv.style.top=screenPoint.y-40+"px";
    dojo.style(MonDiv, "width", picMLength+"px");
    MonDiv.style.zIndex = 100;
    $label.css("left",(picMLength/2)-8);
    MonDiv.innerHTML="<span class='label'>房价：<label style='color:red;'>"+graphic.attributes.Contour+"</label>元/㎡</span>"+$label.prop("outerHTML");
    $("#div_main_top").append(MonDiv);
}

function citySelectCallback(area,result){
    for(var key in layers){    
        layers[key].visible = false;
    } 
    if(layers[area.zoneNumber.substr(0,4)]){
        layers[area.zoneNumber.substr(0,4)].visible = true;
    }else{
        layers[area.zoneNumber.substr(0,4)] = new esri.layers.FeatureLayer(serverUrl.replace("XXXX",area.zoneNumber.substr(0,4)));
        map.layers.add(layers[area.zoneNumber.substr(0,4)]);
    }
    var obj = new esri.geometry.Extent(eval("(" + result.range + ")"));
    mapView.goTo({target: obj}, {duration:1})
        .then(function(){
            mapView.zoom+=1;
        });
}

var gxdTileInfo = {
    "rows": 256,
    "cols": 256,
    "dpi": 96,
    "format": "PNG32",
    "compressionQuality": 0,
    "origin": {
        "x": -20037700,
        "y": 30241100
    },
    "spatialReference": {
        "wkid": 102113,
        "latestWkid": 3785
    },
    "lods": [{
            "level": 0,
            "resolution": 156543.03392800014,
            "scale": 5.91657527591555E8
        },
        {
            "level": 1,
            "resolution": 78271.51696399994,
            "scale": 2.95828763795777E8
        },
        {
            "level": 2,
            "resolution": 39135.75848200009,
            "scale": 1.47914381897889E8
        },
        {
            "level": 3,
            "resolution": 19567.87924099992,
            "scale": 7.3957190948944E7
        },
        {
            "level": 4,
            "resolution": 9783.93962049996,
            "scale": 3.6978595474472E7
        },
        {
            "level": 5,
            "resolution": 4891.96981024998,
            "scale": 1.8489297737236E7
        },
        {
            "level": 6,
            "resolution": 2445.98490512499,
            "scale": 9244648.868618
        },
        {
            "level": 7,
            "resolution": 1222.992452562495,
            "scale": 4622324.434309
        },
        {
            "level": 8,
            "resolution": 611.4962262813797,
            "scale": 2311162.217155
        },
        {
            "level": 9,
            "resolution": 305.74811314055756,
            "scale": 1155581.108577
        },
        {
            "level": 10,
            "resolution": 152.87405657041106,
            "scale": 577790.554289
        },
        {
            "level": 11,
            "resolution": 76.43702828507324,
            "scale": 288895.277144
        },
        {
            "level": 12,
            "resolution": 38.21851414253662,
            "scale": 144447.638572
        },
        {
            "level": 13,
            "resolution": 19.10925707126831,
            "scale": 72223.819286
        },
        {
            "level": 14,
            "resolution": 9.554628535634155,
            "scale": 36111.909643
        },
        {
            "level": 15,
            "resolution": 4.77731426794937,
            "scale": 18055.954822
        },
        {
            "level": 16,
            "resolution": 2.388657133974685,
            "scale": 9027.977411
        },
        {
            "level": 17,
            "resolution": 1.1943285668550503,
            "scale": 4513.988705
        },
        {
            "level": 18,
            "resolution": 0.5971642835598172,
            "scale": 2256.994353
        },
        {
            "level": 19,
            "resolution": 0.29858214164761665,
            "scale": 1128.497176
        }
    ]
};

function getPointByCoords(x, y) { // 通过坐标得到 地图点
    var mapPoint = new esri.geometry.Point(x, y, mapView.spatialReference);
    return mapPoint;
}

function calcStringPixelsCount(str, strFontSize) {
    // 字符串字符个数
    var stringCharsCount = str.length;
    // 字符串像素个数
    var stringPixelsCount = 3;
    // JS 创建HTML元素：span
    var elementPixelsLengthRuler = document.createElement("span");
    elementPixelsLengthRuler.style.fontSize = strFontSize; // 设置span的fontsize
    elementPixelsLengthRuler.style.visibility = "hidden"; // 设置span不可见
    elementPixelsLengthRuler.style.display = "inline-block";
    elementPixelsLengthRuler.style.wordBreak = "break-all !important"; // 打断单词
    // 添加span
    document.body.appendChild(elementPixelsLengthRuler);
    for (var i = 0; i < stringCharsCount; i++) {
        // 判断字符是否为空格，如果是用&nbsp;替代，原因如下：
        // 1）span计算单个空格字符（ ），其像素长度为0
        // 2）空格字符在字符串的开头或者结果，计算时会忽略字符串
        if (str[i] == " ") {
            elementPixelsLengthRuler.innerHTML = "&nbsp;";
        } else {
            elementPixelsLengthRuler.innerHTML = str[i];
        }

        stringPixelsCount += elementPixelsLengthRuler.offsetWidth;
    }
    document.body.removeChild(elementPixelsLengthRuler);
    return stringPixelsCount;
}