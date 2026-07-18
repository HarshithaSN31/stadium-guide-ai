import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, 
  MapPin, HelpCircle, Flame, 
  Utensils, Droplet, HeartHandshake, ShieldAlert,
  Clock, Footprints, Navigation, X, Compass
} from 'lucide-react';

export const StadiumMap = ({
  activePath = null,
  highlightedSeat = null,
  showCrowdHeatmap = false,
  selectedFacilityType = 'all',
  userLocationNode = 'Gate A',
  onNodeClick = null,
  crowdData = []
}) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Selected facility tooltip popup
  const [activeTooltip, setActiveTooltip] = useState(null);

  const mapRef = useRef(null);

  // Map nodes definitions
  const nodes = {
    'Gate A': { x: 200, y: 50, type: 'gate', label: 'Gate A' },
    'Gate B': { x: 200, y: 350, type: 'gate', label: 'Gate B' },
    'Gate C': { x: 350, y: 200, type: 'gate', label: 'Gate C' },
    'Gate D': { x: 50, y: 200, type: 'gate', label: 'Gate D' },
    'Section A1': { x: 150, y: 100, type: 'section', label: 'Sec A1' },
    'Section A2': { x: 200, y: 80, type: 'section', label: 'Sec A2' },
    'Section A3': { x: 250, y: 100, type: 'section', label: 'Sec A3' },
    'Section A4': { x: 200, y: 120, type: 'section', label: 'Sec A4' },
    'Section B1': { x: 150, y: 300, type: 'section', label: 'Sec B1' },
    'Section B2': { x: 200, y: 320, type: 'section', label: 'Sec B2' },
    'Section B3': { x: 250, y: 300, type: 'section', label: 'Sec B3' },
    'Section B4': { x: 200, y: 280, type: 'section', label: 'Sec B4' },
    'Section C1': { x: 80, y: 200, type: 'section', label: 'Sec C1' },
    'Section C2': { x: 320, y: 200, type: 'section', label: 'Sec C2' },
    'Section C3': { x: 130, y: 200, type: 'section', label: 'Sec C3' },
    'Section C4': { x: 270, y: 200, type: 'section', label: 'Sec C4' },
  };

  const facilities = [
    { id: 'fac_restroom_a', type: 'restroom', name: 'Restroom A1', x: 180, y: 90, location: 'Section A1 Outer Corridor', availability: 'Available', distance: '120m', walkingTime: '2 mins', queueStatus: 'Low', isOpen: true },
    { id: 'fac_restroom_b', type: 'restroom', name: 'Restroom B3', x: 220, y: 310, location: 'Section B3 Level 2', availability: 'Available', distance: '340m', walkingTime: '5 mins', queueStatus: 'Medium', isOpen: true },
    { id: 'fac_food_burger', type: 'food', name: 'FIFA Burger Plaza', x: 280, y: 80, location: 'Section A2 Entrance', availability: 'Open', distance: '180m', walkingTime: '3 mins', queueStatus: 'High', isOpen: true },
    { id: 'fac_food_taco', type: 'food', name: 'Taco Kickoff', x: 120, y: 280, location: 'Section B1 Corridor', availability: 'Open', distance: '220m', walkingTime: '4 mins', queueStatus: 'Low', isOpen: true },
    { id: 'fac_water_a', type: 'water', name: 'Water Hydration Stn 1', x: 320, y: 150, location: 'Section C1 Corridor', availability: 'Available', distance: '90m', walkingTime: '1.5 mins', queueStatus: 'Low', isOpen: true },
    { id: 'fac_medical_a', type: 'medical', name: 'First Aid Room A', x: 110, y: 110, location: 'Section A4 Ground Level', availability: 'Ready', distance: '150m', walkingTime: '2.5 mins', queueStatus: 'None', isOpen: true },
    { id: 'fac_medical_b', type: 'medical', name: 'First Aid Room B', x: 310, y: 250, location: 'Section C3 Gate C Corridor', availability: 'Ready', distance: '280m', walkingTime: '4 mins', queueStatus: 'None', isOpen: true },
    { id: 'fac_merch_a', type: 'merch', name: 'Official FIFA Store', x: 120, y: 320, location: 'Section B4 Main Concourse', availability: 'Open', distance: '300m', walkingTime: '5 mins', queueStatus: 'High', isOpen: true }
  ];

  // Helper to get crowd zone class name
  const getZoneHeatmapClass = (zoneName) => {
    if (!showCrowdHeatmap) return 'stadium-section-default';
    const item = crowdData.find(c => c.zone === zoneName || c.id === zoneName);
    if (!item) return 'stadium-section-default';
    if (item.density === 'High' || item.color === 'red') return 'heatmap-pulse-red';
    if (item.density === 'Medium' || item.color === 'yellow') return 'heatmap-pulse-yellow';
    return 'heatmap-pulse-green';
  };

  const getZoneStrokeColor = (zoneName) => {
    if (highlightedSeat?.section === zoneName) return '#EF4444'; // Highlight destination border
    if (!showCrowdHeatmap) return 'rgba(255, 255, 255, 0.15)';
    const item = crowdData.find(c => c.zone === zoneName || c.id === zoneName);
    if (!item) return 'rgba(255, 255, 255, 0.15)';
    if (item.density === 'High' || item.color === 'red') return '#EF4444';
    if (item.density === 'Medium' || item.color === 'yellow') return '#EAB308';
    return '#00FF66';
  };

  // Zoom / Pan mouse handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTranslate({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobiles
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX - translate.x, 
        y: e.touches[0].clientY - translate.y 
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setTranslate({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const resetZoom = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setActiveTooltip(null);
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.75));

  // Build SVG path string for navigation routes
  const getPathDString = () => {
    if (!activePath || activePath.length === 0) return '';
    return activePath.map((node, i) => {
      const lookupNode = nodes[node.id || node.name] || facilities.find(f => f.id === node.id) || node;
      return `${i === 0 ? 'M' : 'L'} ${lookupNode.x} ${lookupNode.y}`;
    }).join(' ');
  };

  // Midpoint calculation for walk time badge placement
  const getPathMidpoint = () => {
    if (!activePath || activePath.length === 0) return null;
    const midIndex = Math.floor(activePath.length / 2);
    const midNode = activePath[midIndex];
    return nodes[midNode.id || midNode.name] || facilities.find(f => f.id === midNode.id) || midNode;
  };

  // Render facility icon based on type
  const renderFacilityIcon = (type, size = 12) => {
    const cls = "text-white select-none";
    switch (type) {
      case 'food': return <Utensils size={size} className={cls} />;
      case 'water': return <Droplet size={size} className={cls} />;
      case 'medical': return <HeartHandshake size={size} className={cls} />;
      case 'restroom': return <span className="font-extrabold text-[9px] text-white">WC</span>;
      default: return <HelpCircle size={size} className={cls} />;
    }
  };

  const getFacilityBg = (type) => {
    switch (type) {
      case 'food': return 'bg-amber-500 border-amber-400';
      case 'water': return 'bg-sky-500 border-sky-400';
      case 'medical': return 'bg-emerald-500 border-emerald-400';
      case 'restroom': return 'bg-indigo-500 border-indigo-400';
      default: return 'bg-slate-500 border-slate-400';
    }
  };

  const handleFacilityClick = (fac) => {
    setActiveTooltip(fac);
    if (onNodeClick) {
      onNodeClick(fac.id);
    }
  };

  const handleNavigateToFacility = (facId, name) => {
    setActiveTooltip(null);
    if (onNodeClick) {
      onNodeClick(facId);
    }
  };

  const filteredFacilities = facilities.filter(f => {
    if (selectedFacilityType === 'all') return true;
    return f.type === selectedFacilityType;
  });

  const midNode = getPathMidpoint();
  const pathD = getPathDString();

  return (
    <div className="relative w-full h-[450px] md:h-[500px] bg-slate-950/90 rounded-3xl border border-fifa-border overflow-hidden select-none shadow-glass">
      
      {/* Self-contained styling for pulsing heatmap gradients & target highlights */}
      <style>{`
        .stadium-section-default {
          fill: rgba(10, 25, 47, 0.4);
          transition: fill 0.3s ease;
        }
        @keyframes pulse-green {
          0% { fill: rgba(0, 255, 102, 0.2); }
          100% { fill: rgba(0, 255, 102, 0.45); }
        }
        @keyframes pulse-yellow {
          0% { fill: rgba(234, 179, 8, 0.2); }
          100% { fill: rgba(234, 179, 8, 0.45); }
        }
        @keyframes pulse-red {
          0% { fill: rgba(239, 68, 68, 0.25); }
          100% { fill: rgba(239, 68, 68, 0.6); }
        }
        @keyframes destination-glow {
          0% { stroke-width: 1.5; filter: drop-shadow(0 0 1px #EF4444); }
          100% { stroke-width: 3; filter: drop-shadow(0 0 8px #EF4444); }
        }
        .heatmap-pulse-green {
          animation: pulse-green 3s infinite alternate;
        }
        .heatmap-pulse-yellow {
          animation: pulse-yellow 2.5s infinite alternate;
        }
        .heatmap-pulse-red {
          animation: pulse-red 1.8s infinite alternate;
        }
        .destination-pulse {
          animation: destination-glow 1.5s infinite alternate;
          stroke: #EF4444 !important;
        }
        .route-glow-dot {
          filter: drop-shadow(0 0 5px #00FF66);
        }
      `}</style>

      {/* Stadium Grid backgrounds */}
      <div className="absolute inset-0 goal-net-overlay pointer-events-none opacity-30"></div>
      <div className="absolute inset-0 bg-stadium-lights pointer-events-none"></div>
      <div className="absolute inset-0 bg-pitch-green pointer-events-none"></div>

      {/* Map Control Overlay */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button 
          onClick={zoomIn}
          className="w-10 h-10 rounded-xl bg-slate-900/90 border border-fifa-border hover:border-fifa-blue-light/50 flex items-center justify-center text-white transition-all shadow-md active:scale-95"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button 
          onClick={zoomOut}
          className="w-10 h-10 rounded-xl bg-slate-900/90 border border-fifa-border hover:border-fifa-blue-light/50 flex items-center justify-center text-white transition-all shadow-md active:scale-95"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button 
          onClick={resetZoom}
          className="w-10 h-10 rounded-xl bg-slate-900/90 border border-fifa-border hover:border-fifa-blue-light/50 flex items-center justify-center text-white transition-all shadow-md active:scale-95"
          title="Reset View"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Floating Detailed Facility Tooltip */}
      {activeTooltip && (
        <div className="absolute bottom-4 right-4 z-20 max-w-[280px] bg-slate-950/95 border border-fifa-border rounded-2xl p-4 shadow-glass backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-250">
          <div className="flex justify-between items-start mb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${getFacilityBg(activeTooltip.type)}`}>
                {renderFacilityIcon(activeTooltip.type, 10)}
              </span>
              <h4 className="text-xs font-black text-white">{activeTooltip.name}</h4>
            </div>
            <button 
              onClick={() => setActiveTooltip(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-2 text-[10px] text-slate-300">
            <div className="flex items-center gap-1">
              <MapPin size={10} className="text-fifa-blue-light" />
              <span>{activeTooltip.location}</span>
            </div>
            <div className="flex justify-between text-slate-400 border-t border-fifa-border/40 pt-2">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold">Open</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Queue Wait:</span>
              <span className={`font-bold ${
                activeTooltip.queueStatus === 'Low' ? 'text-emerald-400' : activeTooltip.queueStatus === 'Medium' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {activeTooltip.queueStatus}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Walk Time:</span>
              <span className="font-mono text-white">{activeTooltip.walkingTime} ({activeTooltip.distance})</span>
            </div>
          </div>

          <button
            onClick={() => handleNavigateToFacility(activeTooltip.id, activeTooltip.name)}
            className="w-full mt-3 bg-fifa-blue hover:bg-fifa-blue/90 border border-fifa-blue-light/50 text-white font-bold py-1.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 active:scale-95 shadow-md"
          >
            <Navigation size={10} />
            <span>Navigate Route Here</span>
          </button>
        </div>
      )}

      {/* SVG Canvas Workspace */}
      <div 
        ref={mapRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <svg 
          viewBox="0 0 400 400" 
          className="w-full h-full"
        >
          <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`} style={{ transformOrigin: 'center center', transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.1, 0.8, 0.3, 1)' }}>
            
            {/* Outer Perimeter Wall */}
            <circle cx="200" cy="200" r="165" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="8" />
            <circle cx="200" cy="200" r="150" fill="rgba(3, 7, 18, 0.6)" stroke="rgba(0, 82, 180, 0.25)" strokeWidth="3" />
            
            {/* Concourse Outer Ring Walking Lane */}
            <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="20" />

            {/* Stadium Pitch / Field */}
            <g opacity="0.85">
              <rect x="135" y="135" width="130" height="130" rx="6" fill="#1b4d3e" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
              <rect x="145" y="145" width="110" height="110" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
              <line x1="200" y1="145" x2="200" y2="255" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
              <circle cx="200" cy="200" r="22" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
              <rect x="145" y="185" width="15" height="30" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" />
              <rect x="240" y="185" width="15" height="30" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" />
            </g>

            {/* SEATING SECTIONS LAYOUT */}
            {/* Section A2 (Top Center) */}
            <path 
              d="M 160 80 Q 200 65 240 80 L 230 110 Q 200 100 170 110 Z" 
              stroke={getZoneStrokeColor('Section A2')}
              className={`cursor-pointer ${getZoneHeatmapClass('Section A2')} ${highlightedSeat?.section === 'Section A2' ? 'destination-pulse' : ''}`}
              onClick={() => onNodeClick && onNodeClick('Section A2')}
            />
            {/* Section A1 (Top Left) */}
            <path 
              d="M 100 120 Q 130 90 160 80 L 170 110 Q 145 120 125 140 Z" 
              stroke={getZoneStrokeColor('Section A1')}
              className={`cursor-pointer ${getZoneHeatmapClass('Section A1')} ${highlightedSeat?.section === 'Section A1' ? 'destination-pulse' : ''}`}
              onClick={() => onNodeClick && onNodeClick('Section A1')}
            />
            {/* Section A3 (Top Right) */}
            <path 
              d="M 240 80 Q 270 90 300 120 L 275 140 Q 255 120 230 110 Z" 
              stroke={getZoneStrokeColor('Section A3')}
              className={`cursor-pointer ${getZoneHeatmapClass('Section A3')} ${highlightedSeat?.section === 'Section A3' ? 'destination-pulse' : ''}`}
              onClick={() => onNodeClick && onNodeClick('Section A3')}
            />
            {/* Section B2 (Bottom Center) */}
            <path 
              d="M 160 320 Q 200 335 240 320 L 230 290 Q 200 300 170 290 Z" 
              stroke={getZoneStrokeColor('Section B2')}
              className={`cursor-pointer ${getZoneHeatmapClass('Section B2')} ${highlightedSeat?.section === 'Section B2' ? 'destination-pulse' : ''}`}
              onClick={() => onNodeClick && onNodeClick('Section B2')}
            />
            {/* Section B1 (Bottom Left) */}
            <path 
              d="M 100 280 Q 130 310 160 320 L 170 290 Q 145 280 125 260 Z" 
              stroke={getZoneStrokeColor('Section B1')}
              className={`cursor-pointer ${getZoneHeatmapClass('Section B1')} ${highlightedSeat?.section === 'Section B1' ? 'destination-pulse' : ''}`}
              onClick={() => onNodeClick && onNodeClick('Section B1')}
            />
            {/* Section B3 (Bottom Right) */}
            <path 
              d="M 240 320 Q 270 310 300 280 L 275 260 Q 255 280 230 290 Z" 
              stroke={getZoneStrokeColor('Section B3')}
              className={`cursor-pointer ${getZoneHeatmapClass('Section B3')} ${highlightedSeat?.section === 'Section B3' ? 'destination-pulse' : ''}`}
              onClick={() => onNodeClick && onNodeClick('Section B3')}
            />
            {/* Section C1 (Left Center) */}
            <path 
              d="M 70 170 Q 60 200 70 230 L 100 215 Q 95 200 100 185 Z" 
              stroke={getZoneStrokeColor('Section C1')}
              className={`cursor-pointer ${getZoneHeatmapClass('Section C1')} ${highlightedSeat?.section === 'Section C1' ? 'destination-pulse' : ''}`}
              onClick={() => onNodeClick && onNodeClick('Section C1')}
            />
            {/* Section C2 (Right Center) */}
            <path 
              d="M 330 170 Q 340 200 330 230 L 300 215 Q 305 200 300 185 Z" 
              stroke={getZoneStrokeColor('Section C2')}
              className={`cursor-pointer ${getZoneHeatmapClass('Section C2')} ${highlightedSeat?.section === 'Section C2' ? 'destination-pulse' : ''}`}
              onClick={() => onNodeClick && onNodeClick('Section C2')}
            />
            
            {/* Inner Ring Tier Blocks */}
            {/* Section A4 (Inner Top) */}
            <path 
              d="M 170 120 Q 200 110 230 120 L 225 135 Q 200 128 175 135 Z" 
              stroke={getZoneStrokeColor('Section A4')}
              className={`cursor-pointer ${getZoneHeatmapClass('Section A4')} ${highlightedSeat?.section === 'Section A4' ? 'destination-pulse' : ''}`}
              onClick={() => onNodeClick && onNodeClick('Section A4')}
            />
            {/* Section B4 (Inner Bottom) */}
            <path 
              d="M 170 280 Q 200 290 230 280 L 225 265 Q 200 272 175 265 Z" 
              stroke={getZoneStrokeColor('Section B4')}
              className={`cursor-pointer ${getZoneHeatmapClass('Section B4')} ${highlightedSeat?.section === 'Section B4' ? 'destination-pulse' : ''}`}
              onClick={() => onNodeClick && onNodeClick('Section B4')}
            />
            {/* Section C3 (Inner Left) */}
            <path 
              d="M 115 175 Q 110 200 115 225 L 130 215 Q 127 200 130 185 Z" 
              stroke={getZoneStrokeColor('Section C3')}
              className={`cursor-pointer ${getZoneHeatmapClass('Section C3')} ${highlightedSeat?.section === 'Section C3' ? 'destination-pulse' : ''}`}
              onClick={() => onNodeClick && onNodeClick('Section C3')}
            />
            {/* Section C4 (Inner Right) */}
            <path 
              d="M 285 175 Q 290 200 285 225 L 270 215 Q 273 200 270 185 Z" 
              stroke={getZoneStrokeColor('Section C4')}
              className={`cursor-pointer ${getZoneHeatmapClass('Section C4')} ${highlightedSeat?.section === 'Section C4' ? 'destination-pulse' : ''}`}
              onClick={() => onNodeClick && onNodeClick('Section C4')}
            />

            {/* Labels for Sections */}
            {Object.entries(nodes).filter(([_, n]) => n.type === 'section').map(([name, node]) => (
              <text
                key={name}
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255, 255, 255, 0.85)"
                fontSize="7"
                fontWeight="bold"
                className="pointer-events-none select-none"
              >
                {node.label}
              </text>
            ))}

            {/* STADIUM ENTRANCE GATES */}
            {Object.entries(nodes).filter(([_, n]) => n.type === 'gate').map(([name, node]) => (
              <g 
                key={name} 
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onClick={() => onNodeClick && onNodeClick(name)}
              >
                <circle 
                  cx="0" 
                  cy="0" 
                  r="12" 
                  fill="#0052B4" 
                  stroke="#3B82F6" 
                  strokeWidth="2" 
                  className="group-hover:fill-fifa-neon group-hover:stroke-white transition-colors duration-200 shadow-md" 
                />
                <text 
                  x="0" 
                  y="1.5" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  fill="#FFFFFF" 
                  fontSize="8" 
                  fontWeight="bold" 
                  className="group-hover:fill-black transition-colors"
                >
                  {name.charAt(5)}
                </text>
              </g>
            ))}

            {/* ROUTE NAVIGATION PATH OVERLAY */}
            {activePath && activePath.length > 0 && pathD && (
              <>
                {/* Back shadow path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="rgba(0, 255, 102, 0.2)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Pulsing neon path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#00FF66"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="neon-path"
                />
                
                {/* Google Maps-style glowing sliding dot */}
                <circle r="4.5" fill="#FFFFFF" stroke="#00FF66" strokeWidth="2.5" className="route-glow-dot">
                  <animateMotion 
                    dur="5s" 
                    repeatCount="indefinite" 
                    path={pathD} 
                  />
                </circle>

                {/* Midpath Walking Time Badge */}
                {midNode && (
                  <g transform={`translate(${midNode.x}, ${midNode.y - 12})`} className="pointer-events-none z-10">
                    <rect x="-24" y="-7" width="48" height="14" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#00FF66" strokeWidth="1" />
                    <text x="0" y="1" textAnchor="middle" dominantBaseline="middle" fill="#00FF66" fontSize="7.5" fontWeight="bold">
                      {Math.ceil(activePath.length * 1.2)} mins
                    </text>
                  </g>
                )}

                {/* Start node indicator */}
                {activePath[0] && (
                  <circle
                    cx={nodes[activePath[0].id || activePath[0].name]?.x || activePath[0].x}
                    cy={nodes[activePath[0].id || activePath[0].name]?.y || activePath[0].y}
                    r="6"
                    fill="#3B82F6"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                )}
                {/* End node arrow/target */}
                {activePath[activePath.length - 1] && (
                  <circle
                    cx={nodes[activePath[activePath.length - 1].id || activePath[activePath.length - 1].name]?.x || activePath[activePath.length - 1].x}
                    cy={nodes[activePath[activePath.length - 1].id || activePath[activePath.length - 1].name]?.y || activePath[activePath.length - 1].y}
                    r="6.5"
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="animate-ping"
                  />
                )}
              </>
            )}

            {/* INTERACTIVE FACILITIES MARKERS */}
            {filteredFacilities.map((fac) => (
              <g
                key={fac.id}
                transform={`translate(${fac.x}, ${fac.y})`}
                className="cursor-pointer group animate-in zoom-in-50 duration-200"
                onClick={() => handleFacilityClick(fac)}
              >
                <circle 
                  cx="0" 
                  cy="0" 
                  r="7.5" 
                  className={`border ${getFacilityBg(fac.type)} transition-transform hover:scale-125 duration-150 shadow-md`} 
                  stroke="#FFFFFF" 
                  strokeWidth="1.2" 
                />
                <g transform="translate(-6, -6)">
                  {renderFacilityIcon(fac.type, 12)}
                </g>
              </g>
            ))}

            {/* SEAT HIGHLIGHT FLAG */}
            {highlightedSeat && nodes[highlightedSeat.section] && (
              <g 
                transform={`translate(${nodes[highlightedSeat.section].x}, ${nodes[highlightedSeat.section].y - 8})`}
                className="animate-bounce pointer-events-none"
              >
                <path d="M 0 0 L -5 -12 L 8 -12 Z" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1"/>
                <circle cx="0" cy="-16" r="3" fill="#00FF66" stroke="#FFFFFF" strokeWidth="1" />
              </g>
            )}

            {/* USER CURRENT LOCATION RADAR BLIP */}
            {userLocationNode && nodes[userLocationNode] && (
              <g transform={`translate(${nodes[userLocationNode].x}, ${nodes[userLocationNode].y})`} className="pointer-events-none">
                <circle cx="0" cy="0" r="14" fill="rgba(59, 130, 246, 0.3)" className="animate-ping" />
                <circle cx="0" cy="0" r="7" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
              </g>
            )}

          </g>
        </svg>
      </div>

      {/* Interactive Guidance overlay */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/85 backdrop-blur border border-fifa-border rounded-xl px-3 py-1.5 text-[11px] text-slate-300 pointer-events-none flex items-center gap-1.5 shadow-md">
        <Compass size={12} className="text-fifa-neon animate-spin-slow" />
        <span>Drag to Pan • Pinch to Zoom • Click pins for detail</span>
      </div>

    </div>
  );
};

export default StadiumMap;
