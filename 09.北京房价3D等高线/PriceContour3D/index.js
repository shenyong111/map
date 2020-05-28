let map = null;
let sceneView = null;
let layers = {};
let symbol = null;
let oldSymbol = null;
let showLayer = null;
let featureLyr = null;
let queryTarget = "block";
let citycode = 2301;
let cityId = 708;
let map_url = "http://gissvc4an.cindata.cn/arcgis/rest/services/heilongjiang/address/MapServer";



function init() {

    symbol = {type: "simple-line", color: [255, 252, 0], style: "solid", width: 3};

    let baseLayer = new esri.layers.MapImageLayer({
        url: "http://tilesvc.cindata.cn/arcgis/rest/services/comm/ChinaBlack/MapServer",
        legendEnabled: false,
        imageFormat: "PNG32"
    });
    let baseMap = new esri.Basemap({
        baseLayers: [baseLayer],
        title: "企业地图",
        id: "baseMap"
    });
    map = new esri.Map({basemap: baseMap});
    sceneView = new esri.views.SceneView({
        container: "viewDiv",
        map: map,
        camera: {
            position: {
                // x: 12959333.046236353,
                // y: 4764686.154724529,
                // x: 14094896.406271007,
                // y: 5695998.259723103,
                // z: 128640.617742186412,
                x: 14092445.14074654,
                y: 5699998.5507756425,
                z: 16118.59876893647,
                spatialReference: {
                    wkid: 3857
                }
            },
            fov: 60,
            heading: 359.2270506205949,
            tilt: 56
        },
        zoom: 11,
        highlightOptions: {
            color: [255, 255, 0, 1],
            haloOpacity: 0.8,
            fillOpacity: 0.2
        }
    });

    sceneView.ui.remove("navigation-toggle");
    sceneView.ui.remove("compass");
    sceneView.ui.remove("attribution");
    sceneView.ui.move("zoom","bottom-left");
    sceneView.ui.add("infoDiv", "top-right");
    addFeatureLayer();
}

