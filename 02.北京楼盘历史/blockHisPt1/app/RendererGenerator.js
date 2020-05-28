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

/*****************************************
 * This class is helps generating renderers
 * for the building scene layer depending
 * on the user choices
 **************************************/

define([
  "dojo/_base/declare",

  "esri/symbols/MeshSymbol3D",
  "esri/symbols/FillSymbol3DLayer",
  "esri/renderers/ClassBreaksRenderer",
  "esri/renderers/UniqueValueRenderer",
  "esri/symbols/PointSymbol3D",
  "esri/symbols/ObjectSymbol3DLayer",
  "esri/symbols/IconSymbol3DLayer"
], function (declare,
  MeshSymbol3D, FillSymbol3DLayer, ClassBreaksRenderer, UniqueValueRenderer,
  PointSymbol3D, ObjectSymbol3DLayer, IconSymbol3DLayer) {

    return declare(null, {

      constructor: function (settings, layer, field, state) {
        this.defaultColor = settings.defaultColor;
        this.ageClasses = settings.ageClasses;
        this.layer = layer;
        this.field = field;
        this.state = state;
      },

      createClassBreakInfos3D: function (selectedPeriod) {
        return this.ageClasses.map(function (e, i) {
          var color = selectedPeriod[i] ? e.color : this.defaultColor;
          return {
            minValue: e.minValue,
            maxValue: e.maxValue,
            symbol: new PointSymbol3D({
              symbolLayers: [new ObjectSymbol3DLayer({
                height: 100,
                material: {
                  color: color
                }
              })]
            })
          };
        }.bind(this));
      },
      createClassBreakInfos: function (selectedPeriod) {
        return this.ageClasses.map(function (e, i) {
          var color = selectedPeriod[i] ? e.color : this.defaultColor;
          var outColor=Array.from(color); 
          outColor.push(0.5);
          return {
            minValue: e.minValue,
            maxValue: e.maxValue,
            symbol: {
              type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
              color: color,
              size: "6px",  // pixels
              outline: {  // autocasts as new SimpleLineSymbol()
                color: outColor,
                width: 3  // points
              }
            }
          };
        }.bind(this));
      },
      createClassBreakInfosYear: function () {
        return this.ageClasses.map(function (e, i) {
          var color =  e.color;
          var outColor=Array.from(color); 
          outColor.push(0.5);
          return {
            minValue: e.minValue,
            maxValue: e.maxValue,
            symbol: {
              type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
              color: color,
              size: "6px",  // pixels
              outline: {  // autocasts as new SimpleLineSymbol()
                color: outColor,
                width: 3  // points
              }
            }
          };
        }.bind(this));
      },

      applyClassBreaksRenderer: function (selectedPeriod) {
        var symbol = {
          type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
          color: this.defaultColor,
          size: "6px",  // pixels
          outline: {  // autocasts as new SimpleLineSymbol()
            color: [255, 255, 0,0],
            width: 1  // points
          }
        };
        var opacityStops = [{
          opacity: 1,
          value: 1990
        },
        {
          opacity: 0,
          value: 1991
        }];
        this.layer.renderer = new ClassBreaksRenderer({
          field: this.field,
          defaultSymbol: symbol,
          classBreakInfos: this.createClassBreakInfos(selectedPeriod),
          visualVariables: [{
            type: "opacity",
            field: "buildyear",
            stops: opacityStops,
            legendOptions: {
              showLegend: false
            }
          }]
        });

        this.applyCategory(this.state.selectedCategory);
      },
      applyClassBreaksRendererYear: function (year) {

        var symbol = new PointSymbol3D({
          symbolLayers: [new ObjectSymbol3DLayer({
            height: 100,
            material: { color: this.defaultColor }
          })]
        });
        var opacityStops = [{
          opacity: 1,
          value: year
        },
        {
          opacity: 0,
          value: year + 1
        }];

        this.layer.renderer = new ClassBreaksRenderer({
          field: this.field,
          defaultSymbol: symbol,
          classBreakInfos: this.createClassBreakInfosYear(),
          // visualVariables: [{
          //   type: "opacity",
          //   field: "buildyear",
          //   stops: opacityStops,
          //   legendOptions: {
          //     showLegend: false
          //   }
          // }]
        });

        this.applyCategory(this.state.selectedCategory);
      },

      applyCategory: function (category) {
        var field, renderer = this.layer.renderer.clone();
        if (category === "all") {
          renderer.visualVariables = null;
        }
        else {
          if (category === "info") {
            field = "WIKI";
          }
          else {
            field = "TOP20";
          }
          renderer.visualVariables = [{
            type: "opacity",
            field: field,
            stops: [{
              value: 0,
              opacity: 0.2
            }, {
              value: 1,
              opacity: 1
            }]
          }];
        }
        this.layer.renderer = renderer;
      },
      applyRendererYear(year) {
        var opacityStops = [{
          opacity: 1,
          value: year
        },
        {
          opacity: 0,
          value: year + 1
        }];
        var symbol = {
          type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
          color: this.defaultColor,
          size: "6px",  // pixels
          outline: {  // autocasts as new SimpleLineSymbol()
            color: [255, 255, 0,0],
            width: 1  // points
          }
        };
        this.layer.renderer = new ClassBreaksRenderer({
          field: this.field,
          defaultSymbol: symbol,
          classBreakInfos: this.createClassBreakInfosYear(),
          visualVariables: [{
            type: "opacity",
            field: "buildyear",
            stops: opacityStops,
            legendOptions: {
              showLegend: false
            }
          }]
        });
;
      },

      createUniqueValueRenderer: function (field, uniqueValues) {

        return new UniqueValueRenderer({
          field: field,
          uniqueValueInfos: [{
            value: uniqueValues.value,
            symbol: new PointSymbol3D({
              symbolLayers: [new IconSymbol3DLayer({
                size: 18,  // points
                resource: {
                  href: uniqueValues.image
                }
              })],
              verticalOffset: {
                screenLength: 80,
                maxWorldLength: 100
              },
              callout: {
                type: "line",
                size: 1,
                color: [50, 50, 50],
                border: {
                  color: [255, 255, 255]
                }
              }
            })
          }]
        });
      }

    });
  });
