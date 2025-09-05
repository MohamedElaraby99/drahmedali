import { Router } from "express";
import { 
    getAllSubjects, 
    getSubjectById, 
    createSubject, 
    updateSubject, 
    deleteSubject, 
    getFeaturedSubjects,
    toggleFeatured,
    updateSubjectStatus
} from '../controllers/subject.controller.js';
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

// Public routes
router.get('/subjects', getAllSubjects);
router.get('/subjects/featured', getFeaturedSubjects);
router.get('/subjects/:id', getSubjectById);

// Protected routes (Admin only)
router.post('/subjects', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), upload.single('image'), createSubject);
router.put('/subjects/:id', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), upload.single('image'), updateSubject);
router.delete('/subjects/:id', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), deleteSubject);
router.post('/subjects/:id/toggle-featured', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), toggleFeatured);
router.put('/subjects/:id/status', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), updateSubjectStatus);

export default router; 