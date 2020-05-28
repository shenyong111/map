/**
 *   openlayer脚本
 * */
var olMap = function () {
    var map = null;
    var view = null;
    var baseLayer = null;//底图
    var defaultBaseLayerType = 'gxd';
    var defaultTarget = 'map';
    var defaultProjection = 'EPSG:900913';
    var popup = null;
    var drawLayer = null;
    var modifyLayer = null;
    var drawInteraction = null;
    var selectInteraction = null;
    var modifyInteraction = null;
    var layer_gr_area_2301 = null;
    var layer_gr_area_own_define = null;
    var drawFeature = null;
    var selectFeature = null;
    var modifyFeature = null;
    var key = null;
    var initMap = function initMap(target) {
        if(!target) target = defaultTarget;
        view = new ol.View({
            projection: defaultProjection,
            center: [11590349.013045715, 4576119.966707465],
            // extent: [7107053.740285003, -80822.9193149989, 16061315.281015012, 8587942.610615],
            zoom: 4.5,
            // center: [14095656.394087896, 5740571.783954563],
            maxZoom: 19,
            minZoom: 3,
        });
        map = new ol.Map({
            target: target,
            view: view,
            controls: ol.control.defaults({attribution: false}).extend([new ol.control.Attribution({
                collapsible: false
            })])
        });
        map.on('moveend', function (e) {
            moveend(e);
        });
        olMap.map = map;
    }
    var initBaseLayer = function initBaseLayer(type) {
        updateBaseLayer(type);
    }
    var updateBaseLayer = function updateBaseLayer(type) {
        if (!type) type = defaultBaseLayerType;
        if (!map) initMap();
        if (baseLayer) map.removeLayer(baseLayer);
        switch (type) {
            case 'gxd':
                baseLayer = initGXD();
                break;
            case 'sateLayers':
                baseLayer = initSatellites();
                break;
            case 'black':
                baseLayer = initGxdBlack();
                break;
        }
        map.addLayer(baseLayer);
    }
    var initGXD = function initGXD() {
        var gxd = new ol.layer.Tile({
            extent: [7107053.740285003, -80822.9193149989, 16061315.281015012, 8587942.610615],
            // extent: [63.843749999568296, -0.7260252071343274, 144.28124999998212, 60.834596535880905],
            source: new ol.source.TileArcGISRest({
                url: "http://lbsapi.cindata.cn/gis/v1/services/export",
                params: {
                    mapCode: '1_base_map_fe9e51abd96b7a041ab6f883eda91349',
                    keyCode: '78b8c098b5694cf09fcd9b18ce94e7e7'
                }
            })
        })
        gxd.set('id', 'base');
        gxd.setZIndex(-1);
        return gxd;
    }
    /*
     * 公司黑色底图
     * */
    var initGxdBlack = function initGxdBlack() {
        var url = 'http://lbsapi.cindata.cn/gis/v1/services/export'
        var gxd = new ol.layer.Tile({
            preload: 80,
            extent: [7107053.740285003, -80822.9193149989, 16061315.281015012, 8587942.610615],
            source: new ol.source.TileArcGISRest({
                url: url,
                wrapX: false,
                params: {mapCode: '1_base_map_96c539ec3ad278d85b9c572c5abcb7cf',keyCode: '78b8c098b5694cf09fcd9b18ce94e7e7'}
            }),
            zIndex: 0
        })
        gxd.set('id', 'base');
        return gxd;
    }
    /*
    * 影像地图
    * */
    var initSatellites = function initSatellites() {
        var url = "http://tilesvc.cindata.cn/arcgis/rest/services/comm/googleMapNew/MapServer";
            var sateLayers = new ol.layer.Tile({
            source: new ol.source.TileArcGISRest({
                url: url
            })
        })
        sateLayers.set('id', 'base');
        sateLayers.setZIndex(-1);
        return sateLayers;
    }
    var moveend = function moveend(e) {
        var currentZoom = map.getView().getZoom();
        var bbox = ol.proj.transformExtent(view.calculateExtent(), defaultProjection, 'EPSG:4326');
        queryAreaInfo(currentZoom, bbox, function (areaInfo) {
            if (areaInfo) {
                app.areaInfo = areaInfo;
                $('#citySelect-show>span').html(app.areaInfo.name);
            }
        });
    }
    var queryAreaInfo = function queryAreaInfo(zoom,bbox,success) {
        if (zoom < 1) {
            success({name: '全国', level: 0, other: {}});
        } else {
            var level, url, typeName, maxFeatures;
            if (zoom >= 1 && zoom < 2) {
                level = 1;
                url = 'http://geoserver.cindata.cn/geoserver/cim/ows';
                typeName = 'gp_province';
                maxFeatures = 100;
            } else {
                level = 2;
                url = 'http://geoserver.cindata.cn/geoserver/cim/ows';
                typeName = 'gr_city_cim';
                maxFeatures = 500;
            }
            $.ajax({
                type: "post",
                async: true,
                url: url,
                data: {
                    service: "WFS",
                    version: "1.0.0",
                    request: "GetFeature",
                    typeName: typeName,
                    maxFeatures: maxFeatures,
                    outputFormat: "application/json",
                    // bbox: bbox.join(',')
                },
                success: function (geojson) {
                    if(!geojson||geojson.features.length==0)return null;
                    //查询到多个要素时，返回距离中心点最近的
                    var center = [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
                    var minIndex = 0;
                    var minCoordinates = geojson.features[minIndex].geometry.coordinates;
                    var minDistance = Math.pow(minCoordinates[0] - center[0], 2) + Math.pow(minCoordinates[1] - center[1], 2);
                    for (var i = 0; i < geojson.features.length; i++) {
                        if(!geojson.features[i].geometry||!geojson.features[i].geometry.coordinates)continue;
                        var curCoordinates = geojson.features[i].geometry.coordinates;
                        var curDistance = Math.pow(curCoordinates[0] - center[0], 2) + Math.pow(curCoordinates[1] - center[1], 2);
                        if (curDistance < minDistance) {
                            minDistance = curDistance;
                            minIndex = i;
                        }
                    }
                    success({
                        name: geojson.features[minIndex].properties.name,
                        level: level,
                        other: geojson.features[minIndex]
                    });
                }
            });
        }
    }
    var flyTo = function flyTo(location, done) {
        location = ol.proj.transform(location, 'EPSG:4326',defaultProjection);
        var duration = 2000;
        var parts = 2;
        var called = false;
        function callback(complete) {
            --parts;
            if (called) {
                return;
            }
            if (parts === 0 || !complete) {
                called = true;
                done(complete);
            }
        }
        view.animate({
            center: location,
            duration: duration
        }, callback);
        view.animate({
            zoom: 9,
            duration: duration / 2
        }, {
            zoom: 10,
            duration: duration / 2
        }, callback);
    }
    var addLayer_gr_area_2301 = function addLayer_gr_area_2301() {
        if(layer_gr_area_2301)map.removeLayer(layer_gr_area_2301);
        layer_gr_area_2301 = new ol.layer.Vector({
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: function(extent){
                    extent = olMap.map.getView().calculateExtent();
                    extent = ol.proj.transformExtent([70,0,140,60],'EPSG:4326','EPSG:3857');
                    return 'http://geoserver.cindata.cn/geoserver/gxd_develop/ows?' +
                        'service=WFS&version=1.0.0&request=GetFeature&typeName=gxd_develop:gr_area_2301' +
                        '&maxFeatures=5000&outputFormat=application%2Fjson' +
                        '&bbox=' + extent.join(',') + ',EPSG:3857';
                },
                //基于extent和resolution的加载策略，即随着extent的变化而加载
                strategy: ol.loadingstrategy.bboxStrategy
            }),
            style: olStyle.gr_area_2301_LayerStyle,
            id: 'gr_area_2301'
        });
        map.addLayer(layer_gr_area_2301);
    }
    var addLayer_gr_area_own_define = function addLayer_gr_area_own_define() {
        if(layer_gr_area_own_define)map.removeLayer(layer_gr_area_own_define);
        layer_gr_area_own_define = new ol.layer.Vector({
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: function(extent){
                    extent = olMap.map.getView().calculateExtent();
                    extent = ol.proj.transformExtent([70,0,140,60],'EPSG:4326','EPSG:3857');
                    return 'http://geoserver.cindata.cn/geoserver/gxd/ows?' +
                        'service=WFS&version=1.0.0&request=GetFeature&typeName=gxd:gr_area_own_define' +
                        '&maxFeatures=5000&outputFormat=application%2Fjson' +
                        // '&bbox=' + extent.join(',') + ',EPSG:3857' +
                        '&filter=<Filter><PropertyIsEqualTo><PropertyName>keycode</PropertyName><Literal>'+app.keyCode+'</Literal></PropertyIsEqualTo></Filter>';
                },
                //基于extent和resolution的加载策略，即随着extent的变化而加载
                strategy: ol.loadingstrategy.bboxStrategy
            }),
            style: olStyle.gr_area_2301_LayerStyle,
            id: 'gr_area_own_define'
        });
        map.addLayer(layer_gr_area_own_define);
    }
    var addLayer_community = function addLayer_community() {
        var layer = new ol.layer.VectorTile({
            source: new ol.source.VectorTile({
                tilePixelRatio:1,
                tileGrid: ol.tilegrid.createXYZ({ maxZoom: 22}),
                format: new ol.format.MVT(),
                url:'http://geoserver.cindata.cn/geoserver/gwc/service/tms/1.0.0/gxd:community@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf'
            }),
            style: olStyle.community_LayerStyle
        });

        map.addLayer(layer);
    }
    var initSelect = function initSelect() {
        selectInteraction = new ol.interaction.Select({
            condition: ol.events.condition.click,
            style: olStyle.selectInteractionStyle,
        });
    }
    var startSelect_bk = function startSelect_bk(selected) {
        $('#map').css({'cursor':'pointer'});
        selectInteraction.getFeatures().clear();
        map.addInteraction(selectInteraction);
        selectInteraction.on('select', function(e) {
            debugger
            if(e.selected.length>0){
                olMap.selectFeature = e.selected[e.selected.length-1];
                selected(true);
            }else{
                selected(false);
            }
        });
    }
    var startSelect = function startSelect(selected) {
        $('#map').css({'cursor':'pointer'});
        startSelectInside(selected);
    }
    var exitSelect_bk = function exitSelect_bk() {
        $('#map').css({'cursor':'default'});
        map.removeInteraction(selectInteraction);
    }
    var exitSelect = function exitSelect() {
        $('#map').css({'cursor':'default'});
        if(selectFeature)selectFeature.setStyle(olStyle.gr_area_2301_LayerStyle);
        ol.Observable.unByKey(key);
    }
    var initModify = function initModify() {
        modifyLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: olStyle.modifyLayerStyle
        });
        modifyInteraction = new ol.interaction.Modify({
            style:olStyle.modifyInteractionStyle,
            // features: selectInteraction.getFeatures()
            // features: new ol.Collection(selectFeature?[selectFeature]:[]),
            features: selectFeature?new ol.Collection([selectFeature]):new ol.Collection(),
        });
    }
    var startModify = function startModify(modify) {
        startSelect(modify);
        // map.addInteraction(modifyInteraction);
        // modifyInteraction.on('modifyend', function(e) {
        //     $('#map').css({'cursor':'crosshair'});
        //     // 把修改完成的feature暂存起来
        //     olMap.modifyFeature = e.features.item(0);
        // });

    }
    var exitModify = function exitModify() {
        $('#map').css({'cursor':'default'});
        map.removeInteraction(selectInteraction);
        map.removeInteraction(modifyInteraction);
        modifyLayer.getSource().clear();
    }
    var initDraw = function initDraw(freehand) {
        if(drawInteraction)exitDraw();
        map.on("dblclick", function (e) {
            e.preventDefault()
        }, false);
        drawLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: olStyle.drawLayerStyle
        });
        drawInteraction = new ol.interaction.Draw({
            type: 'Polygon',
            freehand: freehand?freehand:false,
            style: olStyle.drawInteractionStyle,
            source: drawLayer.getSource()
        });
        map.addLayer(drawLayer);
        olMap.drawLayer = drawLayer;
        olMap.drawInteraction = drawInteraction;
    }
    var startDraw = function startDraw(drawend) {
        $('#map').css({'cursor':'crosshair'});
        map.addInteraction(drawInteraction);
        drawInteraction.on('drawend', function(e) {
            $('#map').css({'cursor':'default'});
            map.removeInteraction(drawInteraction);
            olMap.drawFeature = e.feature;
            drawend();
        });
    }
    var exitDraw = function exitDraw() {
        $('#map').css({'cursor':'default'});
        map.removeInteraction(drawInteraction);
        drawLayer.getSource().getFeatures().forEach(function(feature){
            drawLayer.getSource().removeFeature(feature);
        });
    }
    var startSelectInside =  function startSelectInside(callback) {
        key = map.on("singleclick", function(e) {
            var isSelect = false;
            if (selectFeature) {
                selectFeature.setStyle(olStyle.gr_area_2301_LayerStyle);
            }
            var minArea = 1000000000;
            map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
                var area = feature.getProperties().parent_area;
                if (area < minArea) {
                    isSelect = true;
                    minArea = area;
                    feature.setStyle(olStyle.gr_area_2301_LayerStyle);
                    selectFeature = feature;
                }
            });
            if(isSelect){
                olMap.selectFeature = selectFeature;
                olMap.modifyFeature = selectFeature;
                selectFeature.setStyle(app.status=='修改'?olStyle.modifyInteractionStyle:olStyle.selectInteractionStyle);
                if(app.status=='修改'){
                    map.removeInteraction(modifyInteraction);
                    modifyInteraction = new ol.interaction.Modify({
                        style:olStyle.modifyInteractionStyle,
                        features: new ol.Collection([selectFeature]),
                    });
                    map.addInteraction(modifyInteraction);
                    modifyInteraction.on('modifyend', function(e) {
                        $('#map').css({'cursor':'crosshair'});
                        // 把修改完成的feature暂存起来
                        olMap.modifyFeature = e.features.item(0);
                    });
                }
            }
            if(callback)callback(isSelect);
            // modify = new ol.interaction.Modify({
            //     features: new ol.Collection([featurePoly]),
            //     style: selectInteractionStyle
            // });
            // map.addInteraction(modify);
        }.bind(this));
    }
    // 添加到服务器端
    var addWfs = function addWfs(features) {
        var newFeatures = [];
        for(var i=0;i<features.length;i++){
            var newFeature =  new ol.Feature();
            var geometry = features[i].getGeometry().clone();
            geometry.transform('EPSG:3857','EPSG:4326');
            geometry.applyTransform(function(flatCoordinates, flatCoordinates2, stride) {
                for (var j = 0; j < flatCoordinates.length; j += stride) {
                    var y = flatCoordinates[j];
                    var x = flatCoordinates[j + 1];
                    flatCoordinates[j] = x;
                    flatCoordinates[j + 1] = y;
                }
            });
            // MultiPolygon
            newFeature.setGeometryName('shape');
            newFeature.setGeometry(new ol.geom.MultiPolygon([geometry.getCoordinates()]));
            newFeatures.push(newFeature);
        }
        var WFSTSerializer = new ol.format.WFS();
        var featObject = WFSTSerializer.writeTransaction(newFeatures,
            null, null, {
                featureType: 'gr_area_2301',
                featureNS: 'http://www.opengeospatial.net/gxd_develop',
                srsName: 'EPSG:4326'
            });
        var serializer = new XMLSerializer();
        var featString = serializer.serializeToString(featObject);
        var request = new XMLHttpRequest();
        request.open('POST', 'http://geoserver.cindata.cn/geoserver/wfs?service=wfs');
        request.setRequestHeader('Content-Type', 'text/xml');
        request.onreadystatechange = function (data) {
            if (request.readyState == 4 && request.status == 200) {

            }
        };
        request.send(featString);
    }
    return {
        map: map,
        initMap: initMap,
        initBaseLayer: initBaseLayer,
        updateBaseLayer: updateBaseLayer,
        flyTo: flyTo,
        addLayer_gr_area_2301: addLayer_gr_area_2301,
        addLayer_gr_area_own_define: addLayer_gr_area_own_define,
        addLayer_community: addLayer_community,
        drawLayer: drawLayer,
        drawInteraction: drawInteraction,
        initDraw: initDraw,
        startDraw:startDraw,
        exitDraw:exitDraw,
        initSelect: initSelect,
        startSelect:startSelect,
        exitSelect: exitSelect,
        initModify: initModify,
        startModify: startModify,
        exitModify: exitModify,
        startSelectInside:startSelectInside,
        drawFeature: drawFeature,
        selectFeature: selectFeature,
        modifyFeature: modifyFeature,
        addWfs: addWfs
    }

}();