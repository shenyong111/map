var hiveMap = {
    init(url){
        hive.getHiveMap(url)
        this.ctrl()
        echart.initRadar();
        $('#tabTbody').html('')
        echart.setRadar([])
    },
    ctrl(){
        let self = this;
        var gridSelectStyle = function (feature, resolution) {
            let color =  feature['color'];
            color[3] = 1
           return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#ffffff',
                    width: 50/resolution
                }),
                fill: new ol.style.Fill({
                    color: color
                })
            });
        };
        var gridSelect = new ol.interaction.Select({
            // condition: ol.events.condition.pointerMove,
            style: gridSelectStyle
        });
        var population = 0;
        var selectedGridCells = gridSelect.getFeatures();
        selectedGridCells.on('add', function (feature) {
            var features = feature.element.getProperties().features;
            features.sort(main.compare('avg_price'))
            let html = '';
            let rF = []
            features.forEach((f) => {
                let fg = f.getProperties();
                let avg_price = fg.avg_price
                if (avg_price != 0 && avg_price != null) {
                    html +=
                        '<tr>' +
                        '<td>' + fg.label + '</td>' +
                        '<td>' + avg_price + '</td>' +
                        '</tr>'
                    rF.push(f)
                }
            })
            $('#tabTbody').html(html)
            $('#PanelRight').css('left','20px');
            echart.setRadar(rF)
        });

        selectedGridCells.on('remove', function (feature) {
            $('#tabTbody').html('')
            echart.setRadar([])
        });
        map.addInteraction(gridSelect);
    }
}
//蜂巢
var hive = {
    getHiveMap: function (url) {
        $.getJSON(url, function (data) {
            var source = new ol.source.Vector({
                format: new ol.format.GeoJSON({
                    featureProjection: 'EPSG:3857'
                })
            });
            var features = source.getFormat().readFeatures(data)
            source.addFeatures(features)
            var modify = new ol.interaction.Modify({
                source: source
            });
            modify.setActive(false);
            map.addInteraction(modify);
            var layerSource = new ol.layer.Vector({
                source: source,
                visible: false,
                projection: 'EPSG:4326'
            })
            map.addLayer(layerSource);
            var hexbin, layer, min = 0, max = 0;
            var styleFn1 = function (f, res) {
                var color, index = 0;
                var features = f.get('features')
                for (let i in features) {
                    let f = features[i];
                    let attr = f.getProperties();
                    if (attr.avg_price != null) {
                        index += parseInt(attr.avg_price)
                    } else {
                        attr.avg_price = 0
                    }
                }
                index = index / features.length
                // if(index != NaN) {
                //     if (index < min) {
                //         min = index;
                //     } else if (index > max) {
                //         max = index
                //     }
                // }
                color = main.getColor(index)
                f['color'] = color
                let style = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: color
                    })
                })
                return style
            };
            var styleFn = function (f,res) {
                debugger
                var color;
                var size = f.get('features').length;
                color  = main.getColor2(size)
                f['color'] = color
                return [new ol.style.Style({fill: new ol.style.Fill({color: color})})];
            }
            function reset() {
                var size = 600;
                if (layer) {
                    map.removeLayer(layer);
                }
                hexbin = new ol.source.HexBin({
                    source: source,
                    size: size
                });
                layer = new ol.layer.Vector({source: hexbin, opacity: 0.8, style: styleFn});
                map.addLayer(layer);
            }

            reset();
        });
    }
}
//main
var main = {
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
    getColor(value) {
        var colors = {
            0: 'rgba(255,255,255,0.1)',
            20000: 'rgba(250,252,185,1)',
            40000: 'rgba(254,254,115,1)',
            60000: 'rgba(254,254,1,1)',
            80000: 'rgba(255,211,1,1)',
            100000: 'rgba(254,169,1,1)',
            120000: 'rgba(254,139,1,1)',
            140000: 'rgba(252,70,0,1)',
            160000: 'rgba(255,0,0,1)',
        }
        if (value == NaN || value == 0) {
            return colors[0]
        } else if (value > 0 && value <= 20000) {
            return colors[20000]
        } else if (value > 20000 && value <= 40000) {
            return colors[40000]
        } else if (value > 40000 && value <= 60000) {
            return colors[60000]
        } else if (value > 60000 && value <= 80000) {
            return colors[80000]
        } else if (value > 80000 && value <= 100000) {
            return colors[100000]
        } else if (value > 100000 && value <= 120000) {
            return colors[120000]
        } else if (value > 120000 && value <= 140000) {
            return colors[140000]
        } else if (value > 140000) {
            return colors[160000]
        }
    },

    getColor2(value) {
        var colors = {
            5: 'rgba(47,245,247,1)',
            10: 'rgba(47,247,80,1)',
            15: 'rgba(255,234,0,1)',
            20: 'rgba(255,168,0,1)',
            25: 'rgba(255,0,0,1)',
            30: 'rgba(255,0,0,1)',
        }
        if (value > 0 && value <= 5) {
            return colors[5]
        } else if (value > 5 && value <= 10) {
            return colors[10]
        } else if (value > 10 && value <= 15) {
            return colors[15]
        } else if (value > 15 && value <= 20) {
            return colors[20]
        } else if (value > 20 && value <= 25) {
            return colors[25]
        } else if (value > 25){
            return colors[30]
        }
    }
}

