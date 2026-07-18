// Stadium Navigation Graph representation for MetLife Stadium (FIFA Edition)
// Coordinates map to a 400x400 standard canvas/SVG viewport

export const nodes = {
  // Gates (Entrances)
  'Gate A': { id: 'Gate A', label: 'Gate A (North)', x: 200, y: 50, type: 'gate', elevatorNearby: true },
  'Gate B': { id: 'Gate B', label: 'Gate B (South)', x: 200, y: 350, type: 'gate', elevatorNearby: true },
  'Gate C': { id: 'Gate C', label: 'Gate C (East)', x: 350, y: 200, type: 'gate', elevatorNearby: false },
  'Gate D': { id: 'Gate D', label: 'Gate D (West)', x: 50, y: 200, type: 'gate', elevatorNearby: true },

  // Inner Concourse Nodes (Ramp & Corridor intersections)
  'Node_NorthWest': { id: 'Node_NorthWest', label: 'Northwest Concourse Junction', x: 120, y: 120, type: 'junction', elevatorNearby: true },
  'Node_NorthEast': { id: 'Node_NorthEast', label: 'Northeast Concourse Junction', x: 280, y: 120, type: 'junction', elevatorNearby: false },
  'Node_SouthWest': { id: 'Node_SouthWest', label: 'Southwest Concourse Junction', x: 120, y: 280, type: 'junction', elevatorNearby: true },
  'Node_SouthEast': { id: 'Node_SouthEast', label: 'Southeast Concourse Junction', x: 280, y: 280, type: 'junction', elevatorNearby: true },

  // Sections (Spectator seating blocks)
  'Section A1': { id: 'Section A1', label: 'Section A1', x: 150, y: 100, type: 'section', elevatorNearby: true },
  'Section A2': { id: 'Section A2', label: 'Section A2', x: 200, y: 80, type: 'section', elevatorNearby: true },
  'Section A3': { id: 'Section A3', label: 'Section A3', x: 250, y: 100, type: 'section', elevatorNearby: false },
  'Section A4': { id: 'Section A4', label: 'Section A4', x: 200, y: 120, type: 'section', elevatorNearby: true },
  'Section B1': { id: 'Section B1', label: 'Section B1', x: 150, y: 300, type: 'section', elevatorNearby: true },
  'Section B2': { id: 'Section B2', label: 'Section B2', x: 200, y: 320, type: 'section', elevatorNearby: true },
  'Section B3': { id: 'Section B3', label: 'Section B3', x: 250, y: 300, type: 'section', elevatorNearby: true },
  'Section B4': { id: 'Section B4', label: 'Section B4', x: 200, y: 280, type: 'section', elevatorNearby: true },
  'Section C1': { id: 'Section C1', label: 'Section C1', x: 80, y: 200, type: 'section', elevatorNearby: true },
  'Section C2': { id: 'Section C2', label: 'Section C2', x: 320, y: 200, type: 'section', elevatorNearby: false },
  'Section C3': { id: 'Section C3', label: 'Section C3', x: 130, y: 200, type: 'section', elevatorNearby: true },
  'Section C4': { id: 'Section C4', label: 'Section C4', x: 270, y: 200, type: 'section', elevatorNearby: true },

  // Facility coordinates (To map routing to amenities)
  'fac_restroom_a': { id: 'fac_restroom_a', label: 'Restroom A1', x: 180, y: 90, type: 'restroom', elevatorNearby: true },
  'fac_restroom_b': { id: 'fac_restroom_b', label: 'Restroom B3', x: 220, y: 310, type: 'restroom', elevatorNearby: true },
  'fac_food_burger': { id: 'fac_food_burger', label: 'FIFA Burger Plaza', x: 280, y: 80, type: 'food', elevatorNearby: false },
  'fac_food_taco': { id: 'fac_food_taco', label: 'Taco Kickoff', x: 120, y: 280, type: 'food', elevatorNearby: true },
  'fac_water_a': { id: 'fac_water_a', label: 'Water Station 1', x: 320, y: 150, type: 'water', elevatorNearby: false },
  'fac_medical_a': { id: 'fac_medical_a', label: 'First Aid A', x: 110, y: 110, type: 'medical', elevatorNearby: true },
  'fac_medical_b': { id: 'fac_medical_b', label: 'First Aid B', x: 310, y: 250, type: 'medical', elevatorNearby: true },
  'fac_merch_a': { id: 'fac_merch_a', label: 'FIFA Store', x: 120, y: 320, type: 'merch', elevatorNearby: true }
};

