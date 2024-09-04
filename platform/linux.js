const Sudoer = require("electron-sudo").default;
const sudoer = new Sudoer({ name: "Time Jumper App" });

function disableAutoTimeSync(callback) {
  const command = "timedatectl set-ntp false";

  sudoer
    .exec(command)
    .then((result) => {
      console.log("Auto time disabled (Linux):", result);
      callback(null);
    })
    .catch((error) => {
      console.error("Failed to disable auto time (Linux):", error);
      callback(error);
    });
}

function enableAutoTimeSync(callback) {
  const command = "timedatectl set-ntp true";

  sudoer
    .exec(command)
    .then((result) => {
      console.log("Auto time enabled (Linux):", result);
      callback(null);
    })
    .catch((error) => {
      console.error("Failed to enable auto time (Linux):", error);
      callback(error);
    });
}

function jumpTime(newTime, originalTime, duration, callback) {
  const command = `
    sudo date -s "${newTime.toISOString().slice(0, 19).replace("T", " ")}" && 
    sleep ${duration / 1000} && 
    sudo date -s "${originalTime
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")}"`;

  sudoer
    .exec(command)
    .then((result) => {
      console.log("Time jump and revert successful (Linux):", result);
      callback(null);
    })
    .catch((error) => {
      console.error("Failed to jump time (Linux):", error);
      callback(error);
    });
}

module.exports = { disableAutoTimeSync, enableAutoTimeSync, jumpTime };
