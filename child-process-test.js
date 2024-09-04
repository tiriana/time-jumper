const { exec } = require("child_process");

exec("sudo ls -la", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${error}`);
    return;
  }

  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }

  console.log(`stdout: ${stdout}`);
});
