/**
 *   openlayer脚本
 * */
var olStyle = function () {
    var drawLayerStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#139619',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(175,230,177,0.2)'
        }),
    });
    var modifyLayerStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#FF9000',
            width: 3
        }),
        fill: new ol.style.Fill({               //填充样式
            color: 'rgba(255,225,187, 0.2)'
        })
    });
    var drawInteractionStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#139619',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(175,230,177,0.2)'
        }),
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: 'white'
            }),
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
            }),
        })
    });
    var selectInteractionStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#E82828',
            width: 2
        }),
        fill: new ol.style.Fill({               //填充样式
            color: 'rgba(253,187,187, 0.2)'
        })
    });
    var modifyInteractionStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#FF9000',
            width: 2
        }),
        fill: new ol.style.Fill({               //填充样式
            color: 'rgba(255,225,187, 0.2)'
        }),
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: 'white'
            }),
            stroke: new ol.style.Stroke({
                color: '#FF9000',
                width: 2
            }),
        })
    });
    var gr_area_2301_LayerStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#139619',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(175,230,177,0.2)'
        }),
    });
    var community_LayerStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'green',
            width: 3
        })
    });
    return {
        drawLayerStyle: drawLayerStyle,
        modifyLayerStyle: modifyLayerStyle,
        drawInteractionStyle: drawInteractionStyle,
        selectInteractionStyle: selectInteractionStyle,
        modifyInteractionStyle: modifyInteractionStyle,
        gr_area_2301_LayerStyle: gr_area_2301_LayerStyle,
        community_LayerStyle: community_LayerStyle
    }
}();