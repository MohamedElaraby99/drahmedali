import express from 'express';
const router = express.Router();
import { isLoggedIn, authorisedRoles } from '../middleware/auth.middleware.js';
import {
  createGrade,
  getAllGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
  addSubjectsToGrade,
  removeSubjectsFromGrade,
  getGradesWithSubjectsCount
} from '../controllers/grade.controller.js';

// All routes require authentication and admin role
router.use(isLoggedIn);
router.use(authorisedRoles('ADMIN', 'SUPER_ADMIN'));

// Create a new grade
router.post('/', createGrade);

// Get all grades with optional filtering
router.get('/', getAllGrades);

// Get grades with subjects count (for dashboard)
router.get('/with-subjects-count', getGradesWithSubjectsCount);

// Get grade by ID
router.get('/:id', getGradeById);

// Update grade
router.put('/:id', updateGrade);

// Delete grade
router.delete('/:id', deleteGrade);

// Add subjects to grade
router.post('/:id/subjects', addSubjectsToGrade);

// Remove subjects from grade
router.delete('/:id/subjects', removeSubjectsFromGrade);

export default router; 