#!/usr/bin/env node

const { exec } = require("child_process");
const { program } = require("commander");

program
  .version("1.0.0")
  .description("A command-line tool to manage system time on Linux");

program
  .command("disable-sync")
  .description("Disable automatic time synchronization")
  .action(() => {
    exec("sudo timedatectl set-ntp false", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error disabling sync: ${stderr}`);
        process.exit(1);
      }
      console.log("Automatic time synchronization disabled.");
    });
  });

program
  .command("enable-sync")
  .description("Enable automatic time synchronization")
  .action(() => {
    exec("sudo timedatectl set-ntp true", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error enabling sync: ${stderr}`);
        process.exit(1);
      }
      console.log("Automatic time synchronization enabled.");
    });
  });

program
  .command("jump-time")
  .description("Jump the system time to a new time, wait, then revert")
  .requiredOption(
    "-n, --new-time <time>",
    "New time to set (format: YYYY-MM-DDTHH:MM:SS)"
  )
  .requiredOption(
    "-d, --duration <duration>",
    "Duration to wait in milliseconds"
  )
  .action(({ newTime, duration }) => {
    const now = new Date();
    const originalTime = now.toISOString().slice(0, 19).replace("T", " ");

    const command = `
      sudo date -s "${newTime}" &&
      sleep ${duration / 1000} &&
      sudo date -s "${originalTime}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error jumping time: ${stderr}`);
        process.exit(1);
      }
      console.log("Time jump and revert successful.");
    });
  });

program.parse(process.argv);
