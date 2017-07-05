var Demo =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var ebml = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"ts-ebml\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

async function reconstructIndex(blob) {
  return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function (event) {
          resolve(reconstructIndexOfArrayBuffer(reader.result));
      };
      reader.onerror = function (error) {
          reject(error);
      };
      reader.readAsArrayBuffer(blob);
    });
}

// Extracted from [1] changing input to ArrayBuffer directly and returning the
// reconstructed Blob.
// [1] https://github.com/legokichi/ts-ebml/issues/2#issuecomment-294293842
function reconstructIndexOfArrayBuffer(webmBuf) {
  let lastDuration = 0;
  const clusterPtrs = []; //: number[] = [];

  const elements = new ebml.Decoder().decode(webmBuf);
  elements.forEach((element) => {
    if (element.type != "b")
      console.log(element.name + ' => ' + element.value);
  });

  const correctedElements =
      ebml.tools.putRefinedMetaData(elements, clusterPtrs, lastDuration);
  correctedElements.forEach((element) => {
    if (element.type != "b")
      console.log(element.name + ' => ' + element.value);
  });

  const refined_buf = new ebml.Encoder().encode(correctedElements);
  return new Blob([refined_buf, webmBuf], {type: "video/webm"});
}


function saveByteArray(data, name) {
  var blob = new Blob(data, {type: "video/webm"});
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}


const width = 640;
const height = 480;
var constraintsWidthXHeight = {
  "audio": false,
  "video": {
    "mandatory": {
      "minWidth": width,
      "maxWidth": width,
      "minHeight": height,
      "maxHeight": height,
    },
    "optional": [{ echoCancellation : false}]
  }
};
var recordedChunks = [];
var theStream;
var theRecorder;
function recorderOnDataAvailable(event) {
  // |event.data.size| can be printed out for debugging..
  recordedChunks.push(event.data);
}
function recorderOnStop() {
  console.log('recorderOnStop fired');
  var superBuffer = new Blob(recordedChunks);
  reconstructIndex(superBuffer)
      .then((reconstructed_blob) => {
        console.log('reconstructed blob of size ' + reconstructed_blob.size);
        saveByteArray(recordedChunks, 'test.webm');
      })
      .catch((e) => {
        console.error(e.message);
      });
}
function gotStreamFunction(stream) {
  console.log("getUserMedia succeeded :)");
  theStream = stream;
  document.getElementById("video").src = URL.createObjectURL(stream);
  try {
    recorder = new MediaRecorder(stream);
  } catch (e) {
    console.assert(false, 'Exception while creating MediaRecorder: ' + e);
    return;
  }
  theRecorder = recorder;
  recorder.ondataavailable = recorderOnDataAvailable;
  recorder.onstop = recorderOnStop;
  recorder.start();
}
function getUserMediaFailedCallback(error) {
  console.error('User media request denied with error code ' + error.code);
}

module.exports = {
  startRecording : function() {
    navigator.webkitGetUserMedia(constraintsWidthXHeight,
                                 gotStreamFunction,
                                 getUserMediaFailedCallback);
  },
  stopRecording : function() {
    theRecorder.stop();
    theStream.getTracks().forEach((track) => { track.stop(); });
  }
}


/***/ })
/******/ ]);