// Edges list (Connections and weights / distance representation)
export const edges = [
  // Connect Gates to nearest Junctions/Sections
  { from: 'Gate A', to: 'Section A2', weight: 30, accessible: true },
  { from: 'Gate A', to: 'Node_NorthWest', weight: 90, accessible: true },
  { from: 'Gate A', to: 'Node_NorthEast', weight: 90, accessible: true },

  { from: 'Gate B', to: 'Section B2', weight: 30, accessible: true },
  { from: 'Gate B', to: 'Node_SouthWest', weight: 90, accessible: true },
  { from: 'Gate B', to: 'Node_SouthEast', weight: 90, accessible: true },

  { from: 'Gate C', to: 'Section C2', weight: 30, accessible: false }, // Steps at Gate C
  { from: 'Gate C', to: 'Node_NorthEast', weight: 100, accessible: false },
  { from: 'Gate C', to: 'Node_SouthEast', weight: 100, accessible: true }, // Wheelchair ramp exists south-east

  { from: 'Gate D', to: 'Section C1', weight: 30, accessible: true },
  { from: 'Gate D', to: 'Node_NorthWest', weight: 100, accessible: true },
  { from: 'Gate D', to: 'Node_SouthWest', weight: 100, accessible: true },

  // Connect Concourse Junctions to Sections
  { from: 'Node_NorthWest', to: 'Section A1', weight: 40, accessible: true },
  { from: 'Node_NorthWest', to: 'Section C1', weight: 90, accessible: true },
  { from: 'Node_NorthWest', to: 'Section C3', weight: 80, accessible: true },
  { from: 'Node_NorthWest', to: 'fac_medical_a', weight: 20, accessible: true },

  { from: 'Node_NorthEast', to: 'Section A3', weight: 40, accessible: false }, // Step entry to A3
  { from: 'Node_NorthEast', to: 'Section C2', weight: 90, accessible: false },
  { from: 'Node_NorthEast', to: 'Section C4', weight: 80, accessible: true }, // Elevator corridor

  { from: 'Node_SouthWest', to: 'Section B1', weight: 40, accessible: true },
  { from: 'Node_SouthWest', to: 'Section C1', weight: 90, accessible: true },
  { from: 'Node_SouthWest', to: 'Section C3', weight: 80, accessible: true },
  { from: 'Node_SouthWest', to: 'fac_food_taco', weight: 15, accessible: true },
  { from: 'Node_SouthWest', to: 'fac_merch_a', weight: 40, accessible: true },

  { from: 'Node_SouthEast', to: 'Section B3', weight: 40, accessible: true },
  { from: 'Node_SouthEast', to: 'Section C2', weight: 90, accessible: true },
  { from: 'Node_SouthEast', to: 'Section C4', weight: 80, accessible: true },
  { from: 'Node_SouthEast', to: 'fac_medical_b', weight: 45, accessible: true },

  // Connect Section nodes together (corridors)
  { from: 'Section A1', to: 'Section A2', weight: 60, accessible: true },
  { from: 'Section A2', to: 'Section A3', weight: 60, accessible: false },
  { from: 'Section A3', to: 'Section C2', weight: 70, accessible: false },
  { from: 'Section B1', to: 'Section B2', weight: 60, accessible: true },
  { from: 'Section B2', to: 'Section B3', weight: 60, accessible: true },
  { from: 'Section B3', to: 'Section C2', weight: 70, accessible: false },
  { from: 'Section C1', to: 'Section A1', weight: 70, accessible: true },
  { from: 'Section C1', to: 'Section B1', weight: 70, accessible: true },

  // Inner ring connections
  { from: 'Section A2', to: 'Section A4', weight: 40, accessible: true },
  { from: 'Section B2', to: 'Section B4', weight: 40, accessible: true },
  { from: 'Section C3', to: 'Section A4', weight: 80, accessible: true },
  { from: 'Section C3', to: 'Section B4', weight: 80, accessible: true },
  { from: 'Section C4', to: 'Section A4', weight: 80, accessible: true },
  { from: 'Section C4', to: 'Section B4', weight: 80, accessible: true },
  { from: 'Section C3', to: 'Section C4', weight: 140, accessible: true },

  // Facility connections
  { from: 'Section A1', to: 'fac_restroom_a', weight: 30, accessible: true },
  { from: 'Section A2', to: 'fac_restroom_a', weight: 20, accessible: true },
  { from: 'Section B2', to: 'fac_restroom_b', weight: 20, accessible: true },
  { from: 'Section B3', to: 'fac_restroom_b', weight: 30, accessible: true },
  { from: 'Section A2', to: 'fac_food_burger', weight: 80, accessible: false },
  { from: 'Section A3', to: 'fac_food_burger', weight: 30, accessible: false },
  { from: 'Section C2', to: 'fac_water_a', weight: 50, accessible: false },
  { from: 'Section A3', to: 'fac_water_a', weight: 70, accessible: false }
];

