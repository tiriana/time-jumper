const { exec } = require("child_process");

function disableAutoTimeSync(callback) {
  const command =
    'w32tm /config /manualpeerlist:"",0x8 /syncfromflags:MANUAL /reliable:NO /update && net stop w32time';

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Failed to disable auto time (Windows):", stderr);
      return callback(error);
    }
    console.log("Auto time disabled (Windows):", stdout);
    callback(null);
  });
}

function enableAutoTimeSync(callback) {
  const command = "net start w32time";

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Failed to enable auto time (Windows):", stderr);
      return callback(error);
    }
    console.log("Auto time enabled (Windows):", stdout);
    callback(null);
  });
}

function jumpTime(newTime, originalTime, duration, callback) {
  const command = `
    date ${newTime.toISOString().slice(0, 10)} && time ${newTime
    .toTimeString()
    .slice(0, 8)} && 
    timeout /t ${duration / 1000} && 
    date ${originalTime.toISOString().slice(0, 10)} && time ${originalTime
    .toTimeString()
    .slice(0, 8)}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Failed to set time (Windows):", stderr);
      return callback(error);
    }
    console.log("Time jump and revert successful (Windows):", stdout);
    callback(null);
  });
}

module.exports = { disableAutoTimeSync, enableAutoTimeSync, jumpTime };
