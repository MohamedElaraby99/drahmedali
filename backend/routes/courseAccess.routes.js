import { Router } from 'express';
import { isLoggedIn, authorisedRoles } from '../middleware/auth.middleware.js';
import { generateCourseAccessCodes, redeemCourseAccessCode, checkCourseAccess, listCourseAccessCodes, deleteCourseAccessCode, bulkDeleteCourseAccessCodes } from '../controllers/courseAccess.controller.js';

const router = Router();

// Admin endpoints
router.post('/admin/codes', isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), generateCourseAccessCodes);
router.get('/admin/codes', isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), listCourseAccessCodes);
router.delete('/admin/codes/:id', isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), deleteCourseAccessCode);
router.post('/admin/codes/bulk-delete', isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), bulkDeleteCourseAccessCodes);

// User endpoints
router.post('/redeem', isLoggedIn, redeemCourseAccessCode);
router.get('/check/:courseId', isLoggedIn, checkCourseAccess);

export default router;


