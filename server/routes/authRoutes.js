const express = require("express");
const {
  signUp,
  login,
  logout,
  userRefresh,
} = require("../controllers/auth.controller");
const { validateSignUp } = require("../middleware/validation");
const protectRoute = require("../middleware/protectRoute");

const router = express.Router();

router.route("/signup").post(validateSignUp, signUp);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/refresh").get(protectRoute, userRefresh);

module.exports = router;
