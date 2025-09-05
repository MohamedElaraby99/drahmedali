import { Router } from "express";
import { 
    getAllQAs, 
    getQAById, 
    createQA, 
    updateQA, 
    deleteQA, 
    upvoteQA, 
    downvoteQA, 
    getFeaturedQAs,
    answerQuestion,
    getPendingQuestions
} from '../controllers/qa.controller.js';
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get('/qas', getAllQAs);
router.get('/qas/featured', getFeaturedQAs);
router.get('/qas/pending', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), getPendingQuestions);
router.get('/qas/:id', getQAById);
router.post('/qas/:id/upvote', upvoteQA);
router.post('/qas/:id/downvote', downvoteQA);

// Protected routes (Admin only)
router.post('/qas', isLoggedIn, createQA);
router.put('/qas/:id', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), updateQA);
router.delete('/qas/:id', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), deleteQA);
router.post('/qas/:id/answer', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), answerQuestion);

export default router; 