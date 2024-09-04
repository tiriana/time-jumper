const { ipcRenderer } = require("electron");

// Select the status span and buttons
const autoTimeStatus = document.getElementById("autoTimeStatus");
const jumpButtons = document.querySelectorAll('button[id^="jump"]');
const disableButton = document.getElementById("disableAutoTime");
const enableButton = document.getElementById("enableAutoTime");

// Function to disable/enable time jump buttons
function setJumpButtonsState(enabled) {
  jumpButtons.forEach((button) => {
    button.disabled = !enabled;
  });
}

// Disable auto time when the button is clicked
disableButton.addEventListener("click", () => {
  ipcRenderer.send("disable-auto-time");
});

// Enable auto time when the button is clicked
enableButton.addEventListener("click", () => {
  ipcRenderer.send("enable-auto-time");
});

// Handle time jump buttons
document.getElementById("jump1h").addEventListener("click", () => {
  ipcRenderer.send("jump-time", 1);
});
document.getElementById("jump5h").addEventListener("click", () => {
  ipcRenderer.send("jump-time", 5);
});
document.getElementById("jump12h").addEventListener("click", () => {
  ipcRenderer.send("jump-time", 12);
});
document.getElementById("jump24h").addEventListener("click", () => {
  ipcRenderer.send("jump-time", 24);
});

// Listen for auto time status updates
ipcRenderer.on("update-auto-time-status", (event, autoTimeEnabled) => {
  if (autoTimeEnabled) {
    autoTimeStatus.textContent = "Enabled";
    setJumpButtonsState(false); // Disable jump buttons
  } else {
    autoTimeStatus.textContent = "Disabled";
    setJumpButtonsState(true); // Enable jump buttons
  }
});