function addFeatureLayer() {
    if(featureLyr)map.remove(featureLyr);
    featureLyr = new esri.layers.FeatureLayer({
        url: "http://tilesvc.cindata.cn/arcgis/rest/services/special_map/CONTOUR_SQMPRICE_"+citycode+"/MapServer/0",
        title: "房价等高线3D",
        labelsVisible: false,
        elevationInfo: {
            mode: "relative-to-ground",
            featureExpressionInfo: {
                expression: "$feature.Contour * 0.15"
            },
            unit: "meters"
        }
    });
    map.add(featureLyr);
    findMapRegisByCityId(cityId,function(res){
        if( res && res.length>0 ){
            map_url = res[0].map_url;
            sceneView.whenLayerView(featureLyr)
                .then(function (layerView) {
                    setupHoverTooltip(layerView);
                    initCompassEvent();
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    });
}

/**
 * 查询等高线相交的板块
 */
function queryIntersectBlock(graphic) {
    let promise;
    let queryTask = new esri.tasks.QueryTask({
        url: "http://tilesvc.cindata.cn/arcgis/rest/services/comm/precinct_street/MapServer/0"
    });

    sceneView.on("pointer-move", function (event) {
        if (promise) {
            promise.cancel();
        }


    });
}

function setupHoverTooltip(layerview) {
    let promise, promiseQuery;
    let highlight;

    let tooltip = createTooltip();

    sceneView.on("pointer-move", function (event) {
        if (promise) {
            promise.cancel();
        }
        if (promiseQuery) {
            promiseQuery.cancel();
        }

        promise = sceneView.hitTest(event.x, event.y)
            .then(function (hit) {
                promise = null;

                // remove current highlighted feature
                if (highlight) {
                    highlight.remove();
                    highlight = null;
                }
                if (hit.results[0].graphic == null) {
                    tooltip.hide();
                    // document.getElementById('infoDiv').innerHTML = "";
                }

                var results = hit.results.filter(function (result) {
                    return result.graphic.layer === featureLyr;
                });

                // highlight the hovered feature
                // or hide the tooltip
                if (results.length) {
                    var graphic = results[0].graphic;
                    var screenPoint = hit.screenPoint;

                    highlight = layerview.highlight(graphic);
                    let rent = graphic.getAttribute("Contour");
                    tooltip.show(screenPoint, "房价：<span style='color: red; font-weight: bold;'>" + rent + "</span> 元/㎡");

                    let layerUrl = queryTarget == "block" ? map_url+"/29" : map_url+"/4";
                    let queryTask = new esri.tasks.QueryTask({
                        url: layerUrl
                    });

                    let query = new esri.tasks.Query({
                        returnGeometry: true,
                        outFields: ["LABEL"],
                        geometry: graphic.geometry,
                        spatialRelationship: "intersects",
                        where: queryTarget == "block" ? "STATUS_CD = 1" : "STATUS_CD = 1 And HOUSE_TYPE = '1000'"
                    });

                    promiseQuery = queryTask.execute(query)
                        .then(function (results) {
                            // console.log(results.features);
                            showQueryResults(results.features, rent);
                        });
                } else {
                    tooltip.hide();
                    // document.getElementById('infoDiv').innerHTML = "";
                }
            });


    });
}

function showQueryResults(features, rent) {
    let div = document.getElementById("infoDiv");
    let content = "<div style='padding:10px;'><p>房价：<span style='color: red; font-weight: bold;'>" + rent + "</span> 元/㎡</p><hr>";
    if(queryTarget == "block"){
        content += "<input type='radio' name='queryTarget' value='block' checked='checked' id='queryBlock' onclick='queryTarget = \"block\"'>板块";
        content += "<input style='margin-left: 15px;' type='radio' name='queryTarget' value='house' id='queryHouse' onclick='changeTanget(\"house\")'>小区";
    }else if(queryTarget == "house"){
        content += "<input type='radio' name='queryTarget' value='block' id='queryBlock' onclick='changeTanget(\"block\")'>板块";
        content += "<input style='margin-left: 15px;' type='radio' name='queryTarget' value='house' checked='checked' id='queryHouse' onclick='queryTarget = \"house\"'>小区";
    }

    // content +="<p>板块(" + features.length + "个)：</p>";
    content += "<ol id='list'>";
    features.forEach(function (feature) {
        // let field = queryTarget == "block" ? "PRECINCT_NAME" : "LABEL";
        content += "<li>" + feature.getAttribute("LABEL") + "</li>";
    })
    content += "</ol></div>";
    div.innerHTML = content;
}

function changeTanget(target) {
    queryTarget = target;

    let list = document.getElementById("list");
    list.innerHTML = "";
}

function createTooltip() {
    var tooltip = document.createElement("div");
    var style = tooltip.style;

    tooltip.setAttribute("role", "tooltip");
    tooltip.classList.add("tooltip");

    var textElement = document.createElement("div");
    // textElement.classList.add("esri-widget");
    tooltip.appendChild(textElement);

    sceneView.container.appendChild(tooltip);

    var x = 0;
    var y = 0;
    var targetX = 0;
    var targetY = 0;
    var visible = false;

    // move the tooltip progressively
    function move() {
        x += (targetX - x) * 0.1;
        y += (targetY - y) * 0.1;

        if (Math.abs(targetX - x) < 1 && Math.abs(targetY - y) < 1) {
            x = targetX;
            y = targetY;
        } else {
            requestAnimationFrame(move);
        }

        style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
    }

    return {
        show: function (point, text) {
            if (!visible) {
                x = point.x;
                y = point.y;
            }

            targetX = point.x;
            targetY = point.y;
            style.opacity = 1;
            visible = true;
            textElement.innerHTML = text;

            move();
        },

        hide: function () {
            style.opacity = 0;
            visible = false;
        }
    };
}

function initCompassEvent() {
    var compass = document.getElementById('compass');
    var manager = new Hammer.Manager(compass);

    var Tap = new Hammer.Tap({taps: 1});
    manager.add(Tap);
    manager.on('tap', function(e) {
        resetRotateView(0,0);
    });
    var pan = new Hammer.Pan({threshold: 10,pointers:1});
    manager.add(pan);
    manager.on('panleft', function(e) {
        rotateView(-1);
    });
    manager.on('panright', function(e) {
        rotateView(1);
    });
    manager.on('panup', function(e) {
        tiltView(1);
    });
    manager.on('pandown', function(e) {
        tiltView(-1);
    });
    sceneView.watch('camera.heading',function(){
        $('#compass').css({"transform":"rotateZ(-"+sceneView.camera.heading+"deg)"});
        $('#compass>.esri-icon-compass').css({"transform":"rotateX(-"+sceneView.camera.tilt+"deg)"});
    });
}
function resetRotateView(heading,tilt) {
    sceneView.goTo({
        heading: heading,
        tilt: tilt
    });
    $('#compass').css({"transform":"rotateZ(-"+heading+"deg)"});
    $('#compass>.esri-icon-compass').css({"transform":"rotateX(-"+tilt+"deg)"});
}
function rotateView(direction) {
    var heading = sceneView.camera.heading;
    if (direction > 0) {
        heading = heading + 15;
    } else {
        heading = heading - 15;
    }

    sceneView.goTo({
        heading: heading
    });
    $('#compass').css({"transform":"rotateZ(-"+heading+"deg)"});
}

function tiltView(direction) {
    var tilt = sceneView.camera.tilt;
    if (direction > 0) {
        tilt = tilt + 5;
    } else {
        tilt = tilt - 5;
    }
    sceneView.goTo({
        tilt: tilt
    });
    $('#compass>.esri-icon-compass').css({"transform":"rotateX(-"+tilt+"deg)"});
}

function citySelectCallback(area,result){
    citycode = area.zoneNumber.substr(0,4);
    cityId = area.areaId;
    var obj = new esri.geometry.Extent(eval("(" + result.range + ")"));
    sceneView.goTo({target: obj}, {duration:1})
        .then(function(){
            sceneView.zoom = 11;
            addFeatureLayer(citycode);
        });
}

function findMapRegisByCityId(cityId,success){
    $.ajax({
        type: "post",
        //url : 'http://testlbs.cindata.net/gxdyun/area/findMapRegisByCityId',
		url : 'http://lbs.cindata.cn/gxdyun/area/findMapRegisByCityId',
        data : {
            cityId: cityId
        },
        success : success
    });
}