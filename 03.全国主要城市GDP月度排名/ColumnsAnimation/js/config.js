
var SVGWidth = $(document).width() - 300;
var SVGHeight = $(document).height() - 100;
var barConfig = {
    barHeight : 18,
    yValue:14,
    yText:7,
    barInfo:'barInfo'
}
//SVGHeight = 668
if(SVGHeight <= 668){
    barConfig = {
        barHeight : 8,
        yValue:8,
        yText:2,
        barInfo:'barInfo_1',
    }
}
const config = {
    SVGWidth:       SVGWidth,
    SVGHeight:      SVGHeight,
    TimerFontSize:  "100px",
    MaxNumber:      25,
    Padding:{
        left:       150,
        right:      150,
        top:        50,
        bottom:     50
    },
    ColorClass:     ["A", "B", "C", "D", "E", "F"],
    IntervalTime:   1,
    XTicks:         10
}