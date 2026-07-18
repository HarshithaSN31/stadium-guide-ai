import jwt from 'jsonwebtoken';
import { auth, isMock } from '../config/firebase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fifa_world_cup_2026_stadium_guide_secret_key_9988';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    }

    const token = authHeader.split(' ')[1];

    if (isMock) {
      // In mock mode, check if it's a local JWT first (for email/pwd users)
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name, isGuest: decoded.isGuest || false };
        return next();
      } catch (jwtErr) {
        // Fallback to checking if it is a mock-token-uid format
        if (token.startsWith('mock-token-')) {
          const uid = token.replace('mock-token-', '');
          req.user = { uid, email: 'guest@fifa.com', name: 'FIFA Fan', isGuest: true };
          return next();
        }
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    } else {
      // Real Firebase verification
      try {
        // Try local JWT first for our backend-created users
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name, isGuest: decoded.isGuest || false };
        return next();
      } catch (e) {
        // Try Firebase ID Token
        const firebaseUser = await auth.verifyIdToken(token);
        req.user = { uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.name || 'FIFA Fan' };
        return next();
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Unauthorized: Authentication failed' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (isMock) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name, isGuest: decoded.isGuest || false };
        } catch (e) {
          if (token.startsWith('mock-token-')) {
            const uid = token.replace('mock-token-', '');
            req.user = { uid, email: 'guest@fifa.com', name: 'FIFA Fan', isGuest: true };
          }
        }
      } else {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
        } catch (e) {
          const firebaseUser = await auth.verifyIdToken(token);
          req.user = { uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.name };
        }
      }
    }
  } catch (err) {
    // Ignore error, optionalAuth just populates req.user if token is present
  }
  next();
};
