import { Router } from 'express';
import { isLoggedIn } from '../middleware/auth.middleware.js';
import { upsertDraft, getDrafts, deleteDraft } from '../controllers/draft.controller.js';

const router = Router();

// Save/Update draft
router.post('/course/:courseId/lesson/:lessonId/:type', isLoggedIn, upsertDraft);
router.post('/course/:courseId/unit/:unitId/lesson/:lessonId/:type', isLoggedIn, upsertDraft);

// List drafts
router.get('/course/:courseId/lesson/:lessonId/:type?', isLoggedIn, getDrafts);
router.get('/course/:courseId/unit/:unitId/lesson/:lessonId/:type?', isLoggedIn, getDrafts);

// Delete draft
router.delete('/:draftId', isLoggedIn, deleteDraft);

export default router;


