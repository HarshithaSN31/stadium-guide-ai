import { db } from '../config/firebase.js';
import { getAIChatResponse } from '../services/gemini.js';
import { nodes, edges, findShortestPath } from '../services/pathfinder.js';

// GET /stadium-map
export const getStadiumMap = async (req, res) => {
  try {
    const stadiumSnap = await db.collection('stadium').doc('metlife').get();
    let stadiumInfo = stadiumSnap.data();

    if (!stadiumInfo) {
      stadiumInfo = {
        id: 'metlife',
        name: 'MetLife Stadium (FIFA Edition)',
        location: 'East Rutherford, New Jersey',
        capacity: 82500
      };
    }

    res.status(200).json({
      stadium: stadiumInfo,
      nodes,
      edges
    });
  } catch (error) {
    console.error('Error fetching stadium map:', error);
    res.status(500).json({ error: 'Failed to fetch stadium map' });
  }
};

// GET /facilities
export const getFacilities = async (req, res) => {
  try {
    const { type } = req.query;
    const facilitiesSnap = await db.collection('facilities').get();
    
    let facilitiesList = [];
    facilitiesSnap.forEach(doc => {
      facilitiesList.push(doc.data());
    });

    if (type) {
      facilitiesList = facilitiesList.filter(f => f.type === type);
    }

    res.status(200).json(facilitiesList);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
};

// GET /crowd-density
export const getCrowdDensity = async (req, res) => {
  try {
    const crowdSnap = await db.collection('crowdData').get();
    const crowdList = [];
    crowdSnap.forEach(doc => {
      crowdList.push(doc.data());
    });

    // Provide a list of recommended alternate paths for crowded sections
    const recommendations = [
      {
        crowdedZone: 'Section A2',
        recommendation: 'Section A2 Concourse is currently RED. We recommend taking the Outer Ring corridor detour via Section A1 for a 3-minute faster walk.',
        alternatePathNodes: ['Section A1', 'Node_NorthWest', 'Gate A']
      },
      {
        crowdedZone: 'Gate B',
        recommendation: 'South entrance scans are currently peak. Spectators parked in Lot F/E should enter via Gate D (West Entrance) which is GREEN.',
        alternatePathNodes: ['Gate D', 'Node_SouthWest', 'Section B1']
      }
    ];

    res.status(200).json({
      zones: crowdList,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching crowd density:', error);
    res.status(500).json({ error: 'Failed to fetch crowd density' });
  }
};

// GET /transport
export const getTransport = async (req, res) => {
  try {
    const transitInfo = {
      stadium: 'MetLife Stadium (FIFA Edition)',
      status: 'Post-Match Egress Activated',
      modes: [
        {
          id: 'metro_meadowlands',
          name: 'Meadowlands Rail Station (NJ Transit)',
          type: 'Metro',
          schedule: 'Trains leave every 6 minutes to Secaucus Junction connecting to NYC Penn Station',
          distance: '200m from Gate A',
          walkingTime: '3 mins',
          status: 'Operating',
          queueLevel: 'Medium',
          queueTimeMinutes: 12,
          recommendation: 'Highly recommended for NYC bound spectators. Purchase tickets in advance.'
        },
        {
          id: 'bus_351',
          name: '351 Meadowlands Express Bus',
          type: 'Bus',
          schedule: 'Direct non-stop service back to Port Authority Bus Terminal (NYC)',
          distance: '150m from Gate A (Lot K)',
          walkingTime: '2 mins',
          status: 'Operating',
          queueLevel: 'Low',
          queueTimeMinutes: 5,
          recommendation: 'Shortest queue currently. Departs immediately once full.'
        },
        {
          id: 'parking_zones',
          name: 'Stadium Parking Lots (A-K)',
          type: 'Parking',
          schedule: 'Egress traffic managed in zones by local police',
          distance: 'Varies',
          walkingTime: 'Varies',
          status: 'Congested',
          queueLevel: 'High',
          queueTimeMinutes: 30,
          recommendation: 'Delay departure by 15 minutes to allow major bottleneck release in Lot G/F.'
        },
        {
          id: 'rideshare_zone',
          name: 'Lot G Rideshare Zone (Uber/Lyft/Taxi)',
          type: 'Rideshare',
          schedule: 'Access via designated rideshare entry lane',
          distance: '300m from Gate B',
          walkingTime: '5 mins',
          status: 'Active',
          queueLevel: 'High',
          queueTimeMinutes: 25,
          recommendation: 'Surcharge pricing is 2x. Tip: Walk to Secaucus or take transit to bypass surcharge.'
        }
      ]
    };
    res.status(200).json(transitInfo);
  } catch (error) {
    console.error('Error fetching transit data:', error);
    res.status(500).json({ error: 'Failed to fetch transport guide' });
  }
};

// GET /emergency-route
export const getEmergencyRoute = async (req, res) => {
  try {
    const { section } = req.query;
    
    // Default to Section A1 if user did not specify
    const startSection = section || 'Section A1';
    
    // Map to nearest exit gates
    // Sections on North side (A1, A2, A3, A4, C1) -> Gate A
    // Sections on South side (B1, B2, B3, B4, C2) -> Gate B
    let targetExit = 'Gate A';
    if (['Section B1', 'Section B2', 'Section B3', 'Section B4', 'Section C2'].includes(startSection)) {
      targetExit = 'Gate B';
    }

    // Map to nearest medical room
    // First Aid A is North (x=110, y=110), First Aid B is South/East (x=310, y=250)
    let targetMedical = 'fac_medical_a';
    if (['Section B1', 'Section B2', 'Section B3', 'Section B4', 'Section C2', 'Section C4'].includes(startSection)) {
      targetMedical = 'fac_medical_b';
    }

    const exitPathResult = findShortestPath(startSection, targetExit, false);
    const medicalPathResult = findShortestPath(startSection, targetMedical, false);

    const evacuationInstructions = [
      'Leave your seat immediately. Take only essential personal belongings.',
      'Walk briskly. Do not run, push or overtake others.',
      'Evacuate via the main portal stairways to the concourse corridor.',
      'Head towards the flashing green Emergency EXIT lights.',
      'Assemble in the secure grass dispersal zone outside the stadium gates.',
      'Do not attempt to return to the stadium until official authorities declare it safe.'
    ];

    res.status(200).json({
      startSection,
      exitGate: targetExit,
      medicalRoom: targetMedical === 'fac_medical_a' ? 'First Aid & Medical Room A' : 'First Aid Room B',
      evacuationPath: exitPathResult,
      medicalPath: medicalPathResult,
      instructions: evacuationInstructions
    });
  } catch (error) {
    console.error('Error generating emergency routing:', error);
    res.status(500).json({ error: 'Failed to generate emergency evacuation route' });
  }
};

// POST /ai-chat
export const postAIChat = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const result = await getAIChatResponse(message, context);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in AI assistant endpoint:', error);
    res.status(500).json({ error: 'AI Assistant failed to reply' });
  }
};

// POST /navigate (Additional navigation endpoint to serve direct pathfinding coords to Map component)
export const postNavigate = (req, res) => {
  try {
    const { startNode, endNode, wheelchairMode } = req.body;
    if (!startNode || !endNode) {
      return res.status(400).json({ error: 'Both startNode and endNode are required.' });
    }
    
    const result = findShortestPath(startNode, endNode, wheelchairMode);
    if (!result) {
      return res.status(404).json({ error: 'No path found between the specified points.' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Navigation calculation failed' });
  }
};
