const endpoints = require("../endpoints.json");

const getAllEndpoints = (req, res, next) => {
  res.status(200).send({ endpoints: endpoints });
};

module.exports = { getAllEndpoints };
