import express from 'express';
import upload from '../middleware/multer.middleware.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

import {contactUs, stats} from '../controllers/miscellaneous.controller.js';
import {isLoggedIn, authorisedRoles} from '../middleware/auth.middleware.js'

router.post("/contact", contactUs);
router.get("/admin/stats/users", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), stats);

// PDF upload endpoint
router.post('/upload/pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // Move file to uploads/pdfs if not already there
  const uploadsDir = path.join('uploads', 'pdfs');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const ext = path.extname(req.file.originalname);
  const destPath = path.join(uploadsDir, req.file.filename);
  fs.renameSync(req.file.path, destPath);
  const fileUrl = `/uploads/pdfs/${req.file.filename}`;
  return res.status(200).json({ success: true, url: fileUrl, fileName: req.file.filename });
});

// Image upload endpoint
router.post('/upload/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // Move file to uploads/images if not already there
  const uploadsDir = path.join('uploads', 'images');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const destPath = path.join(uploadsDir, req.file.filename);
  fs.renameSync(req.file.path, destPath);
  const fileUrl = `/uploads/images/${req.file.filename}`;
  return res.status(200).json({ success: true, url: fileUrl, fileName: req.file.filename });
});

// Generic file upload endpoint (supports pdf, doc, docx, images)
router.post('/upload/file', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const isImage = req.file.mimetype?.startsWith('image/');
    const isPdf = ext === '.pdf' || req.file.mimetype === 'application/pdf';
    const isDoc = ext === '.doc' || ext === '.docx' || req.file.mimetype?.includes('word');

    let subfolder = 'files';
    if (isImage) subfolder = 'images';
    else if (isPdf) subfolder = 'pdfs';
    else if (isDoc) subfolder = 'files';

    const uploadsDir = path.join('uploads', subfolder);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const destPath = path.join(uploadsDir, req.file.filename);
    fs.renameSync(req.file.path, destPath);

    const fileUrl = `/uploads/${subfolder}/${req.file.filename}`;
    return res.status(200).json({ 
      success: true, 
      url: fileUrl, 
      fileName: req.file.originalname || req.file.filename,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      subfolder
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to save file', error: e.message });
  }
});

export default router;