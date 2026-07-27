/**

* plugin for presenting svg images, using the snap.io plugin.
* written by Victoria J.H. Ritvo, 2019
* updated by William X.Q. Ngiam, 2026 (with assistance from Copilot)

 **/

var jsPsychContinuousReportFix = (function (jspsych) {
  'use strict';

  const version = '1.0.0';

  const info = {
    name: 'continuous-report-fix',
    version,
    parameters: {
      stimulus: { type: jspsych.ParameterType.HTML_STRING, default: null },
      cueIndex: { type: jspsych.ParameterType.INT, default: 0 },
      trial_duration: { type: jspsych.ParameterType.INT, default: 1000 }
    }
  };

  class ContinuousReportFix {
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

      // add a centered white fixation '+' to match the HTML fixation (font-size:60px)
      paper.text(centerXSVG, centerYSVG, '+').attr({
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
          cueIndex: trial.cueIndex
        });
      }, trial.trial_duration || 1000);
    }
  }

  return ContinuousReportFix;

})(jsPsychModule);