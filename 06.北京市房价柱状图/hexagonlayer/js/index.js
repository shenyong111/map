var layer = null;
var popup = null;
var allData = {
    data:null,
    zhuzhai: [],
    shangye: [],
    bangong: [],
    gongye: []
}
var bMapName = 'ChinaGray';
var bMapUrl = "http://lbsapi.cindata.cn/gis/v1/services/export?F=image&FORMAT=PNG32&TRANSPARENT=true&SIZE=256%2C256&BBOX={bbox-epsg-3857}&BBOXSR=3857&IMAGESR=3857&DPI=90&keyCode=b2591c9c1cc449fba658802d07944954&mapCode=1_base_map_fe9e51abd96b7a041ab6f883eda91349";
const deckgl = new deck.DeckGL({
    mapboxApiAccessToken: '',
    //mapStyle: 'https://free.tilehosting.com/styles/darkmatter/style.json?key=U0iNgiZKlYdwvgs9UPm1',
    mapStyle: {
        "version": 8,
        "sources": {
            "bmap": {
                "type": "raster",
                "tiles": [bMapUrl],
                "tileSize": 256
            }
        },
        "layers": [{
            "id": "baseMap",
            "type": "raster",
            'source': 'bmap',
            'source-layer': bMapName,
            "interactive": true
        }]
    },
    longitude: 116.3975851110,
    latitude: 39.9087935437,
    zoom: 10,
    minZoom: 10,
    maxZoom: 19,
    pitch: 50,
    bearing: 0
});
const OPTIONS = ['radius', 'coverage', 'upperPercentile'];

const LIGHT_SETTINGS = {
    lightsPosition: [-122.5, 37.7, 3000, -122.2, 37.9, 3000], // 指定为`[x，y，z]`的光在平面阵列中的位置
    ambientRatio: 0.2,   //光照的环境比例
    diffuseRatio: 0.5,  //光的漫反射率
    specularRatio: 0.3, //光的镜面反射率
    lightsStrength: [1.0, 0.0, 2.0, 0.0], //平面阵列中指定为“[x，y]`的灯的强度。 长度应该是`2 x numberOfLights`
    numberOfLights: 2 //光照值
};

// OPTIONS.forEach(key => {
//   document.getElementById(key).oninput = renderLayer;
// });
//生成从minNum到maxNum的随机数
function randomNum(minNum,maxNum){
    switch(arguments.length){
        case 1:
            return parseInt(Math.random()*minNum+1,10);
            break;
        case 2:
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
            break;
        default:
            return 0;
            break;
    }
}
function renderLayer (data,colorRange) {
    if (colorRange == null) {
        colorRange = [
            [70, 186, 57],
            [178, 100, 255],
            [87, 130, 255],
            [31, 186, 197]
        ]
    }
    return new HexagonLayer({
        id: 'heatmap',
        colorRange: colorRange,
        data: data,
        pickable: true,
        extruded: true,
        radius: 80,
        autoHighlight: false,
        upperPercentile: 99,
        coverage: 0.5,
        elevationScale: 2,
        opacity: 0.5,
        lightSettings: LIGHT_SETTINGS,
        getPosition: (feature) => {
            if (!feature.latitude || !feature.longitude) {
                return [0, 0]
            }
            return [Number(feature.longitude), Number(feature.latitude)]
        },
        getElevationValue: (feature) => {
            if (feature[0].standard_p == '' || feature[0].standard_p == ' ' || feature[0].standard_p == undefined || feature[0].standard_p == 'undefined') {
                feature[0].standard_p = 0;
            }
            return Number(feature[0].standard_p);
        },
        getColorValue: (feature) => {
            if (feature[0].residentia == '住宅') {
                return 1;
            }
            if (feature[0].residentia == '商业服务') {
                return 2;
            }
            if (feature[0].residentia == '办公') {
                return 3;
            }
            if (feature[0].residentia == '工业') {
                return 4;
            }
        },
        onHover: (feature) => {
            let tooltip = document.getElementById('tooltip');
            if (feature.object) {
                tooltip.style.display = 'block'
                let html = '';
                let len = feature.object.points.length;
                for (let i = 0; i < len; i++) {
                    let point = feature.object.points[i]
                    let name = point.communityn
                    let price = Number(point.standard_p);
                    if (price == 0) {
                        price = '- - ' + '万/㎡';
                    } else {
                        price = (price / 10000).toFixed(2) + '万/㎡';
                    }
                    html +=
                        '<div>' +
                        name + ' : ' + price
                    '</div></br>'
                }
                tooltip.innerHTML = html
                tooltip.style.top = `${feature.y}px`;
                tooltip.style.left = `${feature.x}px`;
            } else {
                tooltip.style.display = 'none'
            }
        }
    });
}
$('#legened g').on('click',function (e) {
    let color = $(this).find('text').attr('color')
    let selected = $(this).find('text').attr('value')
    if (selected == 'true') {
        $(this).find('rect').css('fill', '#B5B5B5');
        $(this).find('text').css('fill', '#B5B5B5');
        $(this).find('text').attr('value', false);
    } else {
        $(this).find('rect').css('fill', color);
        $(this).find('text').css('fill', 'black');
        $(this).find('text').attr('value', true)
    }
    filterData();
})
function filterData() {
    let colorRange = [];
    // let typeColor = {
    //     '住宅': [[70, 186, 57, 0]],
    //     '商业': [[178, 100, 255, 0]],
    //     '办公': [[87, 130, 255, 0]],
    //     '工业': [[70, 186, 57, 0]],
    // }
    $('#legened g').children('text').each(function () {
        let value = $(this).attr('value');
        let text = $(this).text();
        if (text == '住宅') {
            if (value == 'true') {
                colorRange[0] = [70, 186, 57]
            } else {
                colorRange[0] = [70, 186, 57, 0]
            }
        }
        if (text == '商业') {
            if (value == 'true') {
                colorRange[1] = [178, 100, 255]
            } else {
                colorRange[1] = [178, 100, 255, 0]
            }
        }
        if (text == '办公') {
            if (value == 'true') {
                colorRange[2] = [87, 130, 255]
            } else {
                colorRange[2] = [87, 130, 255, 0]
            }
        }
        if (text == '工业') {
            if (value == 'true') {
                colorRange[3] = [31, 186, 197]
            } else {
                colorRange[3] = [31, 186, 197, 0]
            }
        }
    })
    let tmpLayer = renderLayer(allData.data, colorRange);
    deckgl.setProps({
        layers: [tmpLayer]
    });
}
d3.csv('data/xiaoqu.csv', (error, response) => {
    allData.data = response.map(t => t)
    layer = renderLayer(allData.data);
    deckgl.setProps({
        layers: [layer]
    });
});
