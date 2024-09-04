#!/usr/bin/env node

const { exec } = require("child_process");
const { program } = require("commander");
const fs = require("fs");
const path = require("path");

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8")
);
const { version, author, license, description } = packageJson;

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
    );
  });

program
  .command("enable-sync")
  .description("Enable automatic time synchronization")
  .action(() => {
    execCommand(
      "sudo timedatectl set-ntp true",
      "Automatic time synchronization enabled.",
      "Error enabling sync"
    );
  });

program
  .command("jump-time")
  .description("Jump the system time by a specified period, wait, then revert")
  .requiredOption("--hours <hours>", "Period to jump in hours")
  .option("--duration <duration>", "Duration to wait in seconds", "1")
  .action(({ hours, duration }) => {
    const hoursToMillis = parseInt(hours, 10) * 3600 * 1000;
    const durationInMillis = parseInt(duration, 10) * 1000;

    const now = new Date();
    const originalTime = now.toISOString().slice(0, 19).replace("T", " ");
    const newTime = new Date(now.getTime() + hoursToMillis);
    const newTimeStr = newTime.toISOString().slice(0, 19).replace("T", " ");

    const commands = `
      sudo timedatectl set-ntp false &&
      sudo date -s "${newTimeStr}" &&
      sleep ${durationInMillis / 1000} &&
      sudo date -s "${originalTime}" &&
      sudo timedatectl set-ntp true`;

    execCommand(
      commands,
      "Time jump and revert successful.",
      "Error jumping time"
    );
  });

program.parse(process.argv);
