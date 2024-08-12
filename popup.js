document.getElementById("startPauseButton").addEventListener("click", () => {
  const startPauseButton = document.getElementById("startPauseButton");
  if (startPauseButton.classList.contains("paused")) {
    startPauseButton.innerHTML = '<i class="fas fa-play"></i> Start';
    startPauseButton.style.backgroundColor = "#28a745";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: startProcessing,
      });
    });
  } else {
    startPauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
    startPauseButton.style.backgroundColor = "#dc3545";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: pauseProcessing,
      });
    });
  }
  startPauseButton.classList.toggle("paused");
});

document.getElementById("goButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "navigateToGoogle" });
});

function startProcessing() {
  window.isProcessingPaused = false;
  processUnreadEmails();
}

function pauseProcessing() {
  window.isProcessingPaused = true;
}
