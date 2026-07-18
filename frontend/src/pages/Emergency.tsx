import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { StadiumMap } from '../components/StadiumMap';
import { 
  AlertTriangle, ShieldAlert, HeartPulse, 
  MapPin, Flame, LogOut, PhoneCall 
} from 'lucide-react';

export const Emergency = () => {
  const { ticket, speakAlert } = useAuth();
  const [sosActivated, setSosActivated] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Automatically fetch emergency evacuation coordinates for the user's section
    const fetchEvacData = async () => {
      setLoading(true);
      try {
        const sec = ticket?.section || 'Section A1';
        const res = await api.get(`/emergency-route?section=${encodeURIComponent(sec)}`);
        setEmergencyData(res.data);
      } catch (err) {
        console.error('Error fetching emergency route:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvacData();
  }, [ticket]);

  const triggerSOS = () => {
    const isActivating = !sosActivated;
    setSosActivated(isActivating);
    
    if (isActivating) {
      speakAlert(
        "Emergency alert activated. Evacuation mode is active. Please remain calm. Your nearest exit is " + 
        (emergencyData?.exitGate || "Gate A") + ". Please walk to the concourse corridor immediately."
      );
    } else {
      speakAlert("Emergency alert deactivated. Standby.");
    }
  };

  return (
    <div className={`space-y-6 ${sosActivated ? 'emergency-alarm p-4 md:p-6 rounded-3xl transition-all duration-300' : ''}`}>
      
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-red-500 font-bold tracking-widest uppercase">CRITICAL SAFETY PORTAL</span>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <AlertTriangle size={24} className="text-red-500 animate-pulse" /> Stadium Emergency Guidance
          </h1>
          <p className="text-xs text-slate-400">In case of emergency evacuation, fire, or immediate medical hazard.</p>
        </div>

        {/* Big SOS button */}
        <button
          onClick={triggerSOS}
          className={`px-6 py-3 rounded-full font-black text-xs transition-all active:scale-95 shadow-md flex items-center gap-2 ${
            sosActivated 
              ? 'bg-white text-red-600 animate-pulse border border-red-500' 
              : 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/20'
          }`}
        >
          <ShieldAlert size={16} />
          <span>{sosActivated ? 'CANCEL EMERGENCY MODE' : 'TRIGGER EMERGENCY SOS'}</span>
        </button>
      </div>

      {sosActivated && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
          <ShieldAlert size={18} className="text-red-500 shrink-0 animate-ping" />
          <div>
            <span className="font-extrabold text-white uppercase tracking-wider block">EVACUATION COMMAND ACTIVE</span>
            Evacuation alarms are simulated. Your audio speech guides are now reading out routing nodes. Follow marshalling signs on floor concourses.
          </div>
        </div>
      )}

      {/* Grid: Map evauation overlay & steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Map view */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950/80 rounded-2xl overflow-hidden border border-red-950/60 relative">
            <div className="p-3 bg-red-950/40 border-b border-red-500/25 flex justify-between text-xs">
              <span className="font-extrabold text-red-400 flex items-center gap-1">
                <Flame size={12} /> Emergency Escape Route Map
              </span>
              {emergencyData && (
                <span className="text-slate-400 font-semibold">{emergencyData.exitGate} Egress</span>
              )}
            </div>
            {emergencyData ? (
              <StadiumMap
                activePath={emergencyData.evacuationPath?.path}
                highlightedSeat={{ section: emergencyData.startSection }}
                showCrowdHeatmap={false}
                selectedFacilityType="medical"
                userLocationNode={emergencyData.startSection}
                crowdData={[]}
              />
            ) : (
              <div className="h-[450px] flex items-center justify-center">
                <span className="text-xs text-slate-400">Loading evacuation route...</span>
              </div>
            )}
          </div>
        </div>

        {/* Evacuation steps & hotlines */}
        <div className="space-y-6">
          
          {/* Evac Details */}
          {emergencyData && (
            <div className="glass-panel p-5 rounded-3xl border border-fifa-border space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest border-b border-fifa-border pb-2 flex items-center gap-1.5">
                <LogOut size={14} className="text-red-500" /> Egress Details
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Current Location:</span>
                  <span className="font-bold text-white">{emergencyData.startSection}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Designated Exit:</span>
                  <span className="font-black text-fifa-neon">{emergencyData.exitGate}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Nearest First Aid:</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <HeartPulse size={12} className="text-emerald-400" />
                    {emergencyData.medicalRoom}
                  </span>
                </div>
              </div>

              <div className="border-t border-fifa-border/40 pt-3">
                <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-2.5">Egress Directives</span>
                <div className="space-y-2 text-[10px] text-slate-300">
                  {emergencyData.instructions.map((inst, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="w-3.5 h-3.5 rounded bg-red-950 border border-red-500/25 flex items-center justify-center text-[7px] font-bold text-red-500 shrink-0">
                        {i+1}
                      </span>
                      <p>{inst}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hotlines */}
          <div className="glass-panel p-5 rounded-3xl border border-fifa-border space-y-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
              <PhoneCall size={14} className="text-fifa-blue-light" /> Emergency Contacts
            </h2>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/60 border border-fifa-border/50">
                <span className="font-bold text-white">Stadium Operations Center:</span>
                <span className="font-mono text-fifa-blue-light">+1 (201) 555-0190</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/60 border border-fifa-border/50">
                <span className="font-bold text-white">First Aid Medical Desk:</span>
                <span className="font-mono text-emerald-400">+1 (201) 555-0112</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/60 border border-fifa-border/50">
                <span className="font-bold text-white">Local Emergency Services:</span>
                <span className="font-mono text-red-400">911</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Emergency;
