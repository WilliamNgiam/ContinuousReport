/**

 * plugin for implementing a continuous report task, using the snap.io plugin.
 * written by Victoria J.H. Ritvo, 2019
 * updated by William X.Q. Ngiam, 2026 (with assistance from Copilot)

 **/


jsPsych.plugins["continuous-report-response"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'continuous-report-response',
    description: 'Uses Snap.svg to implement the continuous report task',
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
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
      condType: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'condition',
        default: null,
        description: 'stimulus condition'
      },
      cueIndex: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Cue index',
        default: null,
        description: 'Index of the cued item location in the memory array'
      },
    }
  }

  // MAIN CODE OF PLUG IN
  plugin.trial = function(display_element, trial) {
    var response = {
      rt: null,
      mouseX: null,
      mouseY: null,
      col: null,
    };

    var stimParameters = {};

    // get the image file location
    var currStim = 'images/stim/circle.svg';



    function getRndInteger(min, max) { // this function sets a random number between min and max, inclusive
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // randomize the color wheel for this trial:
    // this rotation is applied counterclockwise...matters later
    var randomColorVal = getRndInteger(1, 359); //359 because that's the 360th element, since it starts at 0.
    originalColorWheel = colors.colors;
    // step 1: slice at this number
    var colorsFirstHalf = originalColorWheel.slice(randomColorVal, originalColorWheel.length);
    // step 2: slice to get the array leading up to it
    var colorsSecondHalf = originalColorWheel.slice(0, randomColorVal);
    var both = colorsFirstHalf.concat(colorsSecondHalf);
    var currColorWheel = both;


    // set the svg dimensions, to add to the innerHTML
    var svgWidth = 600;
    var svgHeight = 600;

    // create the svg object
    display_element.innerHTML = "<svg id='svg', width = '" + svgWidth.toString() + "', height = '" + svgWidth.toString() + "'/svg>";

    // set the center points (relative to the SVG)
    var centerXSVG = svgWidth / 2,
      centerYSVG = svgHeight / 2;

    var itemLocsX = [-250, -250, 250, 250];
    var itemLocsY = [-250, 250, -250, 250];
    var cueIndex = (typeof trial.cueIndex === 'number' && trial.cueIndex >= 0 && trial.cueIndex < itemLocsX.length) ? trial.cueIndex : null;
    console.log("which item: " + cueIndex)
    var targetColorIndex = window.trialColors[cueIndex]
    console.log("target color index:" + targetColorIndex)

    // create the snap paper
    var paper = Snap("#svg");

    // create the pointer. Here, it's set to appear at the top of the circle at the start of a trial.
    var colPointer = paper.line(centerXSVG, centerYSVG - 200, centerXSVG, centerYSVG - 220).attr({
      stroke: "black",
      strokeWidth: 4,
      strokeLinecap: 'round'
    });



    var mouseX, mouseY;

    $(function() {
      $(document).bind('mousemove.overall', function(e) {

        // get coordinates of the SVG bounding box in Absolute terms (not svg coordinates)
        var svgObj = document.getElementById("svg");
        var rect = svgObj.getBoundingClientRect();

        // get the center coordinates in absolute terms (not svg coordinates)
        centerXDom = rect.x + centerXSVG;
        centerYDom = rect.y + centerYSVG;

        // calculate angle (done with absolute, DOM coordintes)
        var output = calculateColor(e.pageX, e.pageY); //get imgCol
        var imgCol = output[0];
        var curAngle = output[1];

        stimParameters.col = currColorWheel[imgCol];
        currHexColor = Snap.rgb(stimParameters.col[0], stimParameters.col[1], stimParameters.col[2]);

        // calculate the pointer position based on SVG coordinates
        var pointerStartX = Math.round(centerXSVG + Math.cos(curAngle) * 170);
        var pointerStartY = Math.round(centerYSVG + Math.sin(curAngle) * 170);
        var pointerEndX = Math.round(centerXSVG + Math.cos(curAngle) * 250);
        var pointerEndY = Math.round(centerYSVG + Math.sin(curAngle) * 250);
        colPointer.attr({
          x1: pointerStartX,
          y1: pointerStartY,
          x2: pointerEndX,
          y2: pointerEndY
        });

      });
    }); // end of mousetracking


    var calculateColor = function(xPos, yPos) { //first output is the color number, second output is the current angle
      // calculate angle (done with absolute, DOM coordinates)
      // Note that 0 starts at "East" and rotates clockwise.
      var relX = xPos - centerXDom;
      var relY = yPos - centerYDom;
      var curAngle = Math.atan2(relY, relX);
      angleDeg = curAngle / Math.PI * 180.0;
      angleDeg = (angleDeg < 0) ? angleDeg + 360 : angleDeg;

      // change this to an integer
      var imgCol = Math.floor(angleDeg);
      return [imgCol, curAngle];

    }


    // create the color wheel
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

    paper.circle(centerXSVG, centerYSVG, 220).attr({
      stroke: 'none',
      fill: 'none',
      'stroke-width': 2
    });


    // % set the image position based on svg paper dimensions.
    // this may have to be changed depending on the size of the image. The demo images are 100 x 100.
    var imageX = centerXSVG - 80 / 2;
    var imageY = centerYSVG - 80 / 2;

    if (cueIndex !== null) {
      imageX = centerXSVG + itemLocsX[cueIndex] - 80 / 2;
      imageY = centerYSVG + itemLocsY[cueIndex] - 80 / 2;
    }

    // show circle in the cued location
    var g = paper.group();

    Snap.load(currStim, function(fragment) {
      var element = fragment.select('#Layer_1');
      g.add(element);
      element.attr({
        width: "80",
        height: "80",
        x: imageX.toString(), //position of the image, as a string
        y: imageY.toString(), //position of the image, as a string
        //
      });

      // select the image itself within the svg
      var shape = element.select('path');

      $(document).mousemove(function(event) {
        shape.attr({
          "fill": currHexColor
        });


      });

    });
    var startTime = new Date();
    /* Always track the mouse */

    $(document).bind("click.trialResponse", function(e) {
      var rt = (new Date()) - startTime;
      var xClicked = e.pageX;
      var yClicked = e.pageY;

      // Determine what the clicked color is and the true index 
      var responseOutput = calculateColor(xClicked, yClicked);
      var colorNumResponse = responseOutput[0];
      var colorResponse = currColorWheel[colorNumResponse];
      // randomColorVal is the integer that rotates the color wheel so we subtract it.
      var colorResponseTrueIndex = colorNumResponse + randomColorVal
      var colorResponseTrueIndex = ((colorResponseTrueIndex % 360) + 360) % 360;
      var correctColor = colors.colors[targetColorIndex];
      var responseError = targetColorIndex - colorResponseTrueIndex;
      responseError = (responseError < -180) ? responseError + 360 : responseError;
      responseError = (responseError > 180) ? responseError - 360 : responseError;
      
      window.lastContinuousReportTrialData = {
        currColorWheel: currColorWheel,
        randomColorVal: randomColorVal,
        targetColorIndex: targetColorIndex,
        responseError: responseError,
        xClicked: xClicked,
        yClicked: yClicked,
        responseCol: colorResponse,
        responseInd: colorResponseTrueIndex,
        correctCol: correctColor,
        correctColIndex: targetColorIndex,
        cueIndex: cueIndex
      };

      var trial_data = {
        "rt": rt,
        "stimulus": trial.stimulus,
        "condType": trial.condType,
        "xClicked": xClicked,
        "yClicked": yClicked,
        "responseCol": colorResponse,
        "responseInd": colorResponseTrueIndex,
        "responseError": responseError,
        "correctCol": correctColor,
        "correctColIndex": targetColorIndex,
      };

      $(document).unbind("click.trialResponse")
      $(document).unbind("mousemove.overall")

      after_response(trial_data)

    });




    // function to handle responses by the subject
    function after_response(trial_data) {
      // only record first response

      delete startTime;

      if (trial.response_ends_trial) {
        end_trial(trial_data);
      }
    };


    // // function to end trial when it is time
    var end_trial = function(trial_data) {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      display_element.innerHTML = '';

      jsPsych.finishTrial(trial_data);
    };


  };

  return plugin;
})();
