const aws = require("aws-sdk");
const fs = require("fs");

const uploadFile = async ({ fileName, filePath, fileType,conversationId }) => {
  return new Promise((resolve, reject) => {
    aws.config.update({
      region: "ap-south-1",
      // You'll need your service's access keys here
      accessKeyId: "AKIAJDJTIM2BXYSWY3TQ",
      secretAccessKey: "qa30r3C5wqJPn0ip+27M+9FGw/BB16f6lCVB3TEM",
    });

    const stream = fs.createReadStream(filePath);
    stream.on("error", function(err) {
      reject(err);
    });

    const s3 = new aws.S3({
      });

    s3.upload(
      {
        ACL: "public-read",
        // You'll input your bucket name here
        Bucket: "faizan123",
        Body: stream,
        Key: `conversations/${conversationId}/${fileName}`,
        ContentType: fileType,
      },
      function(err, data) {
        if (err) {
          reject({key:0,url:0});
         
        } else if (data) {
          resolve({ key: data.Key, url: data.Location });
        }
      }
    );
  });
};

module.exports = { uploadFile };