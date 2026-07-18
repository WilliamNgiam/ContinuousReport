/**

* plugin for presenting svg images, using the snap.io plugin.
* written by Victoria J.H. Ritvo, 2019
* updated by William X.Q. Ngiam, 2026 (with assistance from Copilot)

 **/


jsPsych.plugins["continuous-report-pres"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'continuous-report-pres',
    description: 'Uses Snap.io to present the memory array in a continuous report task.',
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

    }
  }

  plugin.trial = function(display_element, trial) {

    var new_html = '<div id="jspsych-html-keyboard-response-stimulus">' + trial.stimulus + '</div>';

    // add prompt
    if (trial.prompt !== null) {
      new_html += trial.prompt;
    }

    // draw
    display_element.innerHTML = new_html;

    // get the current stimulus's file location
    var currStim = 'images/stim/circle.svg';

    var svgWidth = 600;
    var svgHeight = 600;
    
    // // create the svg object
    display_element.innerHTML = "<svg id='svg', width = '" + svgWidth.toString() + "', height = '" + svgWidth.toString() + "'/svg>";

    // set the center points (relative to the SVG)
    var centerXSVG = svgWidth / 2;
    var centerYSVG = svgHeight / 2;

    // create a unique color index for each item on every trial
    var colorPool = jsPsych.randomization.shuffleNoRepeats(
      Array.from({ length: colors.colors.length }, function(_, i) {
        return i;
      })
    );

    var itemColIndices = colorPool.slice(0, 4);
    window.trialColors = itemColIndices;
    console.log(itemColIndices)
    // create the snap paper
    var paper = Snap("#svg");

    // load in the images
    var g = paper.group();

    var itemLocsX = [-250, -250, 250, 250];
    var itemLocsY = [-250, 250, -250, 250];

    for (var thisStim = 0; thisStim < itemLocsX.length; thisStim++) {
      var thisX = itemLocsX[thisStim] + centerXSVG - 80 / 2;
      var thisY = itemLocsY[thisStim] + centerYSVG - 80 / 2;
      var rgbCol = colors.colors[itemColIndices[thisStim]];
      var currHexColor = Snap.rgb(rgbCol[0], rgbCol[1], rgbCol[2]);

      (function(x, y, fillColor) {
        Snap.load(currStim, function(fragment) {
          var element = fragment.select('#Layer_1');
          g.add(element);
          element.attr({
            width: "80",
            height: "80",
            x: x.toString(),
            y: y.toString()
          });

          // select the image itself within the svg
          var shape = element.select('path');
          shape.attr({
            "fill": fillColor
          });
        });
      })(thisX, thisY, currHexColor);
    }

    var presentation_start = new Date()

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": itemColIndices,
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-html-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
