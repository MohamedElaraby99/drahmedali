import express from 'express';
import {
  createGrade,
  getAllGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
  downloadTemplate,
  uploadGradesFromExcel,
  getOfflineFiles,
  getGradesStatistics,
  bulkDeleteGrades,
  getGradesByStudentName,
  upload
} from '../controllers/offlineGrade.controller.js';
import { isLoggedIn, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(isLoggedIn);
router.use(requireAdmin);

// CRUD Routes
router.post('/', createGrade); // CREATE
router.get('/', getAllGrades); // READ (with pagination and filters)
router.get('/statistics', getGradesStatistics); // READ Statistics
router.get('/student/:studentName', getGradesByStudentName); // READ by student name

// Template and Upload Routes - These must come BEFORE parameterized routes
router.get('/download-template/:groupId', downloadTemplate);
router.get('/offline-files', getOfflineFiles);
router.post('/upload-offline', upload.single('file'), uploadGradesFromExcel);

// Parameterized routes - These must come AFTER specific routes
router.get('/:id', getGradeById); // READ Single
router.put('/:id', updateGrade); // UPDATE
router.delete('/:id', deleteGrade); // DELETE
router.post('/bulk-delete', bulkDeleteGrades); // BULK DELETE

export default router;
