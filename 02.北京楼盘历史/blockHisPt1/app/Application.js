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

/*
 * Title: Manhattan Skyscraper Explorer Main Application
 * Author: Raluca Nicola
 * Date: 07/06/17
 * Description: Main application file where the UI and scene view are loaded
 */

define([
  "dojo/_base/declare",

  "esri/core/Accessor",

  "esri/Map",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/layers/SceneLayer",
  "esri/Basemap",
  "esri/layers/FeatureLayer",
  "esri/layers/TileLayer",
  "esri/tasks/support/Query",

  "app/RendererGenerator",
  "app/HeightGraph",
  "app/Timeline",
  "app/InfoWidget",
  "app/labels",
  "app/searchWidget",
  "app/categorySelection",

  "dojo/dom",
  "dojo/on",
  "dojo/query"
], function (declare, Accessor,
  Map, MapView, SceneView, SceneLayer, Basemap,
  FeatureLayer,
  TileLayer, Query,
  RendererGenerator, HeightGraph, Timeline, InfoWidget, labels, searchWidget, categorySelection,
  dom, on, domQuery
) {
    return declare(null, {
      constructor: function (settings) {
        this.settings = settings;
        var State = Accessor.createSubclass({
          properties: {
            selectedPeriod: null,
            selectedYear: 1950,
            selectedYearByChart: null,
            selectedBuilding: null,
            hoveredBuilding: null,
            filteredBuildings: null,
            selectedCategory: settings.initCategory
          }
        });

        // application state object - alerts on select, hover or period change
        this.state = new State();
      },

      /**
       * Initialize view, information widget, height graph and timeline.
       */

      init: function (containers) {
        var settings = this.settings;
        var state = this.state;
        var buildings,
          heightGraph, timeline,
          selectHighlight, hoverHighlight;
        var baseLayer = new TileLayer({
          url: "http://gissvc4an.cindata.cn/arcgis/rest/services/comm/ChinaBlack/MapServer",
          visible: true
        });

        var gxdBase = new Basemap({
          baseLayers: [baseLayer],
          title: "国信达",
          id: "gxdBase",
          // thumbnailUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/409.png"
        });
        // create map
        var map = new Map({
          // basemap: "gray",
          basemap: gxdBase,
        });
        var view = new MapView({
          map: map,
          container: containers.view,
          center: [116.3987569, 39.90727724],
          zoom: 8,
          constraints: {
            snapToZoom: false,
            //   minScale: 72223.819286
          },
          highlightOptions: {
            color: [255, 255, 0, 1],
            haloOpacity: 0.9,
            fillOpacity: 0.2
          },
          // This ensures that when going fullscreen
          // The top left corner of the view extent
          // stays aligned with the top left corner
          // of the view's container
          resizeAlign: "top-left"
        });

        // remove navigation widgets from upper left corner
        // view.ui.empty("top-left");

        // set view on the window for debugging
        window.view = view;
        var layer = new FeatureLayer({
          // url: "http://ypgis.cindata.cn/arcgis/rest/services/bjxqpt/MapServer/0",
          url: "http://111.40.214.181/arcgis/rest/services/special_map/bj_xiaoqu_point/MapServer/0",
          definitionExpression: "buildyear > 0",
          title: "building",
          outFields : ["*"]
        });

        var rendererGen = new RendererGenerator(this.settings, layer, "buildyear", state);
        map.addMany([layer]);
        rendererGen.applyRendererYear(1950);
        var query = layer.createQuery();
        // query.outFields = ["*"];
        query.outFields = ["buildyear","label","objectid"];
        query.returnGeometry = true;
        layer.queryFeatures(query)
          .then(initGraphics)
          .otherwise(error);

        // initGraphics method takes the results of the query and stores them in the buildings array
        function initGraphics(results) {
          // turning all upper case fields to lower case to be able to use properties in lower case
          for (var i = 0; i < results.features.length; i++) {
            toLowerCase(results.features[i]);
          }
          buildings = results.features;
          categorySelection.initialize(containers.categories, settings, state);
          heightGraph = new HeightGraph(containers.heightGraph, settings, buildings, state);
          timeline = new Timeline(containers.timeline, settings, state);
          state.selectedPeriod = settings.initPeriod;
          state.selectedYear = 1950;
        }

        state.watch("selectedPeriod", function (newPeriod) {
          // // update building symbology
          rendererGen.applyClassBreaksRenderer(newPeriod);
          // update height graph
          heightGraph.updatePeriod(newPeriod);
          // update timeline
          timeline.update(newPeriod);
          if (selectHighlight) {
            selectHighlight.remove();
          }
        });
        state.watch("selectedYear", function (year) {
          // update building symbology
          rendererGen.applyRendererYear(year);
          // update height graph
          var newPeriod = [];
          var n = settings.ageClasses.length;
          for (let i = 0; i < n; i++) {
            const e = settings.ageClasses[i];
            if ((year >= e.minValue) && (year < e.maxValue)) {
              for (let j = 0; j < n; j++) {
                if (j <= i) {
                  newPeriod[j] = true;
                } else {
                  newPeriod[j] = false;
                }

              }
              break;
            }
          }
          heightGraph.updatePeriod(newPeriod);
          heightGraph.updateYear(year);
          // update timeline
          timeline.update(newPeriod);
        });
        view.whenLayerView(layer)
          .then(function (lv) {
            state.watch("selectedYearByChart", function (year) {
              if (year) {
                var query = layer.createQuery();
                query.where = "buildyear = " + year;
                layer.queryFeatures(query).then(function (result) {
                  if (selectHighlight) {
                    selectHighlight.remove();
                  }
                  selectHighlight = lv.highlight(result.features);
                })
              } else {
                if (selectHighlight) {
                  selectHighlight.remove();
                }
              }

            });
          })
          .otherwise(error);
        // when user hovers on a building set it in the state in the hovered
        var lastHover = Date.now();
        view.on("pointer-move", function (evt) {
          var newHover = Date.now();
          if ((newHover - lastHover) > 20 && !view.interacting) {
            lastHover = newHover;
            view.hitTest({ x: evt.x, y: evt.y }).then(function (response) {
              var graphic = response.results[0] ? response.results[0].graphic : null;
              if (graphic && (graphic.layer.title === "building")) {
                var feature = findFeature(graphic);
                var building = state.hoveredBuilding;
                if (feature) {
                  if ((!building) || (feature.attributes.objectid !== building.attributes.objectid)) {
                    const attributes = graphic.attributes;
                    const label = attributes.label;
                    const year = attributes.buildyear;
                    const info=document.getElementById("info");
                    info.style.left=(parseInt(evt.x)+10)+"px";
                    info.style.top=(parseInt(evt.y)-10)+"px";
                    info.style.visibility =
                      "visible";
                    info.innerHTML = label + "建成于" + year + "年";

                  }
                }
                else {
                  // state.hoveredBuilding = null;
                  // remove the highlight if no features are
                  // returned from the hitTest
                  // highlight.remove();
                  // highlight = null;
                  document.getElementById("info").style.visibility = "hidden";
                }
              }
              else {
                // state.hoveredBuilding = null;
                document.getElementById("info").style.visibility = "hidden";
              }
            });
          }
        });
        function findFeature(graphic) {
          var feature = buildings.filter(function (b) {
            return (b.attributes.objectid === graphic.attributes.objectid);
          })[0];
          return feature;
        }

      }

    });
    function error(err) {
      console.log(err);
    }

    // convert all property names of an object to lower case
    function toLowerCase(feature) {
      var key, keys = Object.keys(feature.attributes);
      var n = keys.length;
      var newobj = {};
      while (n--) {
        key = keys[n];
        newobj[key.toLowerCase()] = feature.attributes[key];
      }
      feature.attributes = newobj;
    }

  });
