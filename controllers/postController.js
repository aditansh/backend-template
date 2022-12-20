require("dotenv").config();
const { Users, Posts } = require("../models");
const multer = require("multer");
const { s3Upload } = require("../utils/s3upload");

exports.viewPosts = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await Users.findOne({ where: { username }, include: "posts" });

    if (!user) {
      return res.status(400).json({
        status: true,
        msg: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      msg: "err",
    });
  }
};

exports.createPosts = async (req, res) => {
  multer({
    storage: multer.memoryStorage(),
  }).single("file")(req, res, async (err) => {
    const { username, body } = req.body;
    try {
      const user = await Users.findOne({ where: { username } });

      if (!user) {
        return res.status(400).json({
          status: true,
          msg: "User not found",
        });
      }

      const { originalname, buffer } = req.file;

      const post = await Posts.create({
        body,
        userID: user.userID,
      });

      const data = await s3Upload(user.uuid, buffer, originalname);
      if (!data) {
        return res.status(401).json({
          status: false,
          msg: "File not uploaded",
        });
      }

      await post.update({ fileLink: data.Location });

      return res.status(200).json({
        status: true,
        msg: "File uploaded",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        status: false,
        msg: "Server error",
      });
    }
  });
};

exports.updatePost = async (req, res) => {
  try {
    const { postuuid, body } = req.body;
    const fileLink = req.file.path;

    const post = await Posts.update(
      { body, fileLink },
      { where: { uuid: postuuid } }
    );

    if (!post)
      return res.status(400).json({
        status: true,
        msg: "Post not found",
      });

    const rpost = await Posts.findOne({ where: { uuid: postuuid } });
    console.log(rpost);
    return res.status(200).json({
      status: true,
      rpost,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      msg: err,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postuuid } = req.body;

    const post = await Posts.findOne({ where: { uuid: postuuid } });

    if (!post)
      return res.status(400).json({
        status: true,
        msg: "Post not found",
      });
    else {
      const fileLink = post.fileLink;
      
      const data = await Posts.destroy({ where: { uuid: postuuid } });
      if (data)
        return res.status(200).json({
          status: true,
          msg: "Post deleted",
        });
      else
        return res.status(500).json({
          status: false,
          msg: "Post not deleted",
        });
    }
  } catch (err) {
    return res.status(500).json({
      status: false,
      msg: err,
    });
  }
};
