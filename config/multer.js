const multer = require("multer");
const path = require("path");

// config multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // makes sure directory exists
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // create a unqiue filename with extention with .extname
    const fname = `${file.fieldname}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, fname);
  }
});

// initialize upload middlewarew
const upload = multer({ storage });

module.exports = {
  upload
};
