require("dotenv").config();
const AWS = require("aws-sdk");

exports.s3delete = async (id) => {
  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${id}.pdf`
    };
    await s3.deleteObject(params).promise();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
