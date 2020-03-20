const multer = require("multer");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg"
};
const fileUpload = multer({
  limits: 50000,
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, ext);
    }
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mine type!");
    cb(error, isValid);
  }
});

module.exports = fileUpload;