// Dijkstra's Algorithm implementation
export const findShortestPath = (startId, endId, accessibilityOnly = false) => {
  if (!nodes[startId] || !nodes[endId]) return null;

  const distances = {};
  const previous = {};
  const queue = [];

  // Initialize graph nodes
  Object.keys(nodes).forEach(nodeId => {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
  });

  distances[startId] = 0;
  queue.push({ id: startId, dist: 0 });

  while (queue.length > 0) {
    // Sort queue by shortest distance
    queue.sort((a, b) => a.dist - b.dist);
    const { id: u } = queue.shift();

    if (u === endId) break; // Reached target

    // Find neighbors of u
    const neighbors = [];
    edges.forEach(edge => {
      // If accessibility mode is active, filter out non-accessible edges
      if (accessibilityOnly && !edge.accessible) return;

      if (edge.from === u) {
        neighbors.push({ to: edge.to, weight: edge.weight });
      } else if (edge.to === u) {
        neighbors.push({ to: edge.from, weight: edge.weight });
      }
    });

    for (const neighbor of neighbors) {
      const alt = distances[u] + neighbor.weight;
      if (alt < distances[neighbor.to]) {
        distances[neighbor.to] = alt;
        previous[neighbor.to] = u;
        queue.push({ id: neighbor.to, dist: alt });
      }
    }
  }

  if (distances[endId] === Infinity) return null; // No path found

  // Reconstruct path
  const path = [];
  let current = endId;
  while (current !== null) {
    path.unshift(nodes[current]);
    current = previous[current];
  }

  // Calculate stats
  const totalWeight = distances[endId]; // represents meters
  const walkingTimeMin = Math.ceil(totalWeight / 70); // avg speed 70m/min (approx 1.2 m/s)

  // Generate turn-by-turn instruction descriptions
  const instructions = [];
  for (let i = 0; i < path.length - 1; i++) {
    const fromNode = path[i];
    const toNode = path[i+1];
    
    if (fromNode.type === 'gate') {
      instructions.push(`Enter through ${fromNode.label} and proceed towards the Concourse ring.`);
    } else if (toNode.type === 'section') {
      instructions.push(`Follow signs to ${toNode.label}. Locate your seating portal index.`);
    } else if (toNode.type === 'restroom') {
      instructions.push(`Turn into the corridor service bay. ${toNode.label} is on your right.`);
    } else if (toNode.type === 'food') {
      instructions.push(`Head to the food plaza. Look for the neon signage of ${toNode.label}.`);
    } else if (toNode.type === 'medical') {
      instructions.push(`Follow the green cross signs directly to ${toNode.label}.`);
    } else {
      instructions.push(`Continue along the corridor walkway from ${fromNode.label || fromNode.id} to ${toNode.label || toNode.id}.`);
    }
  }

  return {
    path, // Array of node objects
    distanceMeters: totalWeight,
    estimatedMinutes: walkingTimeMin,
    instructions
  };
};
