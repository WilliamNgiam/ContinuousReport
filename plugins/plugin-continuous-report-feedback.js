/**

 * plugin for implementing a continuous report task, using the snap.io plugin.
 * written by Victoria J.H. Ritvo, 2019
 * adapted by William X.Q. Ngiam, 2026 (with assistance from Copilot)

 **/

var jsPsychContinuousReportFeedback = (function (jspsych) {
  'use strict';

  const version = '1.0.0';

  const info = {
    name: 'continuous-report-feedback',
    version,
    parameters: {
      stimulus: { type: jspsych.ParameterType.HTML_STRING, default: null },
      trial_duration: { type: jspsych.ParameterType.INT, default: 1500 },
      cueIndex: { type: jspsych.ParameterType.INT, default: null }
    }
  };

  class ContinuousReportFeedback {
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
      let centerXDom = centerXSVG;
      let centerYDom = centerYSVG;
      const paper = Snap('#svg');

      const feedbackData = window.lastContinuousReportTrialData || {};
      const currColorWheel = feedbackData.currColorWheel || colors.colors;
      const randomColorVal = typeof feedbackData.randomColorVal === 'number' ? feedbackData.randomColorVal : 0;
      const targetColorIndex = typeof feedbackData.targetColorIndex === 'number' ? feedbackData.targetColorIndex : 0;
      const responseError = typeof feedbackData.responseError === 'number' ? feedbackData.responseError : 0;
      const xClicked = typeof feedbackData.xClicked === 'number' ? feedbackData.xClicked : null;
      const yClicked = typeof feedbackData.yClicked === 'number' ? feedbackData.yClicked : null;
      const scoreValue = 100 - Math.abs(responseError);

      const getAngleFromPoint = (xPos, yPos) => {
        const relX = xPos - centerXDom;
        const relY = yPos - centerYDom;
        const angleDeg = Math.atan2(relY, relX) / Math.PI * 180.0;
        return ((angleDeg % 360) + 360) % 360;
      };

      const getLinePoints = (angleDeg, radius1, radius2) => {
        const angleRad = angleDeg * Math.PI / 180;
        return {
          x1: centerXSVG + Math.cos(angleRad) * radius1,
          y1: centerYSVG + Math.sin(angleRad) * radius1,
          x2: centerXSVG + Math.cos(angleRad) * radius2,
          y2: centerYSVG + Math.sin(angleRad) * radius2
        };
      };

      const svgObj = document.getElementById('svg');
      const rect = svgObj.getBoundingClientRect();
      centerXDom = rect.x + centerXSVG;
      centerYDom = rect.y + centerYSVG;

      const wheelGroup = paper.g();
      for (let i = 0; i < 360; i++) {
        const angleRad = i * Math.PI / 180;
        const innerRadius = 200;
        const outerRadius = 220;
        const x1 = centerXSVG + Math.cos(angleRad) * innerRadius;
        const y1 = centerYSVG + Math.sin(angleRad) * innerRadius;
        const x2 = centerXSVG + Math.cos(angleRad) * outerRadius;
        const y2 = centerYSVG + Math.sin(angleRad) * outerRadius;
        const wheelColor = currColorWheel[i];
        const wheelHexColor = Snap.rgb(wheelColor[0], wheelColor[1], wheelColor[2]);
        wheelGroup.line(x1, y1, x2, y2).attr({ stroke: wheelHexColor, strokeWidth: 8, strokeLinecap: 'round' });
      }

      const responseAngleDeg = xClicked !== null && yClicked !== null ? getAngleFromPoint(xClicked, yClicked) : null;
      const correctAngleDeg = ((targetColorIndex - randomColorVal + 360) % 360 + 360) % 360;

      const responsePointer = paper.line(0, 0, 0, 0).attr({ stroke: '#ff3b30', strokeWidth: 4, strokeLinecap: 'round' });
      const correctPointer = paper.line(0, 0, 0, 0).attr({ stroke: '#34c759', strokeWidth: 4, strokeLinecap: 'round' });
      if (responseAngleDeg !== null) responsePointer.attr(getLinePoints(responseAngleDeg, 170, 250));
      correctPointer.attr(getLinePoints(correctAngleDeg, 170, 250));

      paper.circle(centerXSVG, centerYSVG, 40).attr({ fill: 'white', opacity: 0.8, stroke: 'none' });
      paper.text(centerXSVG, centerYSVG, scoreValue.toString()).attr({ fill: 'black', fontSize: 32, fontFamily: 'Arial', textAnchor: 'middle', dominantBaseline: 'central' });

      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.innerHTML = '';
        this.jsPsych.finishTrial({ score: scoreValue, responseError });
      }, trial.trial_duration || 1500);
    }
  }

  return ContinuousReportFeedback;

})(jsPsychModule);
