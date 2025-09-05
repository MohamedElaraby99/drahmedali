import path from "path";

import multer from "multer";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 mb in size max limit
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      console.log('=== Multer Debug ===');
      console.log('File being processed:', file);
      console.log('Original filename:', file.originalname);
      cb(null, file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    console.log('=== File Filter Debug ===');
    console.log('Checking file:', file.originalname);
    let ext = path.extname(file.originalname);
    console.log('File extension:', ext);
    if (
      ext !== ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".webp" &&
      ext !== ".png" &&
      ext !== ".mp4" &&
      ext !== ".pdf"
    ) {
      console.log('File type rejected:', ext);
      cb(new Error(`Unsupported file type! ${ext}`), false);
      return;
    }
    console.log('File type accepted:', ext);
    cb(null, true);
  },
});

export default upload;
