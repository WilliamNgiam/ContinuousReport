/**

 * plugin for implementing a continuous report task, using the snap.io plugin.
 * written by Victoria J.H. Ritvo, 2019
 * adapted by William X.Q. Ngiam, 2026 (with assistance from Copilot)

 **/

var jsPsychContinuousReportResponse = (function (jspsych) {
  'use strict';

  const version = '1.0.0';

  const info = {
    name: 'continuous-report-response',
    version,
    parameters: {
      stimulus: { type: jspsych.ParameterType.HTML_STRING, default: null },
      cueIndex: { type: jspsych.ParameterType.INT, default: 0 }
    }
  };

  class ContinuousReportResponse {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    static {
      this.info = info;
    }

    trial(display_element, trial) {

      // Define and draw SVG object
      const svgWidth = 600;
      const svgHeight = 600;
      display_element.innerHTML = "<svg id='svg' width='" + svgWidth + "' height='" + svgHeight + "'></svg>";

      // Find center of SVG object
      const centerXSVG = svgWidth / 2;
      const centerYSVG = svgHeight / 2;

      // Create the Snap paper
      const paper = Snap('#svg');

      // Create the color wheel that is randomly rotated on each trial.
      const randomColorVal = Math.floor(Math.random() * 360);
      const originalColorWheel = colors.colors;
      const colorsFirstHalf = originalColorWheel.slice(randomColorVal, originalColorWheel.length);
      const colorsSecondHalf = originalColorWheel.slice(0, randomColorVal);
      const currColorWheel = colorsFirstHalf.concat(colorsSecondHalf);

      // Get which location is cued and what color it is.
      const cueIndex = typeof trial.cueIndex === 'number' ? trial.cueIndex : 0;
      const targetColorIndex = (typeof window.trialColors !== 'undefined' && window.trialColors[cueIndex] !== undefined) ? window.trialColors[cueIndex] : 0;

      let centerXDom = centerXSVG;
      let centerYDom = centerYSVG;
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

      // item locations (same as in the presentation plugin)
      const itemLocsX = [-250, -250, 250, 250];
      const itemLocsY = [-250, 250, -250, 250];

      // draw a circular location cue at the cued item position; its fill will update with cursor color
      const cueCenterX = centerXSVG + (itemLocsX[cueIndex] || 0);
      const cueCenterY = centerYSVG + (itemLocsY[cueIndex] || 0);
      const cueRadius = 40;
      const cueCircle = paper.circle(cueCenterX, cueCenterY, cueRadius).attr({ fill: 'white', stroke: 'none', strokeWidth: 2, opacity: 0.95 });

      // response pointer starts hidden; reveal after first mouse move
      const colPointer = paper.line(centerXSVG, centerYSVG - 200, centerXSVG, centerYSVG - 220).attr({ stroke: 'black', strokeWidth: 4, strokeLinecap: 'round', opacity: 0 });
      let pointerVisible = false;

      const calculateColor = (xPos, yPos) => {
        const relX = xPos - centerXDom;
        const relY = yPos - centerYDom;
        const curAngle = Math.atan2(relY, relX);
        const angleDeg = ((curAngle / Math.PI * 180.0) % 360 + 360) % 360;
        return [Math.floor(angleDeg), curAngle];
      };

      const updatePointer = (xPos, yPos) => {
        const output = calculateColor(xPos, yPos);
        const curAngle = output[1];
        const colorNum = output[0];
        const pointerStartX = Math.round(centerXSVG + Math.cos(curAngle) * 170);
        const pointerStartY = Math.round(centerYSVG + Math.sin(curAngle) * 170);
        const pointerEndX = Math.round(centerXSVG + Math.cos(curAngle) * 250);
        const pointerEndY = Math.round(centerYSVG + Math.sin(curAngle) * 250);
        colPointer.attr({ x1: pointerStartX, y1: pointerStartY, x2: pointerEndX, y2: pointerEndY });
        if (!pointerVisible) {
          colPointer.attr({ opacity: 1 });
          pointerVisible = true;
        }

        // update cue circle color to match wheel selection
        try {
          const wheelColor = currColorWheel[colorNum];
          if (wheelColor) {
            const wheelHex = Snap.rgb(wheelColor[0], wheelColor[1], wheelColor[2]);
            cueCircle.attr({ fill: wheelHex });
          }
        } catch (err) {
          // ignore errors updating cue
        }
      };

      const svgObj = document.getElementById('svg');
      const rect = svgObj.getBoundingClientRect();
      centerXDom = rect.x + centerXSVG;
      centerYDom = rect.y + centerYSVG;

      const onMouseMove = (e) => updatePointer(e.pageX, e.pageY);
      document.addEventListener('mousemove', onMouseMove);

      const onClick = (e) => {
        const responseOutput = calculateColor(e.pageX, e.pageY);
        const colorNumResponse = responseOutput[0];
        const colorResponse = currColorWheel[colorNumResponse];
        const colorResponseTrueIndex = ((colorNumResponse + randomColorVal) % 360 + 360) % 360;
        const responseError = ((targetColorIndex - colorResponseTrueIndex + 180) % 360 + 360) % 360 - 180;
        const scoreValue = 100 - Math.abs(responseError);

        window.lastContinuousReportTrialData = {
          currColorWheel,
          randomColorVal,
          targetColorIndex,
          responseError,
          xClicked: e.pageX,
          yClicked: e.pageY,
          responseCol: colorResponse,
          responseInd: colorResponseTrueIndex,
          correctCol: colors.colors[targetColorIndex],
          correctColIndex: targetColorIndex,
          cueIndex
        };

        window.responseScores = window.responseScores || [];
        window.responseScores.push(scoreValue);

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('click', onClick);
        display_element.innerHTML = '';

        this.jsPsych.finishTrial({
          responseError,
          targetColorIndex,
          responseInd: colorResponseTrueIndex,
          responseCol: colorResponse,
          xClicked: e.pageX,
          yClicked: e.pageY
        });
      };

      document.addEventListener('click', onClick);
    }
  }

  return ContinuousReportResponse;

})(jsPsychModule);
