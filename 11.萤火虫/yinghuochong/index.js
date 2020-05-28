var select = new ol.interaction.Select();
select.on('select',function (p1) {
    console.log(p1.selected[0].getProperties()['avg_price'])
})
map.addInteraction(select)
var max = null , minIndex = null , step = 40000, stepLenght = step.length;
var source = new ol.source.Vector({
    format: new ol.format.GeoJSON({
        featureProjection: 'EPSG:3857'
    }),
    loader: function (res) {
        ctrl.getData();
    }
})
var style = function (feat) {
    var value = feat.getProperties()['avg_price']
    if(value == null){
        value = 0
    }
    var style = getStyle(parseInt(value));
    feat.set('type',style[1])
    feat.setStyle(style[0])
}

var vector = new ol.layer.Vector({
    source: source,
    style: style
})
var getStyle = function(value) {
    var src = null;
    var type = 0;
    var scale = null;
    if (value > 0 && value <= step) {
        type = 0;
        src = 'img/1.png';
        scale = getScale(1, value)
    } else if (value > step && value <= (step * 2)) {
        type = 1;
        src = 'img/2.png'
        scale = getScale(2, value)
    } else if (value > (step * 2) && value <= (step * 3)) {
        type = 2;
        src = 'img/3.png'
        scale = getScale(3, value)
    } else if (value > (step * 4)) {
        type = 3;
        src = 'img/4.png'
        scale = getScale(4, value)
    } else {
        src = 'img/1.png'
        scale = 0
    }
    var style = new ol.style.Style({
        image: new ol.style.Icon({
            src: src,
            scale: scale
        })
    })
    return [style, type]
}
var getScale = function(level,val) {
    var value = null;
    if (level == 1) {
        value = val
    }
    if (level == 2) {
        value = val - step * 1
    }
    if (level == 3) {
        value = val - step * 2
    }
    if (level == 4) {
        value = val - step * 3
    }
    if (value < minIndex) {
        value = minIndex
    }
    var scale = (value / (minIndex * 10)) * 2
    return scale
}
map.addLayer(vector)

