const multer = require("multer");
const path = require("path");
const supabase = require("./supabaseClient");

// config multer storage for local disk storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // makes sure directory exists
//     cb(null, "public/uploads/");
//   },
//   filename: (req, file, cb) => {
//     // create a unqiue filename with extention with .extname
//     const fname = `${file.fieldname}-${Date.now()}${path.extname(
//       file.originalname
//     )}`;
//     cb(null, fname);
//   }
// });

// initialize upload middlewarew
// const upload = multer({ storage });

// config multer for memory storage to upload to a cloud server
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    return cb(new Error("Video files are not allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // limit file size to 5MB
  }
});

module.exports = {
  upload
};
