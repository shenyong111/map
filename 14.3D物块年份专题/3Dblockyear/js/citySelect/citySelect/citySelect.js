$(function(){
    initCitySelect();

    $(".citySelect-btn").click(function(){
        $(".citySelect-btn.select").removeClass("select");
        $(this).addClass("select");
        if($(this).attr("id")=="citySelect-province"){
            $("#citySelect-alphabetic-city").hide();
            $("#citySelect-city-list").hide();
            $("#citySelect-alphabetic-province").show();
            $("#citySelect-province-list").show();
        }else{
            $("#citySelect-alphabetic-province").hide();
            $("#citySelect-province-list").hide();
            $("#citySelect-alphabetic-city").show();
            $("#citySelect-city-list").show();
        }
        $("#citySelect-list").height($("#citySelect-content").height()-
                    $("#citySelect-popular").height()-
                    $("#citySelect-toolbar").height()-5);
        $(".citySelect-alphabetic").find("li.select").removeClass("select");
        $("#citySelect-list").scrollTop(0);
    });

    $("#citySelect-show").click(function(e){
        if($("#citySelectDiv").is(":hidden")){
            showFrame("citySelect");
            $("#citySelect-list").height($("#citySelect-content").height()-
                    $("#citySelect-popular").height()-
                    $("#citySelect-toolbar").height()-5);
        }else{
            hideFrame("citySelect");
        }
        e.stopPropagation();
    });

    $(document).on("click",".citySelect-list li,#citySelect-popular li",function(){
        var area = JSON.parse($(this).attr("value"));
        changeCity(area);
    });

    $(document).on("click","#citySelect-alphabetic-province li",function(){
        $("#citySelect-alphabetic-province").find("li.select").removeClass("select");
        $("#citySelect-province-list").find("dt[value="+$(this).text()+"]")[0].scrollIntoView(true);
        $(this).addClass("select");
    });
    $(document).on("click","#citySelect-alphabetic-city li",function(){
        $("#citySelect-alphabetic-city").find("li.select").removeClass("select");
        $("#citySelect-city-list").find("dt[value="+$(this).text()+"]")[0].scrollIntoView(true);
        $(this).addClass("select");
    });

    $(document).on("click",function(e){
        if($(e.target).parents("#citySelectDiv").length == 0&&
            !$("#citySelectDiv").is(":hidden"))
        {
            hideFrame("citySelect");
        }
    });

    var i = setInterval(function(){
		if($.Autocomplete){
		    clearInterval(i);
			//自动like列表
            $('#citySelect-search-input').autocomplete({
                serviceUrl : 'http://lbs.cindata.cn/gxdyun/area/findCityByKey',
                noCache : false,
                type:"POST",
                paramName : 'key',
                matchContains : true,
                triggerSelectOnValidInput : false,
                containerClass : "autocomplete-suggestions-citySelect",
                transformResult : function(response) {
                    return {
                        suggestions : $.map($.parseJSON(response), function(
                                        dataItem) {
                                    return {
                                        value : dataItem.name,
                                        data : dataItem.areaId,
                                        zoneNumber : dataItem.zoneNumber
                                    };
                                })
                    };
                },
                onSelect : function(suggestion) {
                    changeCity({name:suggestion.value,areaId:suggestion.data,zoneNumber:suggestion.zoneNumber});
                },
                onSearchStart : function(){
                }
            });
		}
	},50);

});

function showFrame(id){
	$("#"+id+"-show").addClass("select");
	$("#"+id+"-show").find("img").attr("src","http://gisapi.cindata.cn/project/citySelect/images/more1.png");
	$("#"+id+"Div").show();
}

function hideFrame(id){
	$("#"+id+"-show").removeClass("select");
	$("#"+id+"-show").find("img").attr("src","http://gisapi.cindata.cn/project/citySelect/images/more.png");
	$("#"+id+"Div").hide();
}
//初始化
function initCitySelect(){
	$.ajax({
		url:"http://lbs.cindata.cn/gxdyun/area/findProvinceAndCity",
		type:"POST",
		success:function(provinceData){
			var provinceCodeHeadArray = [];
			var codeHead = null;
			var parentArea = null;
			var html = '';
			for(var i=0;i<provinceData.length;i++){
				if(provinceData[i].citys&&provinceData[i].citys.length>0){
					if(codeHead==null){
						parentArea = provinceData[i].areaId;
						codeHead = provinceData[i].code.substr(0, 1);
						html +='<dt value="'+codeHead+'">'+provinceData[i].name+'：</dt>';
						html +='<dd>';
						provinceCodeHeadArray.push(codeHead);
					}else{
						if(codeHead!=provinceData[i].code.substr(0, 1)){
							codeHead = provinceData[i].code.substr(0, 1);
							provinceCodeHeadArray.push(codeHead);
						}
						html +='</dd>';
						html +='<dt value="'+codeHead+'">'+provinceData[i].name+'：</dt>';
						html +='<dd>';
					}
					for(var j=0;j<provinceData[i].citys.length;j++){
						html +='<li value=\''+JSON.stringify(provinceData[i].citys[j])+'\'>'+provinceData[i].citys[j].name+'</li>';
					}
				}
			}
			html+='</dd>';
			$('#citySelect-province-list').append(html);
			$.each(provinceCodeHeadArray,function(i,item){
				$("#citySelect-alphabetic-province").append('<li>'+item+'</li>');
			});
		}
	});
	$.ajax({
		url:"http://lbs.cindata.cn/gxdyun/area/findCityList",
		type:"POST",
		success:function(cityData){
			var cityCodeHeadArray = [];
			var codeHead = null;
			var html = '';
			for(var i=0;i<cityData.length;i++){
				if(codeHead==null){
					codeHead = cityData[i].code.substr(0, 1);
					html+='<dt value="'+codeHead+'">'+codeHead+'：</dt>';
					html+='<dd>';
					cityCodeHeadArray.push(codeHead);
				}else if(codeHead!=cityData[i].code.substr(0, 1)){
					codeHead = cityData[i].code.substr(0, 1);
					html+='</dd>';
					html+='<dt value="'+codeHead+'">'+codeHead+'：</dt>';
					html+='<dd>';
					cityCodeHeadArray.push(codeHead);
				}
				html+='<li value=\''+JSON.stringify(cityData[i])+'\'>'+cityData[i].name+'</li>';
			    var $li = $("#citySelect-popular").find("li[name='"+cityData[i].name+"']");
			    if($li.length>0){
                    $($li[0]).attr("value",JSON.stringify(cityData[i]));
			    }
			}
			html+='</dd>';
			$('#citySelect-city-list').append(html);
			$.each(cityCodeHeadArray,function(i,item){
				$("#citySelect-alphabetic-city").append('<li>'+item+'</li>');
			});
		}
	});
}

function changeCity(area){
    $.ajax({
        url:"http://lbs.cindata.cn/gxdyun/area/citySelected",
        type:"POST",
        data:{areaId:area.areaId,cityName:area.name},
        success:function(result){
            if(result&&result.range){
                $("#citySelect-title").text("当前城市："+area.name);
                $("#citySelect-show span").text(area.name);
                $("#citySelect-search-input").val("");
                hideFrame("citySelect");
                ctrl.swicthCity(area)
            }
        }
    });
}