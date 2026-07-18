import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let db;
let auth;
let isMock = false;

// Mock database initial state
const mockDbState = {
  users: {},
  tickets: {
    'ticket_wc2026_demo': {
      id: 'ticket_wc2026_demo',
      userId: 'guest_user',
      match: 'Argentina vs France (Opening Match)',
      stadium: 'MetLife Stadium (FIFA Edition)',
      section: 'Section A1',
      row: '18',
      seat: '24',
      gate: 'Gate A',
      date: 'June 12, 2026',
      time: '20:00 EST',
      qrCode: 'FIFA-METLIFE-SEC-A1-ROW18-SEAT24'
    }
  },
  stadium: {
    'metlife': {
      id: 'metlife',
      name: 'MetLife Stadium (FIFA Edition)',
      sections: ['Section A1', 'Section A2', 'Section A3', 'Section A4', 'Section B1', 'Section B2', 'Section B3', 'Section B4', 'Section C1', 'Section C2', 'Section C3', 'Section C4'],
      gates: [
        { name: 'Gate A', location: 'North Entrance', x: 200, y: 50 },
        { name: 'Gate B', location: 'South Entrance', x: 200, y: 350 },
        { name: 'Gate C', location: 'East Entrance', x: 350, y: 200 },
        { name: 'Gate D', location: 'West Entrance', x: 50, y: 200 }
      ],
      routes: []
    }
  },
  facilities: {
    'fac_restroom_a': { id: 'fac_restroom_a', name: 'Restroom A1', type: 'restroom', location: 'Section A1 Outer Corridor', x: 180, y: 90, availability: 'Available', distance: '120m', walkingTime: '2 mins', queueStatus: 'Low', isOpen: true, wheelchairFriendly: true },
    'fac_restroom_b': { id: 'fac_restroom_b', name: 'Restroom B3', type: 'restroom', location: 'Section B3 Level 2', x: 220, y: 310, availability: 'Available', distance: '340m', walkingTime: '5 mins', queueStatus: 'Medium', isOpen: true, wheelchairFriendly: true },
    'fac_food_burger': { id: 'fac_food_burger', name: 'FIFA Burger Plaza', type: 'food', location: 'Section A2 Entrance', x: 280, y: 80, availability: 'Open', distance: '180m', walkingTime: '3 mins', queueStatus: 'High', isOpen: true, wheelchairFriendly: true },
    'fac_food_taco': { id: 'fac_food_taco', name: 'Taco Kickoff', type: 'food', location: 'Section B1 Corridor', x: 120, y: 280, availability: 'Open', distance: '220m', walkingTime: '4 mins', queueStatus: 'Low', isOpen: true, wheelchairFriendly: true },
    'fac_water_a': { id: 'fac_water_a', name: 'Water Hydration Stn 1', type: 'water', location: 'Section C1 Corridor', x: 320, y: 150, availability: 'Available', distance: '90m', walkingTime: '1.5 mins', queueStatus: 'Low', isOpen: true, wheelchairFriendly: true },
    'fac_medical_a': { id: 'fac_medical_a', name: 'First Aid & Medical Room A', type: 'medical', location: 'Section A4 Ground Level', x: 110, y: 110, availability: 'Ready', distance: '150m', walkingTime: '2.5 mins', queueStatus: 'None', isOpen: true, wheelchairFriendly: true },
    'fac_medical_b': { id: 'fac_medical_b', name: 'First Aid Room B', type: 'medical', location: 'Section C3 Gate C Corridor', x: 310, y: 250, availability: 'Ready', distance: '280m', walkingTime: '4 mins', queueStatus: 'None', isOpen: true, wheelchairFriendly: true },
    'fac_merch_a': { id: 'fac_merch_a', name: 'Official FIFA Store', type: 'merch', location: 'Section B4 Main Concourse', x: 120, y: 320, availability: 'Open', distance: '300m', walkingTime: '5 mins', queueStatus: 'High', isOpen: true, wheelchairFriendly: true }
  },
  crowdData: {
    'zone_gate_a': { id: 'zone_gate_a', zone: 'Gate A (North)', density: 'Low', color: 'green', code: 'GREEN' },
    'zone_gate_b': { id: 'zone_gate_b', zone: 'Gate B (South)', density: 'Medium', color: 'yellow', code: 'YELLOW' },
    'zone_sec_a1': { id: 'zone_sec_a1', zone: 'Section A1', density: 'Low', color: 'green', code: 'GREEN' },
    'zone_sec_a2': { id: 'zone_sec_a2', zone: 'Section A2', density: 'High', color: 'red', code: 'RED' },
    'zone_sec_b1': { id: 'zone_sec_b1', zone: 'Section B1', density: 'Medium', color: 'yellow', code: 'YELLOW' },
    'zone_sec_c1': { id: 'zone_sec_c1', zone: 'Section C1', density: 'Low', color: 'green', code: 'GREEN' }
  }
};

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    auth = admin.auth();
    console.log('🔥 Connected to Firebase Admin Firestore successfully.');
  } else {
    throw new Error('No FIREBASE_SERVICE_ACCOUNT env key found');
  }
} catch (error) {
  isMock = true;
  console.log(`⚠️ Firebase config not found or invalid: ${error.message}`);
  console.log('🤖 Initializing high-fidelity in-memory Mock Firestore Database.');

  // Create Mock DB helper that mimics standard Firestore operations
  const makeDoc = (collectionName, docId, data) => {
    return {
      id: docId,
      exists: !!data,
      data: () => data ? { ...data } : undefined,
      get: async () => makeDoc(collectionName, docId, mockDbState[collectionName][docId]),
      set: async (newData, options) => {
        const merged = options && options.merge ? { ...mockDbState[collectionName][docId], ...newData } : newData;
        mockDbState[collectionName][docId] = { id: docId, ...merged };
        return { writeTime: new Date() };
      },
      update: async (updateData) => {
        if (!mockDbState[collectionName][docId]) {
          throw new Error(`Document ${docId} does not exist in collection ${collectionName}`);
        }
        mockDbState[collectionName][docId] = { ...mockDbState[collectionName][docId], ...updateData };
        return { writeTime: new Date() };
      },
      delete: async () => {
        delete mockDbState[collectionName][docId];
        return { writeTime: new Date() };
      }
    };
  };

  const makeQuery = (collectionName, filters = [], limitVal = null) => {
    return {
      where: (field, op, value) => {
        return makeQuery(collectionName, [...filters, { field, op, value }], limitVal);
      },
      limit: (n) => {
        return makeQuery(collectionName, filters, n);
      },
      get: async () => {
        let items = Object.values(mockDbState[collectionName] || {});
        // Apply filters (simple simulation)
        for (const filter of filters) {
          const { field, op, value } = filter;
          items = items.filter(item => {
            if (op === '==' || op === '===') return item[field] === value;
            if (op === '!=') return item[field] !== value;
            if (op === 'in') return Array.isArray(value) && value.includes(item[field]);
            return true;
          });
        }
        if (limitVal !== null) {
          items = items.slice(0, limitVal);
        }
        const docs = items.map(item => makeDoc(collectionName, item.id, item));
        return {
          empty: docs.length === 0,
          docs: docs,
          forEach: (cb) => docs.forEach(cb)
        };
      }
    };
  };

  db = {
    collection: (name) => {
      if (!mockDbState[name]) {
        mockDbState[name] = {};
      }
      return {
        doc: (id) => {
          const docId = id || `mock_id_${Math.random().toString(36).substring(2, 11)}`;
          return makeDoc(name, docId, mockDbState[name][docId]);
        },
        add: async (data) => {
          const id = `mock_id_${Math.random().toString(36).substring(2, 11)}`;
          mockDbState[name][id] = { id, ...data };
          return makeDoc(name, id, mockDbState[name][id]);
        },
        ...makeQuery(name)
      };
    }
  };

  auth = {
    createUser: async (userProperties) => {
      const { email, password, displayName } = userProperties;
      const uid = `mock_uid_${Math.random().toString(36).substring(2, 11)}`;
      const user = { uid, email, displayName, photoURL: null };
      mockDbState.users[uid] = user;
      return user;
    },
    getUserByEmail: async (email) => {
      const user = Object.values(mockDbState.users).find(u => u.email === email);
      if (!user) {
        const err = new Error('Auth user not found');
        err.code = 'auth/user-not-found';
        throw err;
      }
      return user;
    },
    verifyIdToken: async (token) => {
      if (token.startsWith('mock-token-')) {
        const uid = token.replace('mock-token-', '');
        const user = mockDbState.users[uid];
        if (user) {
          return { uid, email: user.email, name: user.displayName };
        }
      }
      throw new Error('Invalid authentication token');
    }
  };
}

export { db, auth, isMock, mockDbState };
