import { Router } from "express";
import { generateCaptcha, verifyCaptcha } from '../controllers/captcha.controller.js';

const router = Router();

// Generate CAPTCHA challenge
router.get('/generate', generateCaptcha);

// Verify CAPTCHA answer
router.post('/verify', verifyCaptcha);

export default router;
