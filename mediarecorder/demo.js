var ebml = require('ts-ebml');

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
function reconstructIndexOfArrayBuffer(webm_buf) {
  const elms = new ebml.Decoder().decode(webm_buf);

  let metadataElms = []; //: EBML.EBMLElementDetail[] = [];
  let metadataSize = 0;
  let last_duration = 0;
  const cluster_ptrs = []; //: number[] = [];
  const reader = new ebml.EBMLReader();
  reader.logging = true;

  reader.addListener("metadata", ({data, metadataSize: size})=>{
    metadataElms = data;
    metadataSize = size;
  });

  reader.addListener("cluster_ptr", (ptr)=>{
    cluster_ptrs.push(ptr);
  });

  reader.addListener("duration", ({timecodeScale, duration})=>{
    last_duration = duration;
  });

  elms.forEach((elm)=>{ reader.read(elm); });
  reader.stop();

  const refinedMetadataElms =
      tools.putRefinedMetaData(metadataElms, cluster_ptrs, last_duration);
  const refinedMetadataBuf = new ebml.Encoder().encode(refinedMetadataElms);
  const body = webm_buf.slice(metadataSize);

  return new Blob([refinedMetadataBuf, body], {type: "video/webm"});
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
}
function gotStreamFunction(stream) {
  console.log("getUserMedia succeeded :)");
  theStream = stream;
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

	  var superBuffer = new Blob(recordedChunks);
		var reconstructedBlob = reconstructIndex(superBuffer);
	}
}
