var priceTrend = {
    vector: null,
    styleConfig: null,
    source: null,
    colors: {
        0: 'rgb(250,252,185)',
        1: 'rgb(254,254,115)',
        2: 'rgb(254,254,1)',
        3: 'rgb(255,211,1)',
        4: 'rgb(254,169,1)',
        5: 'rgb(254,139,1)',
        6: 'rgb(252,70,0)',
        7: 'rgb(255,0,0)',
    },
    features: new Array(),
    data: new Map(),
    _setInterval: null,
    step: null,
    _step: null,
    _max: null,
    popup:null,
    i:0,
    init() {
        var self = this;
        var center = ol.proj.transform([116.40261, 39.903666], 'EPSG:4326', 'EPSG:3857')
        self.view = new ol.View({
            center: center,
            zoom: 11,
            projection: 'EPSG:102113',
            extent: [7107053.740285003, -80822.9193149989, 16061315.281015012, 8587942.610615],
        })
        self.map = new ol.Map({
            target: 'viewDiv',
            view: self.view,
            controls: ol.control.defaults({attribution: false}).extend([new ol.control.Attribution({
                collapsible: false
            })]),
            layers: [self.InitGxdBlack()]
        })
        self.source = self.getSource();
        self.vector = new ol.layer.Vector({
            id: 'priceTrend',
            source: self.source
        })
        self.map.addLayer(self.vector);
        $('#yearInfo').on('click', function (e) {
            if (self._setInterval) {
                if (self._step > self._max) {
                    var features = self.source.getFeatures();
                    for (var i in features) {
                        var feat = features[i];
                        self.source.removeFeature(feat)
                    }
                    self._step = null;
                    $('#legened g').hide();
                    self.i = 0;
                    self.addFeatures(self._max, self.step);
                } else {
                    window.clearInterval(self._setInterval)
                    self._setInterval = null;
                    $('#yearInfo').css({
                        color: '#fff'
                    })
                }
            }
            else {
                self.addFeatures(self._max, self.step)
                $('#yearInfo').css({
                    color: '#f00'
                })
            }
        })
        self.getPopup();
        var select = new ol.interaction.Select({
            condition: ol.events.condition.pointerMove
        });
        select.on('select', function (p1) {
            var feat = p1.selected[0];
            if (feat) {
                var data = feat.getProperties();
                var center = feat.getGeometry().getCoordinates();
                var value = parseFloat(data['rent_sqmprice']) * 100;
                var name = data['label'];
                var iHtml =
                    '<ul style="list-style-type:none">' +
                    '<li style="font-size: 12px;">小区: ' + name + '</li>' +
                    '<li style="font-size: 12px;">' + '租金:  ' + value + ' (元/月)' + '</li>'
                '</ul>'
                $('#name').html(iHtml);
                $('#name').css('margin-top', '-45px');
                self.popup.setPosition(center)
            } else {
                self.popup.setPosition([0, 0])
            }
        })
        self.map.addInteraction(select)
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
        this.map.addOverlay(this.popup)
    },
    getSource() {
        var self = this;
        var source = new ol.source.Vector({
            format: new ol.format.GeoJSON({
                featureProjection: 'EPSG:3857'
            }),
            loader: function (extent, resolution, projection) {
                ctrl.cityId = 2;
                ctrl.getData();
            }
        })
        return source;
    },
    /*
    * 底图初始化
    * */
    initGXD() {
        var gxd = new ol.layer.Tile({
            extent: [7107053.740285003, -80822.9193149989, 16061315.281015012, 8587942.610615],
            source: new ol.source.TileArcGISRest({
                url: "http://lbsapi.cindata.cn/gis/v1/services/export",
                params: {
                    mapCode: '1_base_map_fe9e51abd96b7a041ab6f883eda91349',
                    keyCode: '78b8c098b5694cf09fcd9b18ce94e7e7'
                }
            })
        })
        gxd.set('id', 'base');
        gxd.setZIndex(0);
        return gxd;
    },
    /*
     * 公司黑色底图
     * */
    InitGxdBlack() {
        var url = 'http://lbsapi.cindata.cn/gis/v1/services/export'
        var gxd = new ol.layer.Tile({
            preload: 80,
            extent: [7107053.740285003, -80822.9193149989, 16061315.281015012, 8587942.610615],
            source: new ol.source.TileArcGISRest({
                url: url,
                wrapX: false,
                params: {
                    mapCode: '1_base_map_96c539ec3ad278d85b9c572c5abcb7cf',
                    keyCode: '78b8c098b5694cf09fcd9b18ce94e7e7'
                }
            }),
            zIndex: 0
        })
        gxd.set('id', 'base');

        return gxd;
    },
    /*
    * 开始
    * */
    start(features, max, step) {
        var _this = this;
        var color = _this.colors;
        this.styleConfig = {
            0: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 2,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0,0,0,0.0)',
                    }),
                    fill: new ol.style.Fill({color: color[0]})
                })
            }),
            1: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 2,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0,0,0,0.0)',
                    }),
                    fill: new ol.style.Fill({color: color[1]})
                })
            }),
            2: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 2,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0,0,0,0.0)',
                    }),
                    fill: new ol.style.Fill({color: color[2]})
                })
            }),
            3: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 2,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0,0,0,0.0)',
                    }),
                    fill: new ol.style.Fill({color: color[3]})
                })
            }),
            4: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 2,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0,0,0,0.0)',
                    }),
                    fill: new ol.style.Fill({color: color[4]})
                })
            }),
            5: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 2,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0,0,0,0.0)',
                    }),
                    fill: new ol.style.Fill({color: color[5]})
                })
            }),
            6: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 2,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0,0,0,0.0)',
                    }),
                    fill: new ol.style.Fill({color: color[6]})
                })
            }),
            7: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 2,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0,0,0,0.0)',
                    }),
                    fill: new ol.style.Fill({color: color[7]})
                })
            })
        }
        if (_this.data.size > 0) {
            _this.data.clear();
        }
        var colorIndex = 0;
        for (var j = step; j < max; j += step) {
            var start = j - step;
            var result = new Array()
            for (var i = 0; i < features.length; i++) {
                var f = features[i]
                var price = parseInt(f.getProperties().rent_sqmprice);
                if (price > start && price <= j) {
                    if (_this.styleConfig[colorIndex]) {
                        f.setStyle(_this.styleConfig[colorIndex])
                        result.push(f)
                    }
                }
            }
            _this.data.set(j, result)
            colorIndex += 1;
        }
        _this.addFeatures(max, step)
    },
    addFeatures: function (max, step) {
        var _this = this;
        if (_this.step == null) {
            _this.step = step;
        }
        if (_this._step == null) {
            _this._step = step;
        }
        if (_this._max == null) {
            _this._max = max;
        }
        if (_this._setInterval) {
            window.clearInterval(_this._setInterval)
            _this._setInterval = null;
        }
        _this._setInterval = setInterval(() => {
            if (_this._step < _this._max) {
                $('#' + _this.i).show();
                var features = priceTrend.data.get(_this._step)
                _this.source.addFeatures(features)
                var value = '(' + ((_this._step * 100) - (_this.step * 100)) + ' ~ ' + (_this._step * 100) + ') 元/月'
                $('#yearInfo').text('租金范围: ' + value);
                _this._step += step;
                _this.i++;
            } else {
                window.clearInterval(_this._setInterval);
            }
        }, 1000)
    }
}
var ctrl = {
    area: null,
    cityId: 2,
    swicthCity: function (area) {
        this.area = area;
        this.cityId = area.areaId;
        priceTrend.data.clear();
        priceTrend._step = null;
        priceTrend._max = null;
        priceTrend.step = null;
        priceTrend.i = 0;
        $('#yearInfo').text('');
        $('#legened').html('');
        if (priceTrend._setInterval != null) {
            window.clearInterval(priceTrend._setInterval)
        }
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
                var feat = priceTrend.source.getFormat().readFeatures(data)[0];
                var center = ol.extent.getCenter(feat.getGeometry().getExtent())
                if (center) {
                    $('#legend').html('');
                    $('#title').text('');
                    priceTrend.map.getView().setZoom(11)
                }
                ctrl.flyTos(center, 11, function () {
                    priceTrend.source.forEachFeature(function (feature) {
                        priceTrend.source.removeFeature(feature)
                    })
                    ctrl.getData();
                    priceTrend.view.fit(feat.getGeometry().getExtent(), {
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
                var features = priceTrend.features = priceTrend.source.getFormat().readFeatures(data);
                features.sort(ctrl.compare('rent_sqmprice'))
                var max = parseInt(features[0].getProperties()['rent_sqmprice']);
                var step = parseInt(max / 8)
                if (!ctrl.area)
                    ctrl.area = {
                        name: '北京市'
                    };
                ctrl.getHtmlLegend(ctrl.area.name,max,step);
                priceTrend.start(priceTrend.features, max, step);
            }
        })
    },
    on: function () {
        this.getPopup();
        var select = new ol.interaction.Select({
            condition: ol.events.condition.pointerMove
        });
        select.on('select', function (p1) {
            var feat = p1.selected[0];
            if (feat) {
                var data = feat.getProperties();
                var center = feat.getGeometry().getCoordinates();
                var value = parseFloat(data['rent_sqmprice']);
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
        var view = priceTrend.map.getView();
        var zoom = priceTrend.map.getView().getZoom();
        var parts = 2;
        var called = false;

        function callback(compvare) {
            --parts;
            if (called) {
                return;
            }
            if (parts === 0 || !compvare) {
                called = true;
                done(compvare);
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
    getHtmlLegend: function (title, max, step) {
        var html = '';
        var legend = $('#legened');
        legend.html('');
        $('#title').text(title + '租金');
        for (var i = 0; i < 8; i++) {
            var min = i * step;
            var max = (i + 1) * step;
            var value = min * 100 + ' ~ ' + max * 100;
            var fill = priceTrend.colors[i];
            var transform = 'translate(0,' + 24 * i + ')'
            var g =
                '<g id=' + i + ' onclick="ctrl.gClick(this)" transform=' + transform + ' style="cursor:pointer; display:none; " check=' + true + ' level=' + max + ' color=' + fill + '>' +
                '<rect width="30" height="20" fill=' + fill + '></rect>' +
                '<text x="38" y="14" fill="white" >' + value + ' 元/月</text>' +
                '</g>'
            html += g;
        }
        legend.html(html);
    },
    gClick: function (_this) {
        var jq = $(_this);
        var rect = jq.find('rect');
        var text = jq.find('text')
        var check = jq.attr('check');
        var data = priceTrend.data.get(parseInt(jq.attr('level')));
        if (check == 'true') {
            jq.attr('check', false)
            rect.attr('fill', '#999999')
            text.attr('fill', '#999999')
            data.forEach(function (d) {
                priceTrend.source.removeFeature(d)
            })
        } else {
            jq.attr('check', true)
            rect.attr('fill', jq.attr('color'))
            text.attr('fill', 'white')
            priceTrend.source.addFeatures(data)
        }
    }
}