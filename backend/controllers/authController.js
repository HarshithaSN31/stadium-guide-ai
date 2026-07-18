import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, auth, isMock } from '../config/firebase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fifa_world_cup_2026_stadium_guide_secret_key_9988';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields (name, email, password) are required' });
    }

    let uid;
    let finalUser;

    if (isMock) {
      // Check if user already exists
      const existingUser = Object.values(db.collection('users')).find(u => u.email === email);
      const userDocs = await db.collection('users').where('email', '==', email).get();
      if (!userDocs.empty) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      uid = `usr_${Math.random().toString(36).substring(2, 11)}`;
      const hashedPassword = await bcrypt.hash(password, 8);

      finalUser = {
        id: uid,
        name,
        email,
        passwordHash: hashedPassword,
        photo: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
        preferences: { accessibilityMode: false, highContrast: false, largeText: false, voiceGuidance: false }
      };

      // Store in our mock database
      await db.collection('users').doc(uid).set(finalUser);
    } else {
      // Real Firebase Registration
      const firebaseUser = await auth.createUser({
        email,
        password,
        displayName: name
      });
      uid = firebaseUser.uid;

      finalUser = {
        id: uid,
        name,
        email,
        photo: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
        preferences: { accessibilityMode: false, highContrast: false, largeText: false, voiceGuidance: false }
      };

      await db.collection('users').doc(uid).set(finalUser);
    }

    // Assign a default mock ticket for demonstration
    const ticketId = `tkt_${Math.random().toString(36).substring(2, 11)}`;
    const mockTicket = {
      id: ticketId,
      userId: uid,
      match: 'Argentina vs France (Opening Match)',
      stadium: 'MetLife Stadium (FIFA Edition)',
      section: 'Section A1',
      row: '18',
      seat: '24',
      gate: 'Gate A',
      date: 'June 12, 2026',
      time: '20:00 EST',
      qrCode: `FIFA-METLIFE-${uid.toUpperCase()}`
    };
    await db.collection('tickets').doc(ticketId).set(mockTicket);

    const token = jwt.sign({ uid, email, name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: uid,
        name: finalUser.name,
        email: finalUser.email,
        photo: finalUser.photo,
        preferences: finalUser.preferences
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let userDoc;
    let token;

    if (isMock) {
      // Find mock user
      const usersQuery = await db.collection('users').where('email', '==', email).get();
      if (usersQuery.empty) {
        // Create auto-account for ease of testing in development
        if (email.endsWith('@fifa.com') || email === 'fan@fifa.com') {
          // Auto create a demo account
          const uid = 'fan_user_id';
          const hashedPassword = await bcrypt.hash('password123', 8);
          const newUser = {
            id: uid,
            name: 'FIFA Super Fan',
            email,
            passwordHash: hashedPassword,
            photo: 'https://api.dicebear.com/7.x/adventurer/svg?seed=fifafan',
            preferences: { accessibilityMode: false, highContrast: false, largeText: false, voiceGuidance: false }
          };
          await db.collection('users').doc(uid).set(newUser);

          // Assign default ticket
          await db.collection('tickets').doc('tkt_fan').set({
            id: 'tkt_fan',
            userId: uid,
            match: 'Argentina vs France (Opening Match)',
            stadium: 'MetLife Stadium (FIFA Edition)',
            section: 'Section A1',
            row: '18',
            seat: '24',
            gate: 'Gate A',
            date: 'June 12, 2026',
            time: '20:00 EST',
            qrCode: 'FIFA-METLIFE-FAN'
          });

          const mockToken = jwt.sign({ uid, email, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });
          return res.status(200).json({
            token: mockToken,
            user: { id: uid, name: newUser.name, email: newUser.email, photo: newUser.photo, preferences: newUser.preferences }
          });
        }
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      userDoc = usersQuery.docs[0].data();
      const isPasswordValid = await bcrypt.compare(password, userDoc.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      token = jwt.sign({ uid: userDoc.id, email: userDoc.email, name: userDoc.name }, JWT_SECRET, { expiresIn: '7d' });
    } else {
      // Real Auth: Firebase client token verifies, or we authenticate via admin
      // Since admin can't verify raw passwords directly without custom client auth,
      // the front-end typically sends a Firebase ID token.
      // If we need to support POST /login purely on backend, we look up the user by email
      const firebaseUser = await auth.getUserByEmail(email);
      const uid = firebaseUser.uid;

      const usersQuery = await db.collection('users').doc(uid).get();
      userDoc = usersQuery.data();

      // Sign JWT
      token = jwt.sign({ uid, email, name: userDoc?.name || firebaseUser.displayName }, JWT_SECRET, { expiresIn: '7d' });
    }

    res.status(200).json({
      token,
      user: {
        id: userDoc.id,
        name: userDoc.name,
        email: userDoc.email,
        photo: userDoc.photo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userDoc.name)}`,
        preferences: userDoc.preferences || {}
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({ error: 'Authentication failed. Please verify credentials.' });
  }
};

export const guestLogin = (req, res) => {
  try {
    const uid = 'guest_user';
    const email = 'guest@fifa.com';
    const name = 'Guest Fan';

    const token = jwt.sign({ uid, email, name, isGuest: true }, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      token,
      user: {
        id: uid,
        name,
        email,
        photo: 'https://api.dicebear.com/7.x/adventurer/svg?seed=guest',
        preferences: { accessibilityMode: false, highContrast: false, largeText: false, voiceGuidance: false },
        isGuest: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Guest login failed' });
  }
};
