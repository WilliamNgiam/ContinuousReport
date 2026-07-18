/**

 * plugin for implementing a continuous report task, using the snap.io plugin.
 * written by Victoria J.H. Ritvo, 2019
 * adapted by William X.Q. Ngiam, 2026 (with assistance from Copilot)

 **/

jsPsych.plugins["continuous-report-feedback"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'continuous-report-feedback',
    description: 'Uses Snap.svg to display feedback for a continuous report response',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: 1500,
        description: 'How long to show feedback before it ends.'
      },
      cueIndex: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Cue index',
        default: null,
        description: 'Index of the cued item location in the memory array'
      },
    }
  }

  plugin.trial = function(display_element, trial) {
    var svgWidth = 600;
    var svgHeight = 600;

    display_element.innerHTML = "<svg id='svg' width='" + svgWidth + "' height='" + svgHeight + "'></svg>";

    var centerXSVG = svgWidth / 2;
    var centerYSVG = svgHeight / 2;
    var centerXDom = centerXSVG;
    var centerYDom = centerYSVG;

    var paper = Snap("#svg");

    var feedbackData = window.lastContinuousReportTrialData || {};
    var currColorWheel = feedbackData.currColorWheel || colors.colors;
    var randomColorVal = (typeof feedbackData.randomColorVal === 'number') ? feedbackData.randomColorVal : 0;
    var targetColorIndex = (typeof feedbackData.targetColorIndex === 'number') ? feedbackData.targetColorIndex : 0;
    var responseError = (typeof feedbackData.responseError === 'number') ? feedbackData.responseError : 0;
    var xClicked = (typeof feedbackData.xClicked === 'number') ? feedbackData.xClicked : null;
    var yClicked = (typeof feedbackData.yClicked === 'number') ? feedbackData.yClicked : null;
    var scoreValue = 100 - Math.abs(responseError);

    function getAngleFromPoint(xPos, yPos) {
      var relX = xPos - centerXDom;
      var relY = yPos - centerYDom;
      var angleDeg = Math.atan2(relY, relX) / Math.PI * 180.0;
      return ((angleDeg % 360) + 360) % 360;
    }

    function getLinePoints(angleDeg, radius1, radius2) {
      var angleRad = angleDeg * Math.PI / 180;
      return {
        x1: centerXSVG + Math.cos(angleRad) * radius1,
        y1: centerYSVG + Math.sin(angleRad) * radius1,
        x2: centerXSVG + Math.cos(angleRad) * radius2,
        y2: centerYSVG + Math.sin(angleRad) * radius2
      };
    }

    var svgObj = document.getElementById("svg");
    var rect = svgObj.getBoundingClientRect();
    centerXDom = rect.x + centerXSVG;
    centerYDom = rect.y + centerYSVG;

    var wheelGroup = paper.g();

    for (var i = 0; i < 360; i++) {
      var angleRad = i * Math.PI / 180;
      var innerRadius = 200;
      var outerRadius = 220;
      var x1 = centerXSVG + Math.cos(angleRad) * innerRadius;
      var y1 = centerYSVG + Math.sin(angleRad) * innerRadius;
      var x2 = centerXSVG + Math.cos(angleRad) * outerRadius;
      var y2 = centerYSVG + Math.sin(angleRad) * outerRadius;
      var wheelColor = currColorWheel[i];
      var wheelHexColor = Snap.rgb(wheelColor[0], wheelColor[1], wheelColor[2]);

      wheelGroup.line(x1, y1, x2, y2).attr({
        stroke: wheelHexColor,
        strokeWidth: 8,
        strokeLinecap: 'round'
      });
    }

    var responseAngleDeg = (xClicked !== null && yClicked !== null) ? getAngleFromPoint(xClicked, yClicked) : null;
    var correctAngleDeg = ((targetColorIndex - randomColorVal + 360) % 360 + 360) % 360;

    var responsePointer = paper.line(0, 0, 0, 0).attr({
      stroke: '#ff3b30',
      strokeWidth: 4,
      strokeLinecap: 'round'
    });
    var correctPointer = paper.line(0, 0, 0, 0).attr({
      stroke: '#34c759',
      strokeWidth: 4,
      strokeLinecap: 'round'
    });

    if (responseAngleDeg !== null) {
      responsePointer.attr(getLinePoints(responseAngleDeg, 170, 250));
    }

    correctPointer.attr(getLinePoints(correctAngleDeg, 170, 250));

    paper.circle(centerXSVG, centerYSVG, 40).attr({
      fill: 'white',
      opacity: 0.8,
      stroke: 'none'
    });

    paper.text(centerXSVG, centerYSVG, scoreValue.toString()).attr({
      fill: 'black',
      fontSize: 32,
      fontFamily: 'Arial',
      textAnchor: 'middle',
      dominantBaseline: 'central'
    });

    jsPsych.pluginAPI.setTimeout(function() {
      display_element.innerHTML = '';
      jsPsych.finishTrial({});
    }, trial.trial_duration || 1500);
  };

  return plugin;
})();
