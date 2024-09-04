const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const os = require("os");

// Constants
const JUMP_DURATION = 5000; // Duration of the time jump in milliseconds (5 seconds)

// Import platform-specific modules
let platformModule;
switch (os.platform()) {
  case "win32":
    platformModule = require("./platform/windows");
    break;
  case "linux":
    platformModule = require("./platform/linux");
    break;
  case "darwin":
    platformModule = require("./platform/macos");
    break;
  default:
    throw new Error("Unsupported platform");
}

// Application state
let mainWindow;
let autoTimeEnabled = true; // Track if auto time is enabled
let originalTime; // To store the original time before the jump

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Disable auto-time on startup
  platformModule.disableAutoTimeSync(() => {
    autoTimeEnabled = false;
    mainWindow.webContents.send("update-auto-time-status", autoTimeEnabled);
  });
}

app.on("ready", createWindow);

// When the app is closed, re-enable auto-time
app.on("will-quit", (event) => {
  platformModule.enableAutoTimeSync(() => {
    console.log("Auto time re-enabled on exit.");
  });
});

// Handle time jump request
ipcMain.on("jump-time", (event, hours) => {
  if (!autoTimeEnabled) {
    jumpTime(hours);
  }
});

// Handle manual disabling of auto-time sync
ipcMain.on("disable-auto-time", (event) => {
  platformModule.disableAutoTimeSync(() => {
    autoTimeEnabled = false;
    mainWindow.webContents.send("update-auto-time-status", autoTimeEnabled);
  });
});

// Handle manual enabling of auto-time sync
ipcMain.on("enable-auto-time", (event) => {
  platformModule.enableAutoTimeSync(() => {
    autoTimeEnabled = true;
    mainWindow.webContents.send("update-auto-time-status", autoTimeEnabled);
  });
});

// Function to get current time
function getCurrentTime() {
  return new Date();
}

// Function to jump time and revert back after a delay
function jumpTime(hours) {
  originalTime = getCurrentTime(); // Store the original time
  const newTime = new Date(originalTime.getTime() + hours * 60 * 60 * 1000);

  console.log(`Jumping time by ${hours} hour(s)`);

  // Use platform-specific jump time function
  platformModule.jumpTime(newTime, originalTime, JUMP_DURATION, (error) => {
    if (error) {
      console.error("Failed to jump time:", error);
    } else {
      console.log("Time jump and revert successful.");
    }
  });
}
