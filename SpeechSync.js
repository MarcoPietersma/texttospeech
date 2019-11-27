/** @format */

var context; // Audio context
var source; // Audio buffer

function init() {
  if (!window.AudioContext) {
    if (!window.webkitAudioContext) {
      alert(
        "Your browser does not support any AudioContext and cannot play back this audio."
      );
      return;
    }
    window.AudioContext = window.webkitAudioContext;
  }

  context = new AudioContext();
}

async function FetchToken() {
  var returnValue;

  await $.ajax({
    url: "https://westeurope.api.cognitive.microsoft.com/sts/v1.0/issuetoken",
    type: "POST",
    beforeSend: function(xhr) {
      xhr.setRequestHeader(
        "Ocp-Apim-Subscription-Key",
        "9e0045d2987049da9e57903e7837eb5a"
      );
    },
    success: function(data) {
      returnValue = data;
    }
  });

  return returnValue;
}

async function TextToSpeech(token, text) {
  var language = "nl-NL-HannaRUS";
  var audioCtx = context;

  context.resume().then(() => {
    console.log("Playback resumed successfully");
  });

  var ssmlRequest = `
  <speak version='1.0' xml:lang='en-US'>
  <voice xml:lang='en-US' xml:gender='Female' name='en-US-JessaRUS'>
          ${text}
  </voice>
  </speak>`;

  var request = new XMLHttpRequest();
  source = audioCtx.createBufferSource();

  request.open(
    "POST",
    "https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1"
  );

  var tokentoSend = "Bearer " + token;

  request.setRequestHeader("Authorization", tokentoSend);
  request.setRequestHeader(
    "X-Microsoft-OutputFormat",
    "audio-16khz-32kbitrate-mono-mp3"
  );
  request.setRequestHeader("contentType", "application/ssml+xml");

  request.responseType = "arraybuffer";

  request.onload = function() {
    var audioData = request.response;

    audioCtx.decodeAudioData(
      audioData,
      function(buffer) {
        myBuffer = buffer;
        duration = buffer.duration;
        source.buffer = myBuffer;
        source.connect(audioCtx.destination);
        source.loop = false;

        source.start(0);
      },

      function(e) {
        "Error with decoding audio data" + e.error;
      }
    );
  };

  request.send(ssmlRequest);
}
