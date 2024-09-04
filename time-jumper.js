#!/usr/bin/env node

const { exec } = require("child_process");
const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8")
);
const { version, author, license, description } = packageJson;

function execCommand(command, successMessage, errorMessage) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`${errorMessage}: ${stderr}`);
        reject(error);
      } else {
        console.log(successMessage);
        resolve(stdout);
      }
    });
  });
}

program
  .name("time-jumper")
  .version(version, "-v, --version", "Output the current version")
  .description(description)
  .addHelpText(
    "after",
    `
Additional Information:
  Author: ${author.name}
  License: ${license}
  Repository: ${packageJson.repository?.url || "Not specified"}
`
  );

program
  .command("disable-sync")
  .description("Disable automatic time synchronization")
  .action(() => {
    execCommand(
      "sudo timedatectl set-ntp false",
      "Automatic time synchronization disabled.",
      "Error disabling sync"
    ).catch(() => process.exit(1));
  });

program
  .command("enable-sync")
  .description("Enable automatic time synchronization")
  .action(() => {
    execCommand(
      "sudo timedatectl set-ntp true",
      "Automatic time synchronization enabled.",
      "Error enabling sync"
    ).catch(() => process.exit(1));
  });

program
  .command("jump-time")
  .description("Jump the system time by a specified period, wait, then revert")
  .requiredOption("--hours <hours>", "Period to jump in hours")
  .option("--duration <duration>", "Duration to wait in seconds", "1")
  .action(async ({ hours, duration }) => {
    const hoursToJump = parseInt(hours, 10);
    const durationInSeconds = parseInt(duration, 10);

    const timezone = moment.tz.guess();
    console.log(`Detected timezone: ${timezone}`);

    const now = moment().tz(timezone);
    console.log(`Current time: ${now.format("YYYY-MM-DD HH:mm:ss")}`);

    const newTime = now.clone().add(hoursToJump, "hours");
    console.log(`Jumping to: ${newTime.format("YYYY-MM-DD HH:mm:ss")}`);

    try {
      await execCommand(
        `sudo date -s "${newTime.format("YYYY-MM-DD HH:mm:ss")}"`,
        `Time set to ${newTime.format("YYYY-MM-DD HH:mm:ss")}`,
        "Error setting new time"
      );

      await new Promise((resolve) =>
        setTimeout(resolve, durationInSeconds * 1000)
      );

      await execCommand(
        `sudo date -s "${now.format("YYYY-MM-DD HH:mm:ss")}"`,
        `Time reverted to ${now.format("YYYY-MM-DD HH:mm:ss")}`,
        "Error reverting time"
      );

      console.log("Time jump and revert successful.");
    } catch (error) {
      console.error("Error during time jump process");
      process.exit(1);
    }
  });

program.parse(process.argv);
