const { app, BrowserWindow, ipcMain } = require("electron");
const sudo = require("sudo-prompt"); // For elevated permissions
const path = require("path");

let mainWindow;
let autoTimeEnabled = true; // Track if auto time is enabled
const options = { name: "Time Jumper" };

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
  disableAutoTimeSync(() => {
    autoTimeEnabled = false;
    mainWindow.webContents.send("update-auto-time-status", autoTimeEnabled);
  });
}

app.on("ready", createWindow);

// When the app is closed, re-enable auto-time
app.on("will-quit", (event) => {
  enableAutoTimeSync(() => {
    console.log("Auto time re-enabled on exit.");
  });
});

ipcMain.on("jump-time", (event, hours) => {
  if (!autoTimeEnabled) {
    jumpTime(hours);
  }
});

ipcMain.on("disable-auto-time", (event) => {
  disableAutoTimeSync(() => {
    autoTimeEnabled = false;
    mainWindow.webContents.send("update-auto-time-status", autoTimeEnabled);
  });
});

ipcMain.on("enable-auto-time", (event) => {
  enableAutoTimeSync(() => {
    autoTimeEnabled = true;
    mainWindow.webContents.send("update-auto-time-status", autoTimeEnabled);
  });
});

// Function to jump time
function jumpTime(hours) {
  const currentTime = new Date();
  const newTime = new Date(currentTime.getTime() + hours * 60 * 60 * 1000);
  const newTimeString = newTime.toISOString().slice(0, 19).replace("T", " ");

  console.log(`Jumping time by ${hours} hour(s)`);

  // Adjust system time based on platform
  const osType = process.platform;
  let command;

  if (osType === "win32") {
    command = `date ${newTime.toISOString().slice(0, 10)} && time ${newTime
      .toTimeString()
      .slice(0, 8)}`;
  } else {
    command = `date -s "${newTimeString}"`;
  }

  sudo.exec(command, options, (error, stdout, stderr) => {
    if (error) {
      console.error("Failed to set time:", stderr);
      return;
    }
    console.log("Time set successfully:", stdout);
  });
}

// Disable automatic time synchronization
function disableAutoTimeSync(callback) {
  const osType = process.platform;
  let command;

  if (osType === "win32") {
    command =
      'w32tm /config /manualpeerlist:"",0x8 /syncfromflags:MANUAL /reliable:NO /update && net stop w32time';
  } else {
    command = "timedatectl set-ntp false";
  }

  sudo.exec(command, options, (error, stdout, stderr) => {
    if (error) {
      console.error("Failed to disable auto time:", stderr);
      return;
    }
    console.log("Auto time disabled:", stdout);
    if (callback) callback();
  });
}

// Enable automatic time synchronization
function enableAutoTimeSync(callback) {
  const osType = process.platform;
  let command;

  if (osType === "win32") {
    command = "net start w32time";
  } else {
    command = "timedatectl set-ntp true";
  }

  sudo.exec(command, options, (error, stdout, stderr) => {
    if (error) {
      console.error("Failed to enable auto time:", stderr);
      return;
    }
    console.log("Auto time enabled:", stdout);
    if (callback) callback();
  });
}
