var SVGWidth = $(document).width() - 300;
var SVGHeight = $(document).height() - 100;
var barConfig =null;
if(SVGWidth > 1580) {
    barConfig = {
        barHeight: 50,
        yValue: 14,
        yText: 7,
        barInfo: 'barInfo'
    }
}else {
    barConfig = {
        barHeight: (20 * 668) / SVGHeight,
        yValue: (16 * 668) / SVGHeight,
        yText: (7 * 668) / SVGHeight,
        barInfo: 'barInfo',
    }
}

if(SVGHeight <= 700){
    barConfig = {
        barHeight : 12,
        yValue:9,
        yText:6,
        barInfo:'barInfo_1',
    }
    barConfig.barInfo = 'barInfo_1'
}
const config = {
    SVGWidth:       SVGWidth,
    SVGHeight:      SVGHeight,
    TimerFontSize:  "50px",
    MaxNumber:      25,
    Padding:{
        left:       150,
        right:      150,
        top:        50,
        bottom:     50
    },
    ColorClass:     ["A", "B", "C", "D", "E", "F","G","H","I"],
    IntervalTime:   0.7,
    XTicks:         10
}