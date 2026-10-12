/**

 * Plugin for presenting color stimuli on a continuous-report memory task.
 *
 * Four circles with randomly selected colour values are shown in fixed locations 
 * on the screen (in quadrants). 
 * 
 * Requires colors to be defined in color.js
 * 
 * Original plugin for continuous report, using the snap.io plugin was written 
 * by Victoria J.H. Ritvo, 2019
 * Plugin adapted by William X.Q. Ngiam, 2026 (with assistance from Copilot)

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

      // fixed locations of items in quadrant relative to screen centre
      const itemLocsX = [-250, -250, 250, 250];
      const itemLocsY = [-250, 250, -250, 250];

      // Sample unique color indices with the minimum circular distance between hues.
      function sampleColorIndices(arr, sampleSize, minDiff) {
        const colorCount = arr.length;
        const distance = (a, b) => {
          const difference = Math.abs(a - b);
          return Math.min(difference, colorCount - difference);
        };

        function search(available, selected) {
          if (selected.length === sampleSize) {
            return selected;
          }

          const shuffled = available.slice();
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }

          for (const index of shuffled) {
            if (!selected.every(selectedIndex => distance(index, selectedIndex) >= minDiff)) {
              continue;
            }

            const remaining = shuffled.filter(candidate =>
              candidate !== index && distance(candidate, index) >= minDiff
            );
            const result = search(remaining, [...selected, index]);
            if (result) {
              return result;
            }
          }

          return null;
        }

        const result = search(arr, []);
        if (!result) {
          throw new Error(`Unable to sample ${sampleSize} colors with a minimum difference of ${minDiff}.`);
        }
        return result;
      }

      const itemColIndices = sampleColorIndices(
        Array.from({ length: colors.colors.length }, (_, i) => i),
        4,
        20
      );
      window.trialColors = itemColIndices;

      const g = paper.group();
      const currStim = 'images/stim/circle.svg';

      itemLocsX.forEach((x, index) => {
        const thisX = centerXSVG + x - 80 / 2; // adjust for item size (see width and height attr below)
        const thisY = centerYSVG + itemLocsY[index] - 80 / 2; // adjust for item size (see width and height attr below)
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

      // add a centered white fixation '+' to match the HTML fixation (font-size:60px)
      const fixationText = paper.text(centerXSVG, centerYSVG, '+').attr({
        fill: 'white',
        fontSize: 60,
        fontFamily: 'OpenSans',
        textAnchor: 'middle',
        dominantBaseline: 'central'
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