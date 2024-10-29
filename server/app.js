const express = require("express");
const cookieParser = require("cookie-parser");
const apiRouter = require("./routes/apiRoutes");
const {
  routeErrorHandler,
  serverErrorHandler,
} = require("./controllers/error.controller");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", apiRouter);

// Error-handlers
app.all("/*", routeErrorHandler);
app.use(serverErrorHandler);

module.exports = app;
