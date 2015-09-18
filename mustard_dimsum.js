/* global URL */

function createButton(id, text, onClick) {
  const button = document.createElement("input");
  button.id = id;
  button.type = "button";
  button.value = text;
  button.onclick = onClick;
  document.body.appendChild(button);
  console.log("Button " + id + " created");
}

function createVideoTag(id, width, height, video_source) {
  const videoTag = document.createElement('video');
  if (video_source != '')
    videoTag.src = URL.createObjectURL(video_source);
  videoTag.id = id;
  videoTag.width = width;
  videoTag.height = height;
  document.body.appendChild(videoTag);
  videoTag.autoplay = true;
  console.log("VideoTag " + id + " created");
}