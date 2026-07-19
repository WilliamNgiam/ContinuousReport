/**

* plugin for presenting svg images, using the snap.io plugin.
* written by Victoria J.H. Ritvo, 2019
* updated by William X.Q. Ngiam, 2026 (with assistance from Copilot)

 **/

var jsPsychContinuousReportPres = (function (jspsych) {
  'use strict';

  const version = '1.0.0';

  const info = {
    name: 'continuous-report-pres',
    version,
    parameters: {
      stimulus: { type: jspsych.ParameterType.HTML_STRING, default: null },
      cueIndex: { type: jspsych.ParameterType.INT, default: 0 },
      trial_duration: { type: jspsych.ParameterType.INT, default: 1000 }
    }
  };

  class ContinuousReportPres {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    static {
      this.info = info;
    }

    trial(display_element, trial) {
      const svgWidth = 600;
      const svgHeight = 600;
      display_element.innerHTML = "<svg id='svg' width='" + svgWidth + "' height='" + svgHeight + "'></svg>";
      const centerXSVG = svgWidth / 2;
      const centerYSVG = svgHeight / 2;
      const paper = Snap('#svg');

      const itemLocsX = [-250, -250, 250, 250];
      const itemLocsY = [-250, 250, -250, 250];

      // get unique color indices for this trial
      const colorPool = (function shuffle(arr) {
        const copy = arr.slice();
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
      })(Array.from({ length: colors.colors.length }, (_, i) => i));

      const itemColIndices = colorPool.slice(0, 4);
      window.trialColors = itemColIndices;

      const g = paper.group();
      const currStim = 'images/stim/circle.svg';

      itemLocsX.forEach((x, index) => {
        const thisX = centerXSVG + x - 80 / 2;
        const thisY = centerYSVG + itemLocsY[index] - 80 / 2;
        const rgbCol = colors.colors[itemColIndices[index]];
        const currHexColor = Snap.rgb(rgbCol[0], rgbCol[1], rgbCol[2]);

        Snap.load(currStim, (fragment) => {
          const element = fragment.select('#Layer_1');
          g.add(element);
          element.attr({ width: '80', height: '80', x: thisX.toString(), y: thisY.toString() });
          const shape = element.select('path');
          shape.attr({ fill: currHexColor });
        });
      });

      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.innerHTML = '';
        this.jsPsych.finishTrial({
          stimulus: trial.stimulus,
          cueIndex: trial.cueIndex,
          itemColIndices: itemColIndices
        });
      }, trial.trial_duration || 1000);
    }
  }

  return ContinuousReportPres;

})(jsPsychModule);