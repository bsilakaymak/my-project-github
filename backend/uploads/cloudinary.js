const cloudinary = require("cloudinary").v2;
const config = require("config");
const cloud_name = config.get("CLOUD_NAME");
const api_key = config.get("CLOUDINARY_API_KEY");
const api_secret = config.get("CLOUDINARY_API_SECRET");
cloudinary.config({
  cloud_name,
  api_key,
  api_secret
});

module.exports = cloudinary;
