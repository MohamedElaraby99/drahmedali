import express from 'express';
import { convertPdfToImages, getConvertedImage, testPdfExists, healthCheck } from '../controllers/pdfConverter.controller.js';
import { isLoggedIn } from '../middleware/auth.middleware.js';

const router = express.Router();

// Health check endpoint
router.get('/health', healthCheck);

// Test if PDF exists
router.get('/test/:filename', testPdfExists);

// Convert PDF to images
router.post('/convert', isLoggedIn, convertPdfToImages);

// Get converted image
router.get('/image/:filename', getConvertedImage);

export default router;
