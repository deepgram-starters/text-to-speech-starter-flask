const PLAY_STATES = {
  NO_AUDIO: "no_audio",
  LOADING: "loading",
  PLAYING: "playing",
};

let playState = PLAY_STATES.NO_AUDIO;
let audioPlayer;
const textArea = document.getElementById("text-input");
const errorMessage = document.querySelector("#error-message");

// Function to update the play button based on the current state
function updatePlayButton() {
  const playButton = document.getElementById("play-button");
  const icon = playButton.querySelector(".button-icon");

  switch (playState) {
    case PLAY_STATES.NO_AUDIO:
      icon.className = "button-icon fa-solid fa-play";
      break;
    case PLAY_STATES.LOADING:
      icon.className = "button-icon fa-solid fa-circle-notch ";
      break;
    case PLAY_STATES.PLAYING:
      icon.className = "button-icon fa-solid fa-stop";
      break;
    default:
      break;
  }
}

// Function to stop audio
function stopAudio() {
  audioPlayer = document.getElementById("audio-player");
  if (audioPlayer) {
    playState = PLAY_STATES.PLAYING;
    updatePlayButton();
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    audioPlayer = null;
  }
}

// Function to handle the click event on the play button
function playButtonClick() {
  switch (playState) {
    case PLAY_STATES.NO_AUDIO:
      sendData();
      break;
    case PLAY_STATES.PLAYING:
      stopAudio();
      playState = PLAY_STATES.NO_AUDIO;
      updatePlayButton();
      break;
    default:
      break;
  }
}

textArea.addEventListener("input", () => {
  errorMessage.innerHTML = "";
});

// Function to send data to backend
function sendData() {
  const modelSelect = document.getElementById("models");
  const selectedModel = modelSelect.options[modelSelect.selectedIndex].value;
  const textInput = document.getElementById("text-input").value;
  if (!textInput) {
    errorMessage.innerHTML = "ERROR: Please add text!";
  } else {
    playState = PLAY_STATES.LOADING;
    updatePlayButton();

    const data = {
      model: selectedModel,
      text: textInput,
    };
    fetch("http://127.0.0.1:5000/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        playState = PLAY_STATES.PLAYING;
        updatePlayButton();

        // Check if there's an existing audio source and stop it
        stopAudio();

        // Create a Blob from the response data
        return response.blob();
      })
      .then((blob) => {
        // Create an object URL from the Blob
        const audioUrl = URL.createObjectURL(blob);

        // Create an audio element and play the audio URL
        const audioPlayer = document.getElementById("audio-player");
        audioPlayer.src = audioUrl;
        audioPlayer.play();

        audioPlayer.addEventListener("ended", () => {
          playState = PLAY_STATES.NO_AUDIO;
          updatePlayButton();
        });
      })
      .catch((error) => {
        console.error("Error fetching audio:", error);
        playState = PLAY_STATES.NO_AUDIO;
        updatePlayButton();
      });
  }
}

// Event listener for the click event on the play button
document
  .getElementById("play-button")
  .addEventListener("click", playButtonClick);
