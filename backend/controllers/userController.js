import { db } from '../config/firebase.js';

export const getTicket = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Retrieve ticket belonging to the logged-in user
    const ticketQuery = await db.collection('tickets').where('userId', '==', userId).get();

    if (ticketQuery.empty) {
      // Create a default ticket for the user if they don't have one (demonstration purposes)
      const ticketId = `tkt_${userId}`;
      const defaultTicket = {
        id: ticketId,
        userId: userId,
        match: 'Argentina vs France (Opening Match)',
        stadium: 'MetLife Stadium (FIFA Edition)',
        section: 'Section A1',
        row: '18',
        seat: '24',
        gate: 'Gate A',
        date: 'June 12, 2026',
        time: '20:00 EST',
        qrCode: `FIFA-METLIFE-${userId.substring(0, 8).toUpperCase()}`
      };

      await db.collection('tickets').doc(ticketId).set(defaultTicket);
      return res.status(200).json(defaultTicket);
    }

    const ticketData = ticketQuery.docs[0].data();
    res.status(200).json(ticketData);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket info' });
  }
};
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(200).json({
        id: userId,
        name: req.user.name || 'FIFA Fan',
        email: req.user.email || 'guest@fifa.com',
        photo: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(req.user.name || 'guest')}`,
        preferences: { accessibilityMode: false, highContrast: false, largeText: false, voiceGuidance: false }
      });
    }

    res.status(200).json(userDoc.data());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { preferences } = req.body;
    
    await db.collection('users').doc(userId).update({ preferences });
    res.status(200).json({ message: 'Preferences updated successfully', preferences });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};
