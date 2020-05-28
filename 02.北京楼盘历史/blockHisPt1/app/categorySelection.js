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

define([
  "dojo/dom",
  "dojo/dom-construct",
  "dojo/dom-class",
  "dojo/dom-style",
  "dojo/on"
], function (dom, domCtr, domClass,domStyle, on) {

  return {

    initialize: function (container, settings, state) {
      this.settings = settings;
      this.state = state;
      this.myAuto = document.getElementById('myaudio');
      // this.myAuto.load();
      this.startPlayValue = settings.ageClasses[0].minValue;
      this.animating = false;
      this.currentI = 1950;
      var i = 0;
      this.hidden=false;
      let self = this;
      // var buttonHidden = domCtr.create("button", {
      //   id: "period-341",
      //   innerHTML: "show"
      // }, dom.byId(container));
      // on(buttonHidden, "click", hiddenOrShow);
      function hiddenOrShow(params) {
        if(!self.hidden){
          domStyle.set(dom.byId("menuDiv"), "height", "42px");
          domStyle.set(dom.byId("heightDiv"), "display", "none");
          domStyle.set(dom.byId("categoryDiv"), "top", "0px");
          self.hidden=true;

        }else{
          domStyle.set(dom.byId("menuDiv"), "height", "200px");
          domStyle.set(dom.byId("heightDiv"), "display", "block");
          domStyle.set(dom.byId("categoryDiv"), "top", "50px");
          self.hidden=false;
        }
     
      }
      // this.hiddenButton = buttonHidden;
      var button = domCtr.create("button", {
        id: "period-34",
        innerHTML: this.currentI
      }, dom.byId(container));
      on(button, "click", hiddenOrShow);
      this.showButton = button;
      var playButton = domCtr.create("button", { id: "period-345", innerHTML: "开始" }, dom.byId(container));
      on(playButton, "click", play);
      this.playButton = playButton;
     
      function play() {
        if (self.animating) {
          self.stopAnimation.bind(self)();
          self.playButton.innerHTML = "开始";
          if (self.myAuto) {
            self.myAuto.pause();
          }
        } else {
          self.startAnimation.bind(self)();
          self.playButton.innerHTML = "暂停";
          if (self.myAuto.paused) {
            self.myAuto.play();
          }
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
      this.animating = true;
      this.state.animating = true;
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
      this.animating = false;
      this.state.animating = false;
    },
    /**
 * Animates the color visual variable continously
 */
    animate(startValue) {
      // var animating = true;
      this.animating = true;
      var value = startValue;
      var self = this;
      var n = this.settings.ageClasses.length;
      var endValue = this.settings.ageClasses[n - 1].maxValue;
      if (self.currentI == 0) {
        self.currentI = startValue;
      }
      var frame = function (timestamp) {
        if (!self.animating) {
          return;
        }
        var year = self.currentI;
        if (year < endValue) {
          year++;
        } else {
          year = value
        }
        self.state.selectedYear = year;
        self.currentI = year;
        self.showButton.innerHTML = year;

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
  };
});

