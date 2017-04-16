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
        fileReader.readAsArrayBuffer(blob);
      });
}

// Extracted from [1] changing input to ArrayBuffer directly and returning the
// reconstructed Blob.
// [1] https://github.com/legokichi/ts-ebml/issues/2#issuecomment-294293842
function reconstructIndexOfArrayBuffer(webm_buf) {
  const elms = new Decoder().decode(webm_buf);

  let metadataElms = []; //: EBML.EBMLElementDetail[] = [];
  let metadataSize = 0;
  let last_duration = 0;
  const cluster_ptrs = []; //: number[] = [];
  const reader = new EBMLReader();
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
  const refinedMetadataBuf = new Encoder().encode(refinedMetadataElms);
  const body = webm_buf.slice(metadataSize);

  return new Blob([refinedMetadataBuf, body], {type: "video/webm"});
}
