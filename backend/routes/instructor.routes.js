import express from 'express';
const router = express.Router();
import { isLoggedIn, authorisedRoles } from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';
import {
  createInstructor,
  getAllInstructors,
  getFeaturedInstructors,
  getInstructorById,
  updateInstructor,
  deleteInstructor,
  getInstructorStats
} from '../controllers/instructor.controller.js';

// Public routes
router.get('/', getAllInstructors);
router.get('/featured', getFeaturedInstructors);
router.get('/:id', getInstructorById);
router.get('/:id/stats', getInstructorStats);

// Protected routes (Admin only)
router.post('/', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), upload.single('profileImage'), createInstructor);
router.put('/:id', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), upload.single('profileImage'), updateInstructor);
router.delete('/:id', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), deleteInstructor);


export default router; 