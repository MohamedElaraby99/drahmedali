import { configDotenv } from 'dotenv';
configDotenv();
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js'; 
import courseRoutes from './routes/course.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import miscellaneousRoutes from './routes/miscellaneous.routes.js';
import blogRoutes from './routes/blog.routes.js';
import qaRoutes from './routes/qa.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import adminRechargeCodeRoutes from './routes/adminRechargeCode.routes.js';
import adminUserRoutes from './routes/adminUser.routes.js';
import whatsappServiceRoutes from './routes/whatsappService.routes.js';
import pdfConverterRoutes from './routes/pdfConverter.routes.js';
import examRoutes from './routes/exam.routes.js';
import examResultsRoutes from './routes/examResults.routes.js';
import essayExamRoutes from './routes/essayExam.routes.js';
import draftRoutes from './routes/draft.routes.js';
import videoProgressRoutes from './routes/videoProgress.routes.js';
import deviceManagementRoutes from './routes/deviceManagement.routes.js';
import liveMeetingRoutes from './routes/liveMeeting.routes.js';
import captchaRoutes from './routes/captcha.routes.js';
import courseAccessRoutes from './routes/courseAccess.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import groupRoutes from './routes/group.routes.js';
import financialRoutes from './routes/financial.routes.js';
import courseNotificationRoutes from './routes/courseNotification.routes.js';
import achievementsRoutes from './routes/achievements.routes.js';

import gradeRoutes from './routes/grade.routes.js';
import offlineGradeRoutes from './routes/offlineGrade.routes.js';
import achievementRoutes from './routes/achievement.routes.js';
import instructorRoutes from './routes/instructor.routes.js';
import stageRoutes from './routes/stage.routes.js';
import express from 'express';
import connectToDb from './config/db.config.js';
import errorMiddleware from './middleware/error.middleware.js';
import { checkDeviceAuthorization, logDeviceAccess } from './middleware/deviceAuth.middleware.js';
import { toCairoISOString } from './utils/timezone.js';

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Explicit CORS headers to guarantee preflight success and credentials support
const allowedOrigins = new Set([
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5190',
  'http://127.0.0.1:5190',
  'https://almongz.online',
  'https://www.almongz.online',
  'https://api.almongz.online'
]);

// Add any additional origins from environment variables
if (process.env.ADDITIONAL_CORS_ORIGINS) {
  const additionalOrigins = process.env.ADDITIONAL_CORS_ORIGINS.split(',').map(o => o.trim());
  additionalOrigins.forEach(o => allowedOrigins.add(o));
}

// Extend allowed origins with IPv6 localhost variants
const moreLocalOrigins = [
  'http://[::1]:5173',
  'http://[::1]:5190',
  'http://[::1]:3000'
];
moreLocalOrigins.forEach(o => allowedOrigins.add(o));

// Log allowed origins for debugging
console.log('Allowed CORS origins:', Array.from(allowedOrigins));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Log CORS attempts for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log('CORS request from origin:', origin);
    if (origin && !allowedOrigins.has(origin)) {
      console.log('CORS origin not in allowlist:', origin);
    }
  }
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    // Set CORS headers for preflight
    if (origin && allowedOrigins.has(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
      // If no origin header, allow the request (for same-origin requests)
      res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, x-device-info');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    res.status(200).end();
    return;
  }
  
  // Set CORS headers for actual requests
  if (origin && allowedOrigins.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // If no origin header, allow the request (for same-origin requests)
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, x-device-info');
  
  next();
});

// Serve uploaded files - accessible via /api/v1/uploads/ for production
app.use('/api/v1/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  }
}));

// Backward compatibility - serve uploads on root path as well
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Cache-Control', 'public, max-age=31536000');
  }
}));

