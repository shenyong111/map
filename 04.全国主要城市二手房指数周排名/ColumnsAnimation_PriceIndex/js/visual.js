/*var date=[];
TotalData.forEach(elem => {
    if (date.indexOf(elem["date"]) == -1)
        date.push(elem["date"]);
});
TotalData.sort((a,b) => {
    let value = 'value'
    var value1 = a[value] == undefined ? 0 : a[value];
    var value2 = b[value] == undefined ? 0 : b[value];
    return value2 - value1;
})
//var date=date.sort((x,y)=>new Date(x)-new Date(y)); //有问题
var date=date.sort((x,y)=> {
    return Date.parse(x) - Date.parse(y);
});*/
const svg=d3.select('body').append('svg')
    .attr('width', config.SVGWidth)
    .attr('height', config.SVGHeight)
    .attr("transform", "translate(150,0)");
const innerWidth = config.SVGWidth - config.Padding.left - config.Padding.right;
const innerHeight = config.SVGHeight - config.Padding.top - config.Padding.bottom - 50;
const intervalTime=config.IntervalTime;


// Drawing Config
const xValue = d => Number(d.value);
const yValue = d => d.name;

const g = svg.append('g')
    .attr('transform', `translate(${config.Padding.left},${config.Padding.top})`);
const xAxisG = g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`);
const yAxisG = g.append('g');

xAxisG.append('text')
    .attr('class', 'axis-label')
    .attr('x', innerWidth / 2)
    .attr('y', 100);
    
const xScale = d3.scaleLinear()
const yScale = d3.scaleBand()
    .paddingInner(0.3)
    .paddingOuter(0);

const xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(config.XTicks)
    .tickPadding(20)
    .tickFormat(d => d)
    .tickSize(-innerHeight);

const yAxis = d3.axisLeft()
    .scale(yScale)
    .tickPadding(5)
    .tickSize(-innerWidth);

var timeCounter={"value": 0};
const timer = g.append("text")
    .attr('class', 'timer')
    .attr('font-size', config.TimerFontSize)
    .attr('fill-opacity', 0)
    .attr('x', innerWidth-200)
    .attr('y', innerHeight)
var tmp1 = 0;
function getColorClass(d) {
    // var tmp=0;
    // for (let index = 0; index < d.name.length; index++)
    //     tmp = tmp + d.name.charCodeAt(index);
    // return config.ColorClass[tmp%config.ColorClass.length];
    if (tmp1 == 9) {
        tmp1 = 0
    }
    let color = config.ColorClass[tmp1]
    tmp1++;
    return color;
}

function getDataByDate(date) {
    isFirst=0;
    timeCounter.value=Number(date);

    var data=[];
    TotalData.forEach(elem => {
        if (elem["date"] == date)
            data.push(elem);
    });
    return data.slice(0, config.MaxNumber)
}
function refreshTime() {
    timer.transition().duration(intervalTime*2000).delay(intervalTime*1000*isFirst).ease(d3.easeLinear)
        .attr('fill-opacity', 1)
        .tween("text", function(d){
            var self = this;
            return function (t) {
                self.textContent = timeCounter.value.split('-')[0]+'年'+'第'+getWeek(timeCounter.value)+'周';
            };

        })

}
function refresh(data) {
    yScale
        .domain(data.map(yValue).reverse())
        .range([innerHeight, 0]);
    xScale
        .domain([0, d3.max(data, xValue) <= 350 ? 350 : d3.max(data, xValue)]).range([0, innerWidth]);
    xAxisG
        .transition(g).duration(3000 * intervalTime).ease(d3.easeLinear).call(xAxis);
    yAxisG
        .transition(g).duration(3000 * intervalTime).ease(d3.easeLinear).call(yAxis);
    yAxisG
        .selectAll('.tick').remove();
    timer.data(data)
        .transition().duration(intervalTime*2000).delay(intervalTime*1000*isFirst).ease(d3.easeLinear)
        .attr('fill-opacity', 1)
        .tween("text", function(d){
            var self = this;
            var i = d3.interpolate(self.textContent, timeCounter.value);
            return function (t) {
                //self.textContent = Math.round(i(t));
                // let year = d.date.split('-')[0];
                // let month = d.date.split('-')[1]
                // self.textContent = year + '年' + month + '月'
                self.textContent = timeCounter.value.split('-')[0]+'年'+'第'+getWeek(timeCounter.value)+'周';
            };

        })


    // start
    var bar = g.selectAll(".bar")
        .data(data, function (d) {
            return d.name;
        });

    // Enter Items
    var barEnter = bar.enter().insert("g", ".axis")
        .attr("class", "bar")
        .attr("transform", function (d) {
            return "translate(0," + yScale(yValue(d)) + ")";
        });
    barEnter.append("g")
        .attr("class", function (d) {
            return getColorClass(d);
        })

    barEnter.append("rect")
        .attr("width", d => xScale(xValue(d)))
        .attr("fill-opacity", 0)
        .attr("height", barConfig.barHeight).attr("y", 50) //柱状图的高度
        .transition("a")
        .attr("class", d => getColorClass(d))
        .delay(500 * intervalTime)
        .duration(2490 * intervalTime)
        .attr("y", 0)
        .attr("width", d => xScale(xValue(d)))
        .attr("fill-opacity", 1);

    barEnter.append("text")
        .attr("y", 50)
        .attr("fill-opacity", 0)
        .transition("2")
        .delay(500 * intervalTime)
        .duration(2490 * intervalTime)
        .attr("fill-opacity", 1)
        .attr("y", 0)
        .attr("class", function (d) {
            //console.log("label " + getColorClass(d))
            return  "label "/* + getColorClass(d) */+ ' leftText'
        })
        .attr("x", -5) //位置
        .attr("y", barConfig.yValue) //x位置
        .attr("text-anchor", "end")
        .text(d => d.name);

    barEnter.append("text") //left
        .attr("x", d => xScale(xValue(d)))
        .attr("y", 50)
        .attr("fill-opacity", 0)
        .text(d => d.value)
        .transition()
        .delay(500 * intervalTime)
        .duration(2490 * intervalTime)
        .attr("fill-opacity", 1).attr("y", 0)
        .attr("class", function (d) {
            return "value " + getColorClass(d)
        })
        .tween("text", function (d) {
            var self = this;                      // why?
            var i = d3.interpolate(self.textContent, Number(d.value));
            return function (t) {
                self.textContent = Math.round(i(t));
            };
        })
        .attr("x", d => xScale(xValue(d)) + 10)
        .attr("y", barConfig.yValue); //value位置

    barEnter.append("text").attr("x", d => xScale(xValue(d)))
        .attr("stroke", function (d) {
            //return $("." + getColorClass(d)).css("fill");
            return $(".W").css("fill");
        })
        .attr("class", barConfig.barInfo)
        .attr("y", 50).attr("stroke-width", "0px")
        .attr("fill-opacity", 0)
        .transition()
        .delay(500 * intervalTime)
        .duration(2490 * intervalTime)
        .text(d => d.name)
        .attr("x", d => xScale(xValue(d)) - 10)
        .attr("fill-opacity", 1)
        .attr("y", barConfig.yText) //Y轴字体位置
        .attr("dy", ".5em")
        .attr("text-anchor", "end")
        .attr("stroke-width", "1px");

    // Update Items
    var barUpdate = bar.transition().duration(2990 * intervalTime).ease(d3.easeLinear);

    barUpdate.select("rect")
        .attr("width", d => xScale(xValue(d)))
    barUpdate.select("." + barConfig.barInfo)
        .attr("x", d => xScale(xValue(d)) - 10)
        .attr("fill-opacity", 1)
        .attr("stroke-width",  "1px")

    barUpdate.select(".value")
        .tween("text", function (d) {
            var self=this;
            var i = d3.interpolate(self.textContent, Number(d.value));
            return function (t) {
                self.textContent = Math.round(i(t));
            };
        })
        .duration(2990 * intervalTime)
        .attr("x", d => xScale(xValue(d)) + 10)


    // Exit Items
    var barExit = bar.exit()
        .attr("fill-opacity", 1)
        .transition().duration(2500 * intervalTime)

    barExit
        .attr("transform", "translate(0," + 780 + ")")
        .remove()
        .attr("fill-opacity", 0);

    barExit.select("rect")
        .attr("fill-opacity", 0)
    barExit.select(".value")
        .attr("fill-opacity", 0)
    barExit.select("." + barConfig.barInfo)
        .attr("fill-opacity", 0)
        .attr("stroke-width", "0px");

    bar.data(data, d => d.name)
        .transition()
        .delay(500 * intervalTime)
        .duration(2490 * intervalTime)
        .attr("transform", function (d) {
            return "translate(0," + yScale(yValue(d)) + ")";
        });
}
var inter = null;
var iter = 1, isFirst = 1;
// var curYearMonth = '2016-01';
var curDate = addDate(getFormateDate(),-180);
function autoPlay() {
    var myAuto = document.getElementById('myaudio');
    // refresh(getDataByDate(date[0]));
    queryData(curDate,queryCallback);
    inter = setInterval(function next() {
        if (isTimeOut()) {
            closePlay()
        }else{
            if(myAuto.paused) {
                myAuto.play();
            }
            queryData(curDate,queryCallback);
            // refresh(getDataByDate(date[iter++]));
        }
    }, 3600 * intervalTime);
}
function isTimeOut(){
    // var year = Number(curDate.split('-')[0]);
    // var month = Number(curDate.split('-')[1]);
    // var myDate = new Date();
    // var endYear = myDate.getFullYear();
    // var endMonth = myDate.getMonth()+1;
    // return year>=endYear && month>=endMonth;
    return new Date(curDate).getTime()>new Date().getTime();
}
function queryData(curDate,callback){
    $.ajax({
        url: 'http://lbsapi.cindata.cn/es/query/area_index',
        type: 'GET',
        async: false,
        data:{
            keyCode:'fca88377aa5a4fd3b9e614c2ed12f05d',
            url:'area_index',
            area_level:2,
            str_type:'esf',
            cycle_type:'Week',
            is_provincial_capital:1,
            if_fine_quality:1,
            gte:curDate,
            lte:addDate(curDate,6),
            page_size:120,
            page_count:1,
        },
        success:callback,
    })
}
function queryCallback(response){
    isFirst=0;
    timeCounter.value = curDate;
    curDate = addDate(curDate,7);
    var data = response.data;
    if(data.length==0 ||data.length<20){
        refreshTime();
        return;
    }
    var newData = [];
    for(var i = 0;i<data.length;i++){
        newData.push({
            name: data[i].name,
            value: data[i].price_index,
            date: data[i].index_date,
            sort: curDate.split('-')[0] + curDate.split('-')[1],
        });
    }
    var reankedData = newData.sort(function(a,b){
        var value1 = a['value'] == undefined ? 0 : a['value'];
        var value2 = b['value'] == undefined ? 0 : b['value'];
        return value2 - value1;
    });
    var topReankedData = reankedData.slice(0, config.MaxNumber);
    refresh(topReankedData);
}
function getNextYearMonth(curYearMonth){
    var year = curYearMonth.split('-')[0];
    var month = curYearMonth.split('-')[1];
    var nextYear = Number(year);
    var nextMonth = Number(month)+1;
    if(nextMonth>0&&nextMonth<10){
        return nextYear+'-0'+nextMonth;
    }else if(nextMonth>=10&&nextMonth<=12){
        return nextYear+'-'+nextMonth;
    }else if(nextMonth==13){
        return (nextYear+1)+'-01';
    }
}
function getFormateDate(conector){
    if(!conector)conector='-';
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth()+1;
    var day = d.getDate();
    return year + conector + (month<=9?('0'+month):month) + conector + (day<=9?('0'+day):day);
}
function addDate(date,days){
    var d = new Date(date);
    d.setDate(d.getDate()+days);
    var year = d.getFullYear();
    var month = d.getMonth()+1;
    var day = d.getDate();
    return year + '-' + (month<=9?('0'+month):month) + '-' + (day<=9?('0'+day):day);
}
function getWeek(dt){
    var d1 = new Date(dt);
    var d2 = new Date(dt);
    d2.setMonth(0);
    d2.setDate(1);
    var rq = d1-d2;
    var days = Math.ceil(rq/(24*60*60*1000));
    var num = Math.ceil(days/7);
    return num;
}
function closePlay() {
    iter = 0
    var myAuto = document.getElementById('myaudio');
    myAuto.pause();
    myAuto.load();
    window.clearInterval(inter);
}
//autoPlay();
window.onload  = ()=>{
    $('#play').click();
}
