const express = require("express");
const cors = require("cors");

// create the Express app
const app = express();

// request body JSON parsing
app.use(express.json());

// enables all CORS requests
app.use(cors());

// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// API routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const booksRouter = require("./routes/books");
const tradesRouter = require("./routes/trades");
const requestsRouter = require("./routes/requests");

app.use("/api", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/books", booksRouter);
app.use("/api/trades", tradesRouter);
app.use("/api/requests", requestsRouter);

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found"
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  let validationErrors = null;
  if (err.errors && err.name === "SequelizeValidationError") {
    validationErrors = err.errors.map((error, index) => {
      return {
        message: error.message,
        type: error.type,
        path: error.path,
        validatorName: error.validatorName
      };
    });
  }

  res.status(err.status || 500).json({
    message: err.message,
    // Important: This is required for
    // the client to identify a validation
    // error.
    name: err.name,
    validationErrors
    // error: {},
  });
});

// set our port
app.set("port", process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get("port"), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
