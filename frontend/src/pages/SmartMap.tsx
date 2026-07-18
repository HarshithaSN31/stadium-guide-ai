import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { StadiumMap } from '../components/StadiumMap';
import { 
  Navigation, Accessibility, Eye, Flame, Search, 
  MapPin, HelpCircle, Footprints, Clock, Sparkles, X
} from 'lucide-react';

export const SmartMap = () => {
  const { ticket, wheelchairRoute, setWheelchairRoute, speakAlert } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Route Input States
  const [gateInput, setGateInput] = useState('Gate A');
  const [sectionInput, setSectionInput] = useState('Section A1');
  const [rowInput, setRowInput] = useState('');
  const [seatInput, setSeatInput] = useState('');
  const [targetIsFacility, setTargetIsFacility] = useState(false);
  const [facilityName, setFacilityName] = useState('');

  // Settings & Overlays
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(searchParams.get('heatmap') === 'true');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [wheelchairLocal, setWheelchairLocal] = useState(wheelchairRoute);

  // Calculated Navigation Results
  const [navigationResult, setNavigationResult] = useState(null);
  const [crowdData, setCrowdData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nearbyFacilities, setNearbyFacilities] = useState([]);

  // Fetch initial crowd data
  useEffect(() => {
    const fetchCrowd = async () => {
      try {
        const res = await api.get('/crowd-density');
        setCrowdData(res.data.zones || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCrowd();
  }, []);

  // Sync global wheelchair setting with local toggle
  useEffect(() => {
    setWheelchairLocal(wheelchairRoute);
  }, [wheelchairRoute]);

  // Load ticket default starting gates on mount
  useEffect(() => {
    if (ticket) {
      setGateInput(ticket.gate || 'Gate A');
      setSectionInput(ticket.section || 'Section A1');
      setRowInput(ticket.row || '18');
      setSeatInput(ticket.seat || '24');
    }
  }, [ticket]);

  // Read URL query parameters for cross-page navigation links (e.g. from Concessions list)
  useEffect(() => {
    const navEnd = searchParams.get('navigateEnd');
    if (navEnd) {
      if (navEnd.startsWith('fac_')) {
        setTargetIsFacility(true);
        setSectionInput(navEnd);
        
        // Find facility name for UI banner
        const friendlyNames = {
          'fac_restroom_a': 'Restroom A1',
          'fac_restroom_b': 'Restroom B3',
          'fac_food_burger': 'FIFA Burger Plaza',
          'fac_food_taco': 'Taco Kickoff',
          'fac_water_a': 'Water Hydration Stn 1',
          'fac_medical_a': 'First Aid Room A',
          'fac_medical_b': 'First Aid Room B',
          'fac_merch_a': 'Official FIFA Store'
        };
        setFacilityName(friendlyNames[navEnd] || 'Facility Concession');
      } else {
        setTargetIsFacility(false);
        setSectionInput(navEnd);
      }
    }
  }, [searchParams]);

  // Automatically recalculate route when inputs modify
  useEffect(() => {
    if (gateInput && sectionInput) {
      calculateRoute();
    }
  }, [gateInput, sectionInput, wheelchairLocal]);

  const calculateRoute = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/navigate', {
        startNode: gateInput,
        endNode: sectionInput,
        wheelchairMode: wheelchairLocal
      });

      setNavigationResult(res.data);

      // Check if path passes through Section A2 (which is crowded/Red)
      const pathNodeIds = res.data.path.map(n => n.id);
      if (pathNodeIds.includes('Section A2') && !wheelchairLocal) {
        speakAlert("Caution: Route passes through Section A2 which is highly crowded. Recommending alternative detour path.");
      } else {
        speakAlert(`Route calculated. walking time: ${res.data.estimatedMinutes} minutes.`);
      }

      // Fetch nearby facilities along the route path
      const facsRes = await api.get('/facilities');
      const facilitiesList = facsRes.data;

      const nearby = facilitiesList.filter(f => {
        return pathNodeIds.includes(f.id) || pathNodeIds.some(nodeId => nodeId.includes(f.location.split(' ')[0]));
      });

      setNearbyFacilities(nearby.slice(0, 3));
    } catch (err) {
      setError('Could not calculate route. Ensure nodes are correct.');
      setNavigationResult(null);
      setNearbyFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    const query = searchQuery.toLowerCase();
    
    if (['gate a', 'gate b', 'gate c', 'gate d'].includes(query)) {
      const formattedGate = query.replace('gate ', 'Gate ');
      setGateInput(formattedGate);
      speakAlert(`Start gate set to ${formattedGate}`);
      return;
    }

    const secMatch = query.match(/(section\s+)?([a-c][1-4])/);
    if (secMatch) {
      const formattedSec = `Section ${secMatch[2].toUpperCase()}`;
      setTargetIsFacility(false);
      setSectionInput(formattedSec);
      speakAlert(`Destination section set to ${formattedSec}`);
      return;
    }

    if (query.includes('restroom') || query.includes('toilet') || query.includes('wc')) {
      setFacilityFilter('restroom');
      speakAlert('Filtering map to restrooms.');
      return;
    }
    if (query.includes('food') || query.includes('burger') || query.includes('taco')) {
      setFacilityFilter('food');
      speakAlert('Filtering map to food concessions.');
      return;
    }
    if (query.includes('first aid') || query.includes('medical')) {
      setFacilityFilter('medical');
      speakAlert('Filtering map to first aid clinics.');
      return;
    }

    setError(`No matching stadium zone found for "${searchQuery}". Try "Gate B", "Section A1" or "Restroom".`);
  };

  const handleMapNodeClick = (nodeId) => {
    if (nodeId.startsWith('Gate')) {
      setGateInput(nodeId);
      speakAlert(`Selected starting entrance: ${nodeId}`);
    } 
    else if (nodeId.startsWith('Section')) {
      setTargetIsFacility(false);
      setSectionInput(nodeId);
      speakAlert(`Selected destination: ${nodeId}`);
      
      // Clean query params
      setSearchParams({});
    }
    else if (nodeId.startsWith('fac_')) {
      navigate(`/map?navigateEnd=${nodeId}`);
    }
  };

  const loadMySeat = () => {
    if (ticket) {
      setTargetIsFacility(false);
      setGateInput(ticket.gate || 'Gate A');
      setSectionInput(ticket.section || 'Section A1');
      setRowInput(ticket.row || '18');
      setSeatInput(ticket.seat || '24');
      speakAlert('Loaded ticket seat coordinates.');
    } else {
      setError('No ticket loaded. Sign in to access coordinates.');
    }
  };

  const resetFacilityDestination = () => {
    setTargetIsFacility(false);
    setSectionInput('Section A1');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between">
        <form onSubmit={handleSearch} className="flex-1 max-w-lg flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sections, gates, or concessions (e.g. Gate B)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input pl-9 py-2 text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 border border-fifa-border rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setShowHeatmap(!showHeatmap);
              speakAlert(`Crowd Heatmap ${!showHeatmap ? 'enabled' : 'disabled'}`);
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showHeatmap 
                ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40 shadow-md' 
                : 'bg-slate-950/80 text-slate-300 border-fifa-border hover:bg-slate-900'
            }`}
          >
            <Flame size={14} className={showHeatmap ? 'animate-pulse' : ''} />
            Crowd Density
          </button>

          <select
            value={facilityFilter}
            onChange={(e) => {
              setFacilityFilter(e.target.value);
              speakAlert(`Filtering map icons by ${e.target.value}`);
            }}
            className="px-3 py-2 rounded-xl border border-fifa-border bg-slate-950/80 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="all">All Amenities</option>
            <option value="food">Burger & Tacos</option>
            <option value="restroom">Restrooms</option>
            <option value="water">Water Fountains</option>
            <option value="medical">First Aid Rooms</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Map View */}
        <div className="xl:col-span-2 space-y-4">
          <StadiumMap
            activePath={navigationResult?.path}
            highlightedSeat={targetIsFacility ? null : { section: sectionInput, row: rowInput, seat: seatInput }}
            showCrowdHeatmap={showHeatmap}
            selectedFacilityType={facilityFilter}
            userLocationNode={gateInput}
            onNodeClick={handleMapNodeClick}
            crowdData={crowdData}
          />
        </div>

        {/* Input & Routing Panel */}
        <div className="space-y-6">
          
          <div className="glass-panel p-6 rounded-3xl border border-fifa-border relative overflow-hidden">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Navigation size={16} className="text-fifa-neon" /> Wayfinding Control
            </h2>

            {error && (
              <p className="text-[11px] text-red-400 bg-red-950/40 border border-red-500/20 p-2.5 rounded-lg mb-4">
                {error}
              </p>
            )}

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-0.5">Start Gate</label>
                  <select
                    value={gateInput}
                    onChange={(e) => setGateInput(e.target.value)}
                    className="w-full bg-slate-950/90 border border-fifa-border rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-fifa-blue"
                  >
                    <option value="Gate A">Gate A (North)</option>
                    <option value="Gate B">Gate B (South)</option>
                    <option value="Gate C">Gate C (East)</option>
                    <option value="Gate D">Gate D (West)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-0.5 font-mono">Destination</label>
                  {targetIsFacility ? (
                    <div className="flex items-center justify-between bg-slate-950/90 border border-fifa-neon rounded-xl px-2 py-1.5 text-xs text-white">
                      <span className="truncate font-semibold text-fifa-neon">{facilityName}</span>
                      <button 
                        onClick={resetFacilityDestination}
                        className="text-slate-400 hover:text-white"
                        title="Clear Facility Destination"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={sectionInput}
                      onChange={(e) => setSectionInput(e.target.value)}
                      className="w-full bg-slate-950/90 border border-fifa-border rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-fifa-blue"
                    >
                      <option value="Section A1">Section A1 (NW)</option>
                      <option value="Section A2">Section A2 (N)</option>
                      <option value="Section A3">Section A3 (NE)</option>
                      <option value="Section A4">Section A4 (N-Inner)</option>
                      <option value="Section B1">Section B1 (SW)</option>
                      <option value="Section B2">Section B2 (S)</option>
                      <option value="Section B3">Section B3 (SE)</option>
                      <option value="Section B4">Section B4 (S-Inner)</option>
                      <option value="Section C1">Section C1 (W)</option>
                      <option value="Section C2">Section C2 (E)</option>
                      <option value="Section C3">Section C3 (W-Inner)</option>
                      <option value="Section C4">Section C4 (E-Inner)</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Optional Seat details */}
              {!targetIsFacility && (
                <div className="grid grid-cols-2 gap-3 border-t border-fifa-border/40 pt-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-0.5">Row</label>
                    <input
                      type="text"
                      placeholder="e.g. 18"
                      value={rowInput}
                      onChange={(e) => setRowInput(e.target.value)}
                      className="w-full glass-input py-1.5 text-xs text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 ml-0.5">Seat</label>
                    <input
                      type="text"
                      placeholder="e.g. 24"
                      value={seatInput}
                      onChange={(e) => setSeatInput(e.target.value)}
                      className="w-full glass-input py-1.5 text-xs text-center font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Accessibility Settings Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-fifa-border/55 rounded-xl mt-4">
                <div className="flex items-center gap-2">
                  <Accessibility size={16} className="text-fifa-blue-light" />
                  <div>
                    <span className="block text-[10px] font-bold text-white uppercase tracking-wider">Step-free Path</span>
                    <span className="block text-[8px] text-slate-400">Ramps & elevators only</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={wheelchairLocal}
                  onChange={(e) => {
                    setWheelchairLocal(e.target.checked);
                    setWheelchairRoute(e.target.checked);
                    speakAlert(`Accessible wheelchair routing ${e.target.checked ? 'activated' : 'deactivated'}`);
                  }}
                  className="w-4 h-4 accent-fifa-neon rounded cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={loadMySeat}
                  className="py-2.5 rounded-xl border border-fifa-border bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                >
                  Load My Ticket
                </button>
                <button
                  onClick={calculateRoute}
                  disabled={loading}
                  className="py-2.5 rounded-xl bg-fifa-blue hover:bg-fifa-blue/90 border border-fifa-blue-light/50 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-md"
                >
                  <Sparkles size={12} />
                  <span>{loading ? 'Routing...' : 'Re-Route'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Output Details */}
          {navigationResult && (
            <div className="glass-panel p-6 rounded-3xl border border-fifa-border space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              
              {/* Proximity / Detour Warning (Red crowd zones check) */}
              {navigationResult.path.some(n => n.id === 'Section A2') && !wheelchairLocal && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-[10px] text-red-200 flex gap-2">
                  <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-extrabold text-white uppercase block mb-0.5">Heavy Traffic Detour Recommended</span>
                    Your path crosses Section A2 (currently RED). Ask AI to recommend an alternate route to bypass this conflux.
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-fifa-border/40">
                  <span className="text-slate-400 text-[8px] font-bold uppercase block mb-1">Walking Distance</span>
                  <div className="flex items-center justify-center gap-1 text-white font-black text-xs">
                    <Footprints size={14} className="text-fifa-neon" />
                    <span>{navigationResult.distanceMeters} meters</span>
                  </div>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-fifa-border/40">
                  <span className="text-slate-400 text-[8px] font-bold uppercase block mb-1">Estimated Duration</span>
                  <div className="flex items-center justify-center gap-1 text-white font-black text-xs">
                    <Clock size={14} className="text-fifa-blue-light" />
                    <span>{navigationResult.estimatedMinutes} mins</span>
                  </div>
                </div>
              </div>

              {/* Turn-by-Turn Guide */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Turn-by-Turn Directions</h4>
                <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {navigationResult.instructions.map((step, i) => (
                    <div key={i} className="flex gap-2.5 items-start text-[11px] text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-slate-950/80 border border-fifa-border flex items-center justify-center font-bold text-[8px] text-fifa-neon shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Facilities */}
              {nearbyFacilities.length > 0 && (
                <div className="border-t border-fifa-border/40 pt-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Amenities Along Path</h4>
                  <div className="space-y-2">
                    {nearbyFacilities.map((fac) => (
                      <div key={fac.id} className="flex items-center justify-between text-[10px] bg-slate-950/30 p-2 rounded-lg border border-fifa-border/20">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-fifa-blue-light"></span>
                          <span className="font-bold text-white">{fac.name}</span>
                          <span className="text-slate-400 text-[8px]">({fac.location.split(' ')[0]})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-1 rounded text-[7px] font-bold ${fac.queueStatus === 'Low' ? 'bg-emerald-950 text-emerald-400' : fac.queueStatus === 'Medium' ? 'bg-yellow-950 text-yellow-400' : 'bg-red-950 text-red-400'}`}>
                            {fac.queueStatus} Queue
                          </span>
                          <span className="text-slate-400 font-mono">{fac.walkingTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default SmartMap;
