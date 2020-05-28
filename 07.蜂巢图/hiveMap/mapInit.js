var view = new ol.View({
    // center: [12776243.127554342, 2520578.618542334],
    center: [12956654.349363782, 4852461.421256379],
    zoom: 11,
    maxZoom: 18,
    minZoom: 10,
    projection: 'EPSG:102113',
    extent: [7107053.740285003, -80822.9193149989, 16061315.281015012, 8587942.610615],
})
var map = new ol.Map({
    target: 'map',
    view: view,
    controls: ol.control.defaults({attribution: false}).extend([new ol.control.Attribution({
        collapsible: false
    })])
})
var base = {
    layer: null,
    /*
    * 底图初始化
    * */
    initGXD() {
        let gxd = new ol.layer.Tile({
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
        gxd.setZIndex(-1);
        return gxd;
    },
    /*
     * 公司黑色底图
     * */
    initGxdBlack() {
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
        // var url = 'http://111.40.214.181/arcgis/rest/services/comm/ChinaBlack/MapServer'
        // var gxd = new ol.layer.Tile({
        //     preload: 80,
        //     source: new ol.source.TileArcGISRest({
        //         url: url,
        //         wrapX: false
        //     }),
        //     zIndex: 0
        // })
        // gxd.set('id', 'base');
        // return gxd;
    },
    /*
    * 影像地图
    * */
    initSatellites: function () {
        let url = "http://tilesvc.cindata.cn/arcgis/rest/services/comm/googleMapNew/MapServer";
        let sateLayers = new ol.layer.Tile({
            source: new ol.source.TileArcGISRest({
                url: url
            })
        })
        sateLayers.set('id', 'base');
        sateLayers.setZIndex(-1);
        return sateLayers;
    },
    /*
    * 切换
    * */
    switch(id) {
        if (this.layer) {
            map.removeLayer(this.layer)
        }
        switch (id) {
            case 'gxd': {
                this.layer = this.initGXD();
            }
                break;
            case 'sateLayers': {
                this.layer = this.initSatellites();
            }
                break;
            case 'black': {
                this.layer = this.initGxdBlack();
            }
                break;
        }
        return this.layer
    }
}
map.addLayer(base.switch('gxd'))
$('.ol-zoom-in').attr('title','放大');
$('.ol-zoom-out').attr('title','缩小');