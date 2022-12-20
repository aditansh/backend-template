require("dotenv").config();
const AWS = require("aws-sdk");

exports.s3upload = async (id, buffer, originalname) => {
  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });

    const fileExtension = originalname.split(".").pop();

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${id}.${fileExtension}`,
      Body: buffer,
    };
    const data = await s3.upload(params).promise();
    return data;
  } catch (err) {
    console.log(err);
    return false;
  }
};
