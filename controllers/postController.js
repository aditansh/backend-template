require("dotenv").config();
const { Users, Posts } = require("../models");
const multer = require("multer");
const { s3upload } = require("../utils/s3upload");
const { s3delete } = require("../utils/s3delete");

var limits = { fileSize: 1024 * 1024 }; //1 MB

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
    limits: limits,
  }).single("file")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        status: false,
        msg: "File size too large",
      });
    }
    try {
      console.log(req.file);
      const { username, body } = req.body;
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

      const data = await s3upload(post.uuid, buffer, originalname);
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
  multer({
    storage: multer.memoryStorage(),
    limits: limits,
  }).single("file")(req, res, async (err) => {
    if(err){
      return res.status(400).json({
        status: false,
        msg: "File size too large",
      });
    }
    try {
      const { postuuid, body } = req.body;
      const post = await Posts.findOne({ where: { uuid: postuuid } });
      if (!post) {
        res.status(400).json({
          status: false,
          msg: "Post not found",
        });
      }
      const { originalname, buffer } = req.file;

      const deleteFile = await s3delete(postuuid);
      if (!deleteFile) {
        return res.status(401).json({
          status: false,
          msg: "Old file not deleted",
        });
      }

      const data = await s3upload(post.uuid, buffer, originalname);
      if (!data) {
        return res.status(401).json({
          status: false,
          msg: "New file not uploaded",
        });
      }

      await post.update({ fileLink: data.Location });

      return res.status(200).json({
        status: true,
        msg: "Post updated",
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
      const deleteFile = await s3delete(postuuid);
      if (!deleteFile) {
        return res.status(401).json({
          status: false,
          msg: "File not deleted",
        });
      }

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
      msg: "err",
    });
  }
};