//echart
var echart = {
    pieChart:null,
    radarChart:null,
    init(){
        let pie = document.getElementById('lineBarECharts')
        this.pieChart = echarts.init(pie);
    },
    initRadar(){
        let pie = document.getElementById('lineBarECharts')
        this.radarChart = echarts.init(pie);
    },
    /*
    * 获取option
    * */
    getPieOption(data) {
        let gd  = [];
        let seriesData =  []
        for(let i in data){
            let d = data[i]
            let attr = d.getProperties();
            let value = {
                value:attr.avg_price,
                name:attr.label,
            }
            gd.push(attr.label)
            seriesData.push(value)
        }
        let option = {
            title: {
                show: true
            },
            tooltip: {
                trigger: 'item',
                //formatter: "{b} : {c}元 ({d}%)",
                formatter: "{b} : {c} (元)"
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                data:gd
            },
            series: [{
                name: '小区',
                type: 'pie',
                // radius: '40%',
                // center: ['50%', '50%'],
                avoidLabelOverlap: false,
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                data:seriesData,
                // itemStyle: {
                //     emphasis: {
                //         shadowBlur: 10,
                //         shadowOffsetX: 0,
                //         shadowColor: 'rgba(0, 0, 0, 0.5)'
                //     }
                // },
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        show: true,
                        textStyle: {
                            fontSize: '30',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
            }]
        };
        return option;
    },

    /*
    * 设置pie
    * */
    setPie(data){
        this.pieChart.setOption(this.getPieOption(data))
    },
    /*
    * 雷达
    * */
    getRadarChart(data) {
        var length = data.length,
            max = 0,
            avg = 0,
            min = 0,
            total = 0,
            values = [];
        for (let i in data) {
            let d = data[i]
            let attr = d.getProperties();
            let price = parseFloat(attr.avg_price);
            total += price;
            values.push(price)
        }
        values.sort((a, b) => {
            return a - b;
        });
        max = values[length - 1];
        min = values[0];
        avg = parseInt(total / length);
        var indicator = [
            {name: '最高价:'+ max+'（元）', max: max + 10000},
            {name: '平均价:'+ avg+'（元）', max: max},
            {name: '最低价:'+ min+'（元）', max: max}
        ]
        if(max == null || min == null){
            indicator = [
                {name: '最高价:'+ '--'+'（元）', max: max + 10000},
                {name: '平均价:'+ '--'+'（元）', max: max},
                {name: '最低价:'+ '--'+'（元）', max: max}
            ]
        }
        var option = {
            // title: {
            //     text: '房价雷达图'
            // },
            tooltip: {
                show:false
            },
            // legend: {
            //     data: ['房价']
            // },
            radar: {
                shape: 'circle',
                radius: '60%',
                name: {
                    textStyle: {
                        color: '#fff',
                        backgroundColor: '#999',
                        borderRadius: 3,
                        padding: [3, 3, 3, 3]
                    }
                },
                indicator: indicator
            },
            series: [{
                name: '房价',
                type: 'radar',
                // areaStyle: {normal: {}},
                data: [{
                    value: [max, avg, min],
                    name: '价格信息:'
                }]
            }]
        };
        return option;
    },
    /*
    * 设置radar
    * */
    setRadar(data){
        this.radarChart.setOption(this.getRadarChart(data))
    },
}
