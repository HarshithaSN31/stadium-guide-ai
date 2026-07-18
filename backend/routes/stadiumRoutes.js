import express from 'express';
import { 
  getStadiumMap, 
  getFacilities, 
  getCrowdDensity, 
  getTransport, 
  getEmergencyRoute, 
  postAIChat,
  postNavigate
} from '../controllers/stadiumController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stadium-map', getStadiumMap);
router.get('/facilities', getFacilities);
router.get('/crowd-density', getCrowdDensity);
router.get('/transport', getTransport);
router.get('/emergency-route', getEmergencyRoute);
router.post('/ai-chat', optionalAuth, postAIChat);
router.post('/navigate', postNavigate);

export default router;
