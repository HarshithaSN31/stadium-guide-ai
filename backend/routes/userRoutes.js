import express from 'express';
import { getTicket, getProfile, updatePreferences } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/ticket', getTicket);
router.get('/profile', getProfile);
router.put('/preferences', updatePreferences);

export default router;