var ctrl = {
    area: null,
    cityId: 2,
    featType: {
        0: [],
        1: [],
        2: [],
        3: []
    },
    swicthCity: function (area) {
        this.area = area;
        this.cityId = area.areaId;
        var filter =
            '&filter=' +
            '<PropertyIsEqualTo>' +
            '<PropertyName>city_id</PropertyName>' +
            '<Literal>' + this.cityId + '</Literal>' +
            '</PropertyIsEqualTo>'
        var url = 'http://geoserver.cindata.cn/geoserver/cim/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cim:gr_city'
            + filter +
            '&maxFeatures=100&outputFormat=application%2Fjson'
        $.ajax({
            url: url,
            type: 'get',
            async: false,
            success: function (data) {
                //source.clear();
                var feat = source.getFormat().readFeatures(data)[0];
                var center = ol.extent.getCenter(feat.getGeometry().getExtent())
                if (center) {
                    $('#legend').html('');
                    $('#title').text('');
                    map.getView().setZoom(11)
                }
                ctrl.flyTos(center, 11, function () {
                    source.forEachFeature(function (feature) {
                        source.removeFeature(feature)
                    })
                    ctrl.getData();
                    view.fit(feat.getGeometry().getExtent(), {
                        constrainResolution: false,
                        nearest: true
                    })
                })
            }
        })
    },
    getData: function () {
        var filter =
            '&filter=' +
            '<PropertyIsEqualTo>' +
            '<PropertyName>city_id</PropertyName>' +
            '<Literal>' + this.cityId + '</Literal>' +
            '</PropertyIsEqualTo>'
        var url = 'http://geoserver.cindata.cn/geoserver/gxd/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=gxd:gp_community' + filter + '&maxFeatures=10000&outputFormat=application%2Fjson'
        $.ajax({
            url: url,
            type: 'get',
            success: function (data) {
                var features = source.getFormat().readFeatures(data);
                features.sort(ctrl.compare('avg_price'))
                if (ctrl.cityId == 2) {
                    step = 40000
                    minIndex = 10000
                } else {
                    max = parseInt(features[0].getProperties()['avg_price']);
                    var _step = parseInt(max / 5).toString()
                    step = _step[0]
                    minIndex = '1'
                    for (var i = 0; i < _step.length - 1; i++) {
                        step += '0'
                        minIndex += '0';
                    }
                    step = parseInt(step)
                    minIndex = parseInt(minIndex)
                }
                source.addFeatures(features)
                if (!ctrl.area)
                    ctrl.area = {
                        name: '北京市'
                    };
                ctrl.getHtmlLegend(ctrl.area.name);
            }
        })
    },
    on: function () {
        $('.btn_sw').on('click', function () {
            ctrl.swicthCity(this.id)
        })
        this.getPopup();
        var select = new ol.interaction.Select({
            condition: ol.events.condition.pointerMove
        });
        select.on('select', function (p1) {
            var feat = p1.selected[0];
            if (feat) {
                var data = feat.getProperties();
                var center = feat.getGeometry().getCoordinates();
                var value = parseFloat(data['avg_price']);
                var name = data['label'];
                var iHtml =
                    '<ul style="list-style-type:none">' +
                    '<li style="font-size: 12px;">小区: ' + name + '</li>' +
                    '<li style="font-size: 12px;">' + '价格:  ' + value + ' 元(㎡)' + '</li>'
                '</ul>'
                $('#name').html(iHtml);
                $('#name').css('margin-top', '-45px');
                ctrl.popup.setPosition(center)
            } else {
                ctrl.popup.setPosition([0, 0])
            }
        })
        map.addInteraction(select)
    },
    /*
    * 获取popup
    * */
    getPopup: function () {
        var div = $('<div id="info" style="cursor: pointer;">' +
            '<div id="name" style="border: 1px solid rgb(0,188,212); color: rgb(0, 0, 0); padding: 6px 11px; border-radius: 4px; background: rgb(255, 255, 255); position: relative; top: -10px; left: 0%; max-width: 500px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; z-index: 10; transform: translateX(-50%); cursor: pointer;">info</div>' +
            '<p id="sj" style="border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 10px solid rgb(255,255,255); position: absolute; left: 0%; bottom: 0px; transform: translateX(-50%);"></p>' +
            '</div>')
        this.popup = new ol.Overlay({
            id: 'rq',
            element: div[0],
            offset: [0, 0],
            insertFirst: false,
            stopEvent: false
        })
        map.addOverlay(this.popup)
    },
    flyTos: function (location, targetZoom, done) {
        var duration = 4000;
        var view = map.getView();
        var zoom = map.getView().getZoom();
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
            zoom: zoom - 5,
            duration: duration / 2
        }, {
            zoom: targetZoom,
            duration: duration / 2
        }, callback);
    },
    /*
    * 数组排序(由大到小)
    * */
    compare(property) {
        return function (a, b) {
            var value1 = a.getProperties()[property] == undefined ? 0 : a.getProperties()[property];
            var value2 = b.getProperties()[property] == undefined ? 0 : b.getProperties()[property];
            return value2 - value1;
        }
    },
    getHtmlLegend: function (title) {
        var html = '';
        var legend = $('#legend');
        legend.html('');
        $('#title').text(title + '房价');
        for (var i = 0; i < 4; i++) {
            var min = i * step;
            var max = (i + 1) * step;
            var value = min / 10000 + ' ~ ' + max / 10000;
            if ((i + 1) == 4) {
                value = min / 10000 + '及以上'
            }
            var src = 'img/' + (i + 1) + '.png'
            var transform = 'translate(0,' + 40 * i + ')'
            var g =
                '<g id=' + i + ' onclick="ctrl.gClick(this)" transform=' + transform + ' style="cursor:pointer;">' +
                '<image x="0" y="-5" href=' + src + ' ></image>' +
                '<text x="45" y="26" fill="white" >' + value + ' 万元/㎡</text>' +
                '</g>'
            html += g;
        }
        legend.html(html);
    },
    gClick: function (_this) {
        var id = parseInt(_this.id);
        var feats = this.featType[id];
        if (feats.length > 0) {
            source.addFeatures(feats);
            ctrl.featType[id] = new Array();
        } else {
            source.forEachFeature(function (feature) {
                var type = feature.get('type')
                if (type == id) {
                    source.removeFeature(feature)
                    feats.push(feature)
                }
            })
        }
    }
}

ctrl.on();