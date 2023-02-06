require("dotenv").config();
const { Users } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, username, password } = req.body;

    if (!(firstName && lastName && username && password)) {
      return res.status(400).json({
        status: false,
        message: "All inputs are required",
      });
    }

    const oldUser = await Users.findOne({ where: { username: username } });

    if (oldUser) {
      return res.status(409).json({
        status: false,
        message: "User already exists",
      });
    }

    encryptedPassword = await bcrypt.hash(password, 10);

    const user = {
      firstName,
      lastName,
      username,
      password: encryptedPassword,
    };

    const accessToken = jwt.sign(
      { username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { username },
      process.env.REFRESH_TOKEN_SECRET
    );
    user.refreshToken = refreshToken;

    await Users.create(user);

    user.password = undefined;

    return res.status(201).json({
      status: true,
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    console.log(err);
    res.send({
      status: false,
      message: err,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!(username && password)) {
      return res.status(400).json({
        status: false,
        message: "All inputs are required",
      });
    }

    const user = await Users.findOne({ where: { username: username } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = jwt.sign(
        { username },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );
      const refreshToken = jwt.sign(
        { username },
        process.env.REFRESH_TOKEN_SECRET
      );

      await Users.update(
        { refreshToken: refreshToken },
        { where: { username: username } }
      );

      return res.status(200).json({
        status: true,
        user,
        refreshToken,
        accessToken,
      });
    }

    return res.status(400).json({
      status: false,
      msg: "Invalid credentials",
    });
  } catch (err) {
    res.send({
      staus: false,
      msg: err,
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.send(401);
    }

    const user = await Users.findOne({ where: { refreshToken: refreshToken } });

    if (!user) {
      return res.send(403);
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          res.send(403);
        }
      }
    );

    const accessToken = jwt.sign(
      { username: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ accessToken });
  } catch (err) {
    console.log(err);
  }
};

exports.logout = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.status(204);

  const user = await Users.findOne({ where: { refreshToken: refreshToken } });

  if (!user)
    return res.status(204).json({ status: false, msg: "User not found" });

  const userID = user.userID;

  await Users.update({ refreshToken: null }, { where: { userID: userID } });

  res.clearCookie("refreshToken");
  return res.sendStatus(204);
};
