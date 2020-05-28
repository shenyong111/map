var gradientColor = {
    getGradientColor: function (obj, colorA, colorB) {
        var ColorA = colorA;
        var ColorB = colorB;
        var styleList = new Array();
        var colorList = new Array();
        var Gradient = new Array(3);
        var A = this.color2rgb(ColorA);
        var B = this.color2rgb(ColorB);
        var list = obj;
        for (var N = 0; N <= list.length; N++) {
            for (var c = 0; c < 3; c++) { // RGB通道分别进行计算
                Gradient[c] = A[c] + (B[c] - A[c]) / list.length * N;
            }
            styleList[list[N]] = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 4,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0,0,0,0.0)',
                    }),
                    fill: new ol.style.Fill({color: 'rgb(' + Gradient.join(',') + ')'})
                })
            })
            colorList[list[N]] = 'rgb(' + Gradient.join(',') + ')';
        }
        return [styleList,colorList];
    },
    // 颜色#FF00FF格式转为Array(255,0,255)
    color2rgb: function (color) {
        var r = parseInt(color.substr(1, 2), 16);
        var g = parseInt(color.substr(3, 2), 16);
        var b = parseInt(color.substr(5, 2), 16);
        return new Array(r, g, b);
    },
    // 颜色Array(255,0,255)格式转为#FF00FF
    rgb2color: function rgb2color(rgb) {
        var s = "#";
        for (var i = 0; i < 3; i++) {
            var c = Math.round(rgb[i]).toString(16);
            if (c.length == 1)
                c = '0' + c;
            s += c;
        }
        return s.toUpperCase();
    }
}