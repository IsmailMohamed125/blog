const prisma = require("../db/prisma");
const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const signUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", errors: errors.array() });
    }
    const { username, email, password, avatarURL } = req.body;
    const usernameExists = await prisma.user.findUnique({
      where: { username },
    });
    if (usernameExists) {
      return res
        .status(400)
        .json({ status: "error", msg: "Username already exists" });
    }
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });
    if (emailExists) {
      return res
        .status(400)
        .json({ status: "error", msg: "Email already exists" });
    }
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);
    const avatar = avatarURL
      ? avatarURL
      : `https://avatar.iran.liara.run/username?username=${username}`;
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashPassword,
        avatar_url: avatar,
      },
    });
    if (newUser) {
      generateToken(newUser.id, res);
      res.status(201).json({
        status: "success",
        data: {
          id: newUser.id,
          username: newUser.username,
          avatar: newUser.avatar_url,
        },
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(400).json({ status: "error", msg: "Invalid username" });
    }
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ status: "error", msg: "Invalid password" });
    }
    generateToken(user.id, res);
    res.status(200).json({
      status: "success",
      data: {
        id: user.id,
        username: user.username,
        avatar: user.avatar_url,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ status: "success", msg: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const userRefresh = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      id: user.id,
      username: user.username,
      avatar: user.avatar_url,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { signUp, login, logout, userRefresh };
