import { Router } from 'express';
import {
  getAllCenters,
  getActiveCenters,
  getCenterById,
  createCenter,
  updateCenter,
  deleteCenter,
  bulkDeleteCenters,
  toggleCenterStatus,
  getCentersStats
} from '../controllers/center.controller.js';
import { isLoggedIn, authorisedRoles } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes (for signup form)
router.get('/active', getActiveCenters);

// Protected routes - Admin only
router.use(isLoggedIn);

// Admin routes
router.get('/stats', authorisedRoles('ADMIN', 'SUPER_ADMIN'), getCentersStats);
router.get('/', authorisedRoles('ADMIN', 'SUPER_ADMIN'), getAllCenters);
router.get('/:id', authorisedRoles('ADMIN', 'SUPER_ADMIN'), getCenterById);
router.post('/', authorisedRoles('ADMIN', 'SUPER_ADMIN'), createCenter);
router.put('/:id', authorisedRoles('ADMIN', 'SUPER_ADMIN'), updateCenter);
router.patch('/:id/toggle-status', authorisedRoles('ADMIN', 'SUPER_ADMIN'), toggleCenterStatus);
router.delete('/:id', authorisedRoles('ADMIN', 'SUPER_ADMIN'), deleteCenter);
router.post('/bulk-delete', authorisedRoles('ADMIN', 'SUPER_ADMIN'), bulkDeleteCenters);

export default router;
