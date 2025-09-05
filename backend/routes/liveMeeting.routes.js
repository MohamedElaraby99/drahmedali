import { Router } from 'express';
import {
  createLiveMeeting,
  getAllLiveMeetings,
  getUserLiveMeetings,
  getUpcomingLiveMeetings,
  getLiveMeeting,
  updateLiveMeeting,
  deleteLiveMeeting,
  joinLiveMeeting,
  addAttendees,
  removeAttendee,
  getLiveMeetingStats
} from '../controllers/liveMeeting.controller.js';
import { isLoggedIn, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes (require login)
router.use(isLoggedIn);

// User routes
router.get('/my-meetings', getUserLiveMeetings);
router.get('/upcoming', getUpcomingLiveMeetings);
router.get('/:id', getLiveMeeting);
router.post('/:id/join', joinLiveMeeting);

// Admin routes
router.use(requireAdmin);

router.post('/', createLiveMeeting);
router.get('/admin/all', getAllLiveMeetings);
router.put('/:id', updateLiveMeeting);
router.delete('/:id', deleteLiveMeeting);
router.post('/:id/attendees', addAttendees);
router.delete('/:id/attendees/:attendeeId', removeAttendee);
router.get('/admin/stats', getLiveMeetingStats);

export default router;
