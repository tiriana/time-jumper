const { exec } = require("child_process");

function disableAutoTimeSync(callback) {
  const command = "sudo systemsetup -setusingnetworktime off";

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Failed to disable auto time (macOS):", stderr);
      return callback(error);
    }
    console.log("Auto time disabled (macOS):", stdout);
    callback(null);
  });
}

function enableAutoTimeSync(callback) {
  const command = "sudo systemsetup -setusingnetworktime on";

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Failed to enable auto time (macOS):", stderr);
      return callback(error);
    }
    console.log("Auto time enabled (macOS):", stdout);
    callback(null);
  });
}

function jumpTime(newTime, originalTime, duration, callback) {
  const command = `
    sudo date "${newTime.toISOString().slice(0, 10)} ${newTime
    .toTimeString()
    .slice(0, 8)}" && 
    sleep ${duration / 1000} && 
    sudo date "${originalTime.toISOString().slice(0, 10)} ${originalTime
    .toTimeString()
    .slice(0, 8)}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Failed to set time (macOS):", stderr);
      return callback(error);
    }
    console.log("Time jump and revert successful (macOS):", stdout);
    callback(null);
  });
}

module.exports = { disableAutoTimeSync, enableAutoTimeSync, jumpTime };
