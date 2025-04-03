const { S3Client } = require('@aws-sdk/client-s3');
const { fromEnv } = require('@aws-sdk/credential-provider-env');

const spacesEndpoint = process.env.DO_SPACES_URI.replace('https://', '');

const s3Client = new S3Client({
  endpoint: `https://${spacesEndpoint}`,
  region: process.env.DO_S3_REGION,
  credentials: {
    accessKeyId: process.env.DO_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.DO_S3_SECRET_ACCESS_KEY
  },
  forcePathStyle: false, // Configures to use subdomain/virtual calling format
});

module.exports = {
  s3Client,
  bucketName: process.env.DO_S3_BUCKET_NAME,
  uploadPath: process.env.DO_PATH
};