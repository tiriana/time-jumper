const sudo = require("sudo-prompt");
const options = { name: "Test" };

sudo.exec("whoami", options, (error, stdout, stderr) => {
  if (error) {
    console.error("Error:", stderr);
    return;
  }
  console.log("Result:", stdout);
});
