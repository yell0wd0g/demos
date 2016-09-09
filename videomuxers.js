// This file provides functions to insert video/auio into container(s).

// IVF is a simple file format to transport VP8/9 data. It essentially has a
// per-file header and a per-frame header.
// https://wiki.multimedia.cx/index.php?title=IVF

// Generates and returns the header for a given #frames and a codec index (
// which should be a number 8 or 9, for VP8 and VP9, respectively).
function ivfHeader(numFrames, codecIndex) {
  var header = new ArrayBuffer(32);
  // bytes 0-3    signature: 'DKIF'
  var view = new Int8Array(header);
  view[0] = "D".charCodeAt(0);
  view[1] = "K".charCodeAt(0);
  view[2] = "I".charCodeAt(0);
  view[3] = "F".charCodeAt(0);
  // bytes 4-5    version (should be 0)
  view[4] = 0;
  view[5] = 0;
  // bytes 6-7    length of header in bytes
  new DataView(header, 6).setInt16(0, 32, true /* littleEndian */);
  // bytes 8-11   codec FourCC (e.g., 'VP80')
  view[8]  = "V".charCodeAt(0);
  view[9]  = "P".charCodeAt(0);
  console.assert(codecIndex == 8 || codecIndex == 9,
                 "Only VP8 and VP9 are supported", codecIndex);
  view[10] = codecIndex + 0x30;
  view[11] = "0".charCodeAt(0);
  // bytes 12-13  width in pixels
  new DataView(header, 12).setInt16(0, 320, true /* littleEndian */);
  // bytes 14-15  height in pixels
  new DataView(header, 14).setInt16(0, 240, true /* littleEndian */);
  // bytes 16-19  frame rate (a.k.a timescale denum)
  // bytes 20-23  time scale (a.k.a timescale numerator)
  // Both are used in conjunction to define the units of the timescale later on.
  new DataView(header, 16).setInt32(0, 30000, true /* littleEndian */);
  new DataView(header, 20).setInt32(0, 1000, true /* littleEndian */);
  // bytes 24-27  number of frames in file
  new DataView(header, 24).setInt32(0, numFrames, true /* littleEndian */);
  // bytes 28-31  unused
  new DataView(header, 28).setInt32(0, 0, true /* littleEndian */);

  return header;
}

// Generates and returns the per-frame IVF header for a given index and size.
function ivfFrameHeader(size, index, isDebugMode = false) {
  if (isDebugMode)
    console.log(index + ' frame of size ' + size);

  var frame_header = new ArrayBuffer(12);
  // bytes 0-3    size of frame in bytes (not including the 12-byte header)
  new DataView(frame_header).setInt32(0, size, true /* littleEndian */);
  // bytes 4-11   64-bit presentation timestamp
  new DataView(frame_header, 4).setInt32(0, index, true /* littleEndian */);
  new DataView(frame_header, 8).setInt32(0, 0, true /* littleEndian */);
  // bytes 12..   frame data
  return frame_header;
}
