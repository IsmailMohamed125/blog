const express = require("express");
const { getAllEndpoints } = require("../controllers/api.controller");
const authRouter = require("./authRoutes");

const router = express.Router();
router.use("/auth", authRouter);

router.route("/").get(getAllEndpoints);

module.exports = router;
