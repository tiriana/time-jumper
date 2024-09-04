const sudo = require("sudo-prompt");
const options = {
  name: "Time Jumper Test",
};

sudo.exec("ls -la", options, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
  } else {
    console.log(`stdout: ${stdout}`);
  }
});
