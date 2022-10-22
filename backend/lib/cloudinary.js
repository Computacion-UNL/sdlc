const cloudinary = require("cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

cloudinaryMethods = {};

cloudinaryMethods.cloudinaryUpload = (path, options) =>
cloudinary.uploader.upload(path, options);

cloudinaryMethods.cloudinaryDestroy = (public_id, options) =>
cloudinary.uploader.destroy(public_id, options);

module.exports = cloudinaryMethods;


// export const cloudinaryUpload = (path, options) =>
//   cloudinary.uploader.upload(path, options);

// export const cloudinaryDestroy = (public_id, options) =>
//   cloudinary.uploader.destroy(public_id, options);

// export default cloudinary;