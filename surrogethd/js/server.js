const app = require("./app");

// Configure console logging statements
require("console-stamp")(console);

app.listen(8080, () => {
  console.info("surrogethd listening on port 8080");
});
