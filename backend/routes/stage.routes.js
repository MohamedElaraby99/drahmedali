import express from 'express';
import { isLoggedIn, authorisedRoles } from '../middleware/auth.middleware.js';
import {
    getAllStages,
    getAllStagesAdmin,
    getStageById,
    createStage,
    updateStage,
    deleteStage,
    getStageStats,
    getAllStagesWithStats,
    toggleStageStatus
} from '../controllers/stage.controller.js';

const router = express.Router();

// Public routes
router.route('/')
    .get(getAllStages);

router.route('/stats')
    .get(getAllStagesWithStats);

// Admin only routes
router.use(isLoggedIn);
router.use(authorisedRoles('ADMIN', 'SUPER_ADMIN'));

router.route('/admin')
    .get(getAllStagesAdmin);

router.route('/')
    .post(createStage);

router.route('/:id')
    .get(getStageById)
    .put(updateStage)
    .delete(deleteStage);

router.route('/:id/stats')
    .get(getStageStats);

router.route('/:id/toggle-status')
    .put(toggleStageStatus);

export default router; 