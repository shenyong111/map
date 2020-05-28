/* Copyright 2017 Esri

   Licensed under the Apache License, Version 2.0 (the "License");

   you may not use this file except in compliance with the License.

   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software

   distributed under the License is distributed on an "AS IS" BASIS,

   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

   See the License for the specific language governing permissions and

   limitations under the License.*/

/*********************************************
 * This class builds the graph that displays
 * the correlation between building height and
 * construction year.
 ********************************************/

define([
  "dojo/_base/declare",
  "d3"
], function (declare, d3) {
  return declare(null, {

    constructor: function (container, settings, features, state) {
      this.state = state;
      // general settings for the svg area
      this.width = document.getElementById(container).clientWidth;
      this.height = document.getElementById(container).clientHeight;
      this.paddingLeft = 210;
      this.paddingTop = 20;
      this.paddingBottom = 15;
      this.ageClasses = settings.ageClasses;
      this.defaultColor = settings.defaultColor;
      this.highlightColor = "rgb(" + settings.highlightOptions.color.slice(0, 3).join(",") + ")";

      // define svg
      var svg = d3.select("#" + container)
        .append("svg")
        .attr("height", this.height)
        .attr("width", this.width + 2);

      // create scales
      var buildingOptions = settings.buildingOptions;
      var xScale = d3.scaleLinear()
        .domain([buildingOptions.minCnstrctYear - 1, buildingOptions.maxCnstrctYear])
        .range([this.paddingLeft, this.width]);
      var yScale = d3.scaleLinear()
        .domain([0, buildingOptions.maxHeight])
        .range([this.height - this.paddingBottom, this.paddingTop]);
      var yBarScale = d3.scaleLinear()
        .domain([0, 700])
        //  .range([0, this.height - this.paddingBottom-this.paddingTop]);
        .range([0, this.height - this.paddingBottom]);
      var yScale1 = d3.scaleLinear()
        .domain([0, 700])
        .range([this.height - this.paddingBottom, this.paddingTop]);
      // create axes
      var yAxis = d3.axisLeft(yScale1)
        .tickValues([0, 150, 300, 700])
        .tickFormat(function (d) {
          if (d === 700) {
            return d + "个";
          }
          else {
            return d;
          }
        })
        .tickPadding(10)

      // add helper lines that will show the values on the vertical axis
      function appendHorizontalLine(x1, y1, x2, y2) {
        svg.append("line")
          .attr("x1", x1)
          .attr("y1", yScale1(y1))
          .attr("x2", xScale(x2))
          .attr("y2", yScale1(y2))
          .style("stroke-dasharray", "2, 2")
          .style("stroke", "#bbb");
      }
      appendHorizontalLine(this.paddingLeft, 700, 2025, 700);
      appendHorizontalLine(this.paddingLeft, 300, 2025, 300);
      appendHorizontalLine(this.paddingLeft, 0, 2025, 0);
      appendHorizontalLine(this.paddingLeft, 150, 2025, 150);

      function getDataFromFeatures(features) {
        var data = [];
        function getCount(year) {
          var fs = features.filter((e) => {
            return e.attributes.buildyear == year;
          });
          return fs.length;
        }

        for (let i = 0; i < settings.ageClasses.length * 10; i++) {
          const year = settings.ageClasses[0].minValue + i;
          const count = getCount(year);
          const element = {
            "FID": i,
            "buildyear": year,
            "count": getCount(year)
          }
          data.push(element);
        }
        return data;
      }
      this.barData = getDataFromFeatures(features);
      // handlers for filtering
      var groupHandlers = svg.append("g");
      groupHandlers.append("rect")
        .classed("top", true)
        .attr("x", xScale(2020))
        .attr("y", yScale(buildingOptions.maxHeight) - 9)
        .attr("width", 50)
        .attr("height", 6)
        .attr("rx", 5)
        .attr("ry", 0)
        .attr("cursor", "default")
        .style("fill", "#bbb");
      groupHandlers.append("rect")
        .classed("bottom", true)
        .attr("x", xScale(2020))
        .attr("y", yScale(buildingOptions.minHeight) - 1)
        .attr("width", 50)
        .attr("height", 6)
        .attr("rx", 5)
        .attr("ry", 0)
        .attr("cursor", "default")
        .style("fill", "#bbb");

      // define vertical axis and append it to the svg container
      var yAxisGroup = svg.append("g")
        .attr("transform", "translate(" + this.paddingLeft + ", 0)")
        .call(yAxis);

      // brush added for filtering
      var brush = d3.brushY()
        .extent([[0, this.paddingTop], [this.width, this.height - this.paddingBottom]]);
      yAxisGroup.call(brush).call(brush.move, [yScale(buildingOptions.maxHeight), yScale(buildingOptions.minHeight)]);
      svg.select(".overlay").attr("display", "none");

      // add building features as circles to the graph
      var self = this;
      var bars = svg.append('g')
        .selectAll('rect')
        .data(this.barData)
        .enter()
        .append("rect")
        .attr('width', '7px')
        .attr('height', function (d) {
          return yBarScale(d.count);
        })
        .attr('class', function (d) {
          var value;
          settings.ageClasses.forEach(function (e, i) {
            if (e.minValue <= d.buildyear && d.buildyear <= e.maxValue) {
              value = i;
            }
          });
          return "construct-" + value;
        })
        .attr("id", function (d) {
          return "id-" + d.FID;
        })
        .attr("x", function (d) {
          return xScale(d.buildyear);
        })
        .attr("y", function (d) {
          return yBarScale(700) - yBarScale(d.count)
        })
        .attr("fill", function (d) {
          var value = settings.ageClasses.filter(function (e) {
            return (e.minValue <= d.buildyear && d.buildyear <= e.maxValue);
          });
          if (value.length == 0) {
            return self.defaultColor;
          }
          if (value[0].color.length === 4) {
            return "rgba(" + value[0].color.join(",") + ")";
          }
          else {
            return "rgba(" + value[0].color.join(",") + ",0.7)";
          }
        })
        .attr("cursor", "pointer")
        .on("click", function (d) {
          // click bar
          self.state.selectedYearByChart = (self.state.selectedYearByChart == d.buildyear) ? null : d.buildyear;
        }).on("mouseover", function (d) {
          self.hover(d);
        })
        .on("mouseout", function () {
          self.removeHover();
        });
      this.bars = bars;

      // add text that shows the height of the buildings that are filtered
      svg.append("text")
        .attr("x", this.paddingLeft + 2)
        .attr("id", "upper-indicator");

      svg.append("text")
        .attr("x", this.paddingLeft + 2)
        .attr("id", "lower-indicator");

      // add event listeners when filters are changed
      brush.on("brush", function () {
        groupHandlers.select("rect.top")
          .attr("y", d3.event.selection[0] - 9);
        groupHandlers.select("rect.bottom")
          .attr("y", d3.event.selection[1] - 1);
        svg.select("#upper-indicator")
          .attr("y", d3.event.selection[0] - 5)
          .text(Math.round(yScale.invert(d3.event.selection[0])));
        svg.select("#lower-indicator")
          .attr("y", d3.event.selection[1] + 15)
          .text(Math.round(yScale.invert(d3.event.selection[1])));
        state.filteredBuildings = [yScale.invert(d3.event.selection[1]), yScale.invert(d3.event.selection[0])];
      });
      brush.on("end", function () {
        svg.select("#upper-indicator")
          .text("");
        svg.select("#lower-indicator")
          .text("");
        if (!d3.event.selection) {
          yAxisGroup.call(brush).call(brush.move, [yScale(1500), yScale(0)]);
        }
      });

      // add the circles and the selection and hovering groups to the class
      this.selectContainer = svg.append("g");
      this.hoverContainer = svg.append("g");
    },

    // on hover add information about the building and a circle that acts like a highlight
    hover: function (d) {
      if (!d) return;
      var elem = d3.select("#id-" + d.FID);
      var rgba = elem.attr('fill');
      var sRgba = rgba.split(',')
      var n = sRgba.length;
      if (sRgba[n - 1] == "0)") {
        return;
      }
      var cx = parseInt(elem.attr("x"), 10),
        cy = parseInt(elem.attr("y"), 10);
      this.hoverContainer.append("line")
        .attr("class", "hover-graphic")
        .attr("x1", cx)
        .attr("y1", cy - 4)
        .attr("x2", cx)
        .attr("y2", cy - 15)
        .style("stroke", "#000");
      var rect = this.hoverContainer.append("rect")
        .attr("class", "hover-graphic");
      var text = this.hoverContainer.append("text")
        .attr("class", "tooltip")
        .classed("hover-graphic", true)
        .attr("x", cx)
        .attr("y", cy - 21)
        .attr("text-anchor", "middle")
        .text(function () {
          return d.buildyear + " 年" + "小区数量" + d.count + " 个";
        });
      var bbox = text.node().getBBox();

      rect.attr("x", bbox.x - 4)
        .attr("y", bbox.y - 4)
        .attr("width", bbox.width + 8)
        .attr("height", bbox.height + 8)
        .style("fill", "#ddd")
        .style("fill-opacity", ".9");
    },

    // remove circle that acts like a highlight on hover
    removeHover: function () {
      this.hoverContainer.selectAll(".hover-graphic").remove();
    },

    // add a circle that will act like a highlight when a circle is clicked on
    select: function (d) {
      var elem = d3.select("#id-" + d.attributes.FID);
      this.selectContainer.append("circle")
        .attr("class", "selectedGraphic")
        .attr("r", 8)
        .attr("cx", parseInt(elem.attr("cx"), 10))
        .attr("cy", parseInt(elem.attr("cy"), 10))
        .attr("stroke-width", 4)
        .attr("stroke", this.highlightColor)
        .attr("fill", "none");
    },

    // remove circle that acts like a selection highlight
    deselect: function () {
      this.selectContainer.selectAll(".selectedGraphic").remove();
    },

    // color the buildings according to the new selected period
    updatePeriod: function (newPeriod) {
      for (var i = 0; i < newPeriod.length; i++) {
        this.bars.filter(".construct-" + i)
          .attr("fill", newPeriod[i] ? "rgba(" + this.ageClasses[i].color.join(",") + ",0.8)" : "rgba(" + this.defaultColor.join(",") + ")");
      }
    },
    updateYear: function (year) {
      var self = this;
      this.bars.attr("fill", function (d) {
        var item = self.bars.filter((item, index) => {
          return item.FID == d.FID;
        });
        var classstr = item.attr("class");
        var index = classstr.replace('construct-', '');
        if (d.buildyear <= year) {
          return "rgba(" + self.ageClasses[index].color.join(",") + ")";
        }
        else {
          return "rgba(" + self.ageClasses[index].color.join(",") + ",0.0)";
        }
      })
    },

    // set display:none to circles when the corresponding buildings are filtered out
    updateFilter: function (newFilter) {

    },

    // change the size and opacity of points when a category is selected
    applyCategory: function (newCategory) {

    }
  });
});
