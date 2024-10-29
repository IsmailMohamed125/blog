exports.routeErrorHandler = (req, res, next) => {
  res.status(404).json({ status: "error", msg: "Route not found!" });
  next();
};

exports.serverErrorHandler = (err, req, res, next) => {
  res.status(500).json({ status: "error", msg: "Internal server error" });
};
