const fs = require("fs");
const path = require("path");

const COMMAND_FILE = "/tmp/command_queue";
const OUTPUT_FILE = "/tmp/service_output";

// Helper function to send commands to the background service
function sendCommand(command, callback) {
  fs.writeFile(path.resolve(COMMAND_FILE), command, (err) => {
    if (err) {
      console.error("Failed to write command:", err);
      return callback(err);
    }
    // Optionally wait for a bit for the command to be executed
    setTimeout(() => {
      fs.readFile(path.resolve(OUTPUT_FILE), "utf8", (err, data) => {
        if (err) {
          console.error("Failed to read output:", err);
          return callback(err);
        }
        callback(null, data);
      });
    }, 1000); // Adjust as needed
  });
}

function disableAutoTimeSync(callback) {
  const command = "timedatectl set-ntp false";
  sendCommand(command, (error, stdout) => {
    if (error) {
      console.error("Failed to disable auto time (Linux):", error);
      return callback(error);
    }
    console.log("Auto time disabled (Linux):", stdout);
    callback(null);
  });
}

function enableAutoTimeSync(callback) {
  const command = "timedatectl set-ntp true";
  sendCommand(command, (error, stdout) => {
    if (error) {
      console.error("Failed to enable auto time (Linux):", error);
      return callback(error);
    }
    console.log("Auto time enabled (Linux):", stdout);
    callback(null);
  });
}

function jumpTime(newTime, originalTime, duration, callback) {
  const newTimeStr = newTime.toISOString().slice(0, 19).replace("T", " ");
  const originalTimeStr = originalTime
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const command = `
    date -s "${newTimeStr}" && 
    sleep ${duration / 1000} && 
    date -s "${originalTimeStr}"`;

  sendCommand(command, (error, stdout) => {
    if (error) {
      console.error("Failed to jump time (Linux):", error);
      return callback(error);
    }
    console.log("Time jump and revert successful (Linux):", stdout);
    callback(null);
  });
}

module.exports = { disableAutoTimeSync, enableAutoTimeSync, jumpTime };
