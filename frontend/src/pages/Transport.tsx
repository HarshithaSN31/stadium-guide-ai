import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { Bus, Train, Car, Navigation, ShieldAlert, Clock, MapPin, Footprints } from 'lucide-react';

export const Transport = () => {
  const { speakAlert } = useAuth();
  const [transitData, setTransitData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransit = async () => {
      setLoading(true);
      try {
        const res = await api.get('/transport');
        setTransitData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransit();
  }, []);

  const handleModeNavigate = (modeId, modeName) => {
    speakAlert(`Navigating to ${modeName}`);
    // Map navigation coordinate redirect
    let targetNode = 'Gate A';
    if (modeId === 'rideshare_zone') targetNode = 'Gate B';
    else if (modeId === 'metro_meadowlands') targetNode = 'Gate A';
    
    window.location.href = `/map?navigateEnd=${targetNode}`;
  };

  const getModeIcon = (type) => {
    switch (type) {
      case 'Metro': return <Train size={18} className="text-sky-400" />;
      case 'Bus': return <Bus size={18} className="text-amber-400" />;
      case 'Parking': return <Car size={18} className="text-blue-400" />;
      case 'Rideshare': return <Car size={18} className="text-emerald-400" />;
      default: return <Car size={18} className="text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-[10px] text-fifa-neon font-bold tracking-widest uppercase">POST-MATCH ROUTING</span>
        <h1 className="text-2xl font-extrabold text-white">Transport Guide</h1>
        <p className="text-xs text-slate-400">Real-time schedule, queues, and optimization recommendations for stadium exit corridors.</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-xs text-slate-400">Loading transit updates...</p>
        </div>
      ) : transitData ? (
        <div className="space-y-6">
          
          {/* Egress Alert Info */}
          <div className="glass-panel p-4 border border-yellow-500/20 rounded-2xl flex gap-3 text-xs text-yellow-100">
            <ShieldAlert size={18} className="text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-white uppercase tracking-wider block mb-0.5">{transitData.status}</span>
              Spectators exiting via Gates A/B should prepare for minor crowd queues. Review our AI tips below to optimize your trip home.
            </div>
          </div>

          {/* Transit Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transitData.modes.map((mode) => (
              <div 
                key={mode.id}
                className="glass-panel p-5 rounded-3xl border border-fifa-border flex flex-col justify-between glass-panel-hover"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-950/80 border border-fifa-border flex items-center justify-center shrink-0">
                        {getModeIcon(mode.type)}
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white">{mode.name}</h3>
                        <span className="text-[9px] text-slate-400 block">{mode.type} Services</span>
                      </div>
                    </div>

                    {/* Wait Status */}
                    <div className="text-right">
                      <span className={`inline-block text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${
                        mode.queueLevel === 'Low' 
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' 
                          : mode.queueLevel === 'Medium' 
                            ? 'bg-yellow-950/20 text-yellow-400 border-yellow-500/20' 
                            : 'bg-red-950/20 text-red-400 border-red-500/20'
                      }`}>
                        {mode.queueLevel} Queue
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <p className="text-[10px] text-slate-300 leading-normal mb-4 font-semibold">{mode.schedule}</p>

                  <div className="grid grid-cols-3 gap-1.5 text-center bg-slate-950/45 p-2 rounded-xl border border-fifa-border/40 mb-4">
                    <div>
                      <span className="block text-[7px] text-slate-400 font-bold uppercase">Distance</span>
                      <div className="flex items-center justify-center gap-0.5 text-white font-black text-[9px] mt-0.5">
                        <MapPin size={9} className="text-slate-400" />
                        <span>{mode.distance}</span>
                      </div>
                    </div>
                    <div className="border-x border-fifa-border/40">
                      <span className="block text-[7px] text-slate-400 font-bold uppercase">Walk Time</span>
                      <div className="flex items-center justify-center gap-0.5 text-white font-black text-[9px] mt-0.5">
                        <Footprints size={9} className="text-slate-400" />
                        <span>{mode.walkingTime}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[7px] text-slate-400 font-bold uppercase">Wait Time</span>
                      <div className="flex items-center justify-center gap-0.5 text-white font-black text-[9px] mt-0.5">
                        <Clock size={9} className="text-slate-400" />
                        <span>{mode.queueTimeMinutes} mins</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  <div className="p-2.5 rounded-lg bg-fifa-blue/10 border border-fifa-blue-light/15 text-[10px] text-slate-300 mb-4">
                    <span className="font-extrabold text-white block mb-0.5">AI ADVANTAGE TIP:</span>
                    {mode.recommendation}
                  </div>
                </div>

                {/* Navigation Button */}
                <button
                  onClick={() => handleModeNavigate(mode.id, mode.name)}
                  className="w-full bg-slate-950 hover:bg-slate-900 border border-fifa-border text-white font-bold py-2 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Navigation size={10} className="text-fifa-neon" />
                  Route to Station Gate
                </button>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 text-xs">
          Unable to retrieve transport schedules. Check connection.
        </div>
      )}

    </div>
  );
};

export default Transport;
