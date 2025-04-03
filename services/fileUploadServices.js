const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const multer = require('multer');
const path = require('path');
const { s3Client, bucketName, uploadPath } = require('../config/doSpace');

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG, JPG and PNG are allowed!'), false);
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  }
});

const uploadToSpaces = async (file) => {
  const fileName = `${uploadPath}/${Date.now().toString()}${path.extname(file.originalname)}`;
  
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ACL: 'public-read',
    ContentType: file.mimetype
  };

  try {
    const parallelUploads3 = new Upload({
      client: s3Client,
      params
    });

    const result = await parallelUploads3.done();
    return result.Location; // Return the URL of the uploaded file
  } catch (error) {
    console.error('Error uploading to Spaces:', error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadToSpaces
};