// Test route to check uploads
app.get('/api/v1/test-uploads', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, 'uploads');
  
  try {
    const files = fs.readdirSync(uploadsDir);
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4007}`;
    
    res.json({ 
      message: 'Uploads directory accessible',
      files: files.slice(0, 10), // Show first 10 files
      uploadsPath: uploadsDir,
      apiUploadUrl: `${baseUrl}/api/v1/uploads/`,
      legacyUploadUrl: `${baseUrl}/uploads/`,
      sampleUrls: files.slice(0, 3).map(file => ({
        filename: file,
        apiUrl: `${baseUrl}/api/v1/uploads/${file}`,
        legacyUrl: `${baseUrl}/uploads/${file}`
      }))
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error accessing uploads directory',
      error: error.message
    });
  }
});

// Simple test route
app.get('/api/test', (req, res) => {
  console.log('=== API TEST ROUTE HIT ===');
  res.json({ message: 'API is working!' });
});

// CORS test route
app.get('/api/cors-test', (req, res) => {
  console.log('=== CORS TEST ROUTE HIT ===');
  console.log('Origin:', req.headers.origin);
  console.log('Referer:', req.headers.referer);
  res.json({ 
    message: 'CORS test successful!',
    origin: req.headers.origin,
    referer: req.headers.referer,
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    console.log('=== HEALTH CHECK ROUTE HIT ===');
    
    // Test database connection
    let dbStatus = 'unknown';
    try {
      const mongoose = await import('mongoose');
      dbStatus = mongoose.default.connection.readyState === 1 ? 'connected' : 'disconnected';
    } catch (e) {
      dbStatus = 'error';
    }
    
    res.json({
      status: 'healthy',
      timestamp: toCairoISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'unknown',
      cors: {
        allowedOrigins: Array.from(allowedOrigins),
        clientUrl: process.env.CLIENT_URL,
        backendUrl: process.env.BACKEND_URL
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test featured endpoints route
app.get('/api/test-featured', async (req, res) => {
  try {
    console.log('=== TEST FEATURED ENDPOINTS ===');
    
    // Test if we can import the models
    let modelsStatus = {};
    
    try {
      const Subject = (await import('./models/subject.model.js')).default;
      modelsStatus.subjects = 'available';
    } catch (e) {
      modelsStatus.subjects = 'error: ' + e.message;
    }
    
    try {
      const Course = (await import('./models/course.model.js')).default;
      modelsStatus.courses = 'available';
    } catch (e) {
      modelsStatus.courses = 'error: ' + e.message;
    }
    
    try {
      const Instructor = (await import('./models/instructor.model.js')).default;
      modelsStatus.instructors = 'available';
    } catch (e) {
      modelsStatus.instructors = 'error: ' + e.message;
    }
    
    try {
      const Blog = (await import('./models/blog.model.js')).default;
      modelsStatus.blogs = 'available';
    } catch (e) {
      modelsStatus.blogs = 'error: ' + e.message;
    }
    
    res.json({
      message: 'Featured endpoints test',
      timestamp: toCairoISOString(),
      models: modelsStatus,
      environment: process.env.NODE_ENV || 'unknown'
    });
  } catch (error) {
    console.error('Featured endpoints test error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.use('/api/v1/users', userRoutes); 
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);
console.log('Payment routes registered at /api/v1/payments');
app.use('/api/v1/', miscellaneousRoutes);
app.use('/api/v1/', blogRoutes);
app.use('/api/v1/', qaRoutes);
app.use('/api/v1/', subjectRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/admin/recharge-codes', adminRechargeCodeRoutes);
app.use('/api/v1/admin/users', adminUserRoutes);
app.use('/api/v1/whatsapp-services', whatsappServiceRoutes);
app.use('/api/v1/pdf-converter', pdfConverterRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/exam-results', examResultsRoutes);
app.use('/api/v1/essay-exams', essayExamRoutes);
app.use('/api/v1/drafts', draftRoutes);
app.use('/api/v1/video-progress', videoProgressRoutes);
app.use('/api/v1/device-management', deviceManagementRoutes);
app.use('/api/v1/live-meetings', liveMeetingRoutes);
app.use('/api/v1/captcha', captchaRoutes);
app.use('/api/v1/course-access', courseAccessRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/financial', financialRoutes);
app.use('/api/v1/notifications', courseNotificationRoutes);
app.use('/api/v1/achievements', achievementsRoutes);

// Apply device authorization middleware to protected routes
app.use('/api/v1/courses', checkDeviceAuthorization, logDeviceAccess);
app.use('/api/v1/payments', checkDeviceAuthorization, logDeviceAccess);
app.use('/api/v1/wallet', checkDeviceAuthorization, logDeviceAccess);
app.use('/api/v1/exams', checkDeviceAuthorization, logDeviceAccess);
app.use('/api/v1/essay-exams', checkDeviceAuthorization, logDeviceAccess);
app.use('/api/v1/video-progress', checkDeviceAuthorization, logDeviceAccess);
app.use('/api/v1/live-meetings', checkDeviceAuthorization, logDeviceAccess);
app.use('/api/v1/groups', checkDeviceAuthorization, logDeviceAccess);

// Note: Public routes like subjects, blogs, instructors don't need device authorization
// They are accessible without authentication

app.use('/api/v1/grades', gradeRoutes);
app.use('/api/v1/offline-grades', offlineGradeRoutes);
app.use('/api/v1/achievements', achievementRoutes);
app.use('/api/v1/instructors', instructorRoutes);
app.use('/api/v1/stages', stageRoutes);
 

app.all('*', (req, res) => {
    res.status(404).send('OOPS!! 404 page not found');
})

app.use(errorMiddleware);

// db init
connectToDb();

export default app;