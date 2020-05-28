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

/********************************************
 * This class helps creating and updating
 * the timeline buttons under the heightGraph
 *******************************************/

define([
  "dojo/_base/declare",
  "dojo/dom",
  "dojo/dom-construct",
  "dojo/on"
], function (declare, dom, domCtr, on) {

  return declare(null, {

    constructor: function (container, settings, state) {

      this.settings = settings;
      this.state=state;
      this.startPlayValue = settings.initPeriod.map((e) => {
        return false;
      });
      this.animating=false;
      this.currentI=0;

      for (var i = 0; i < settings.initPeriod.length; i++) {
        var button = domCtr.create("button", { id: "period-" + i, innerHTML: settings.ageClasses[i].minValue + " - " + settings.ageClasses[i].maxValue }, dom.byId(container));
        on(button, "click", togglePeriod(i));
      }
      function togglePeriod(j) {
        return function () {
          var newPeriod = [];
          for (var i = 0; i < settings.initPeriod.length; i++) {
            newPeriod[i] = (i !== j) ? state.selectedPeriod[i] : !state.selectedPeriod[i];
          }
          state.selectedPeriod = newPeriod;
        };
      }
      var button1 = domCtr.create("button", { id: "period-345", innerHTML: "播放" }, dom.byId(container));
      on(button1, "click", play);
      let self=this;
      function play() {
        if (self.animating) {
          self.stopAnimation.bind(self)();
        } else {
          self.startAnimation.bind(self)();
        }
      }
    
    },
  
    /**
      * Starts the animation that cycle
      * through the construction years.
      */
    startAnimation() {
      this.stopAnimation.bind(this)();
      this.animation = this.animate.bind(this)(this.startPlayValue);
      this.animating=true;
    },
    /**
 * Stops the animations
 */
    stopAnimation() {
      if (!this.animating) {
        return;
      }
      this.animation.remove();
      this.animation = null;
      this.animating=false;
    },
    /**
 * Animates the color visual variable continously
 */
    animate(startValue) {
      // var animating = true;
      this.animating=true;
      var value = startValue;
      var self=this;

      var frame = function (timestamp) {
        if (!self.animating) {
          return;
        }
        var newPeriod = [];
        var exist = false;
        for (var i = 0; i < value.length; i++) {
          if (i<=self.currentI) {
            newPeriod[i] = true;
          } else {
            newPeriod[i] =false;
          }
        }
        self.state.selectedPeriod = newPeriod;
        self.currentI++;
        if(self.currentI==value.length){
          self.currentI=0;
        }

        // Update at 30fps
        setTimeout(function () {
          requestAnimationFrame(frame);
        }, 1000 / 3);
      };
      frame();

      return {
        remove: function () {
          self.animating = false;
        }
      };
    },

    update: function (newPeriod) {
      var buttonStyle;
      for (var i = 0; i < newPeriod.length; i++) {
        buttonStyle = dom.byId("period-" + i).style;
        buttonStyle.backgroundColor = newPeriod[i] ? "rgb(" + this.settings.ageClasses[i].color.join(",") + ")" : "rgba(" + this.settings.defaultColor.join(",") + ")";
        buttonStyle.color = newPeriod[i] ? "#fff" : "#777";
      }
    }
  });
});
