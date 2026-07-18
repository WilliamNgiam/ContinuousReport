# jsPsych Continuous-Report Task Demo

This is a demo of the continuous-report task (also known as a delayed-estimation task) for color working memory (e.g. Zhang & Luck, 2008). This demo is "playable" [here](https://williamngiam.github.io/ContinuousReport); it consists of five trials at set-size of four, with feedback included.

This demo uses custom jsPsycb plugins that were adapted from [this repository by Victoria Ritvo](https://github.com/vej/DemoContinuousReport). There are [three notable plugins](plugins), designed for each stage of the continuous-report trial (`continuous-report-pres`, `continuous-report-response`, `continuous-report-feedback`) that can be customized for variations to the experiment (i.e. stimuli, set-size, timings, etc.).

## Continuous-Report Plugins

The [custom continuous-report plugins](plugins) were adapted from the jspsych-html-keyboard-response plugin, and make use of Snap.svg library to present SVGs (see [libraries](libraries).

The [**continuous-report-pres**](plugins/jspsych-continuous-report-pres.js) plugin handles presentation of the memory array. It is currently hard-coded to present four randomly selected colors (set in [colors.js](colors.js)) on each trial; one presented in each quadrant of the screen.

The [**continuous-report-response**](plugins/jspsych-continuous-report-response.js) plugin handles the response. A random item is cued on each trial (set in `trialVariables` in [index.html](index.html)) using a location cue. A color wheel showing all possible colors (randomly rotated on each trial) is displayed in the middle of the screen; a pointer on the wheel tracks the mouse cursor and displays the mouse-over color on the location cue. A response is locked in by clicking anywhere on the screen.

The [**continuous-report-feedback**](plugins/jspsych-continuous-report-feedback.js) plugin handles the feedback (optional for the task design). The clicked response is indicated with a red pointer line on the color wheel; the correct color is indicated with a green pointer line on the color wheel. A points value is displayed in the middle of the screen; calculated as 100 minus the absolute error. These points can be added across the trials and displayed to the participant (currently coded within the index.html itself). 

## Prerequisites

The following is provided in the [libraries](libraries). This was written for an early version of jsPsych – I will be updating for jsPsych v8 soon.

* [jsPsych](https://www.jspsych.org/)  - Javascript library for running behavioral experiments in a web browser.
* [JQuery](https://jquery.com/) - Javascript library.
* [Snap.svg](http://snapsvg.io/) Javascript library for handling svgs, vector graphics (necessary for changing the image colors).

## Contents

#### index.html
This is the main task. Run this to start the demo experiment. All other files are called within this one.

#### colors.js
This is the array of colors to be used for the color wheel.

#### images/stim/circle.svg
A SVG of a white circle for this experiment.

#### css/custom.css
This is not a necessary file, but task.html loads this for some specifications for this particular demo.
