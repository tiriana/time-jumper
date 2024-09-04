var Sudoer = require("electron-sudo").default;
var options = { name: "electron sudo application" };
var sudoer = new Sudoer(options);
sudoer
  .spawn("echo", ["$PARAM"], { env: { PARAM: "VALUE" } })
  .then(function (cp) {
    /*
    cp.output.stdout (Buffer)
    cp.output.stderr (Buffer)
  */
  });
