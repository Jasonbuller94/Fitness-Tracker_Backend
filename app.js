require("dotenv").config();
const express = require("express");
const app = express();

// Setup your Middleware and API Router here

app.use(express.json());

const apiRouter = require("./api");

app.use("/api", apiRouter);

app.use((error, req, res, next) => {
  res.send(error);
});

app.get("/api/unknown", (req, res) => {
  res.status(404).send({ message: "The endpoint could not be found." });
});

module.exports = app;
