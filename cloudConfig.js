const cloudinary = require('cloudinary').v2

const {CloudinaryStorage} = require('multer-storage-cloudinary')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'insta',
      allowedFormat:  ['png','jpeg','jpg','MP4','mp4', 'mov'], // supports promises as well
    },
  });

  module.exports = {
    cloudinary: cloudinary,
    storage: storage
  }