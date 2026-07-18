import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { 
  Utensils, Droplet, HeartPulse, HelpCircle, 
  MapPin, Clock, Footprints, Navigation, Search 
} from 'lucide-react';

export const Facilities = () => {
  const { speakAlert } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'all');
  const [facilities, setFacilities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const res = await api.get('/facilities');
        setFacilities(res.data);
      } catch (err) {
        console.error('Error fetching facilities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  const handleNavigate = (facilityId, name) => {
    speakAlert(`Routing to ${name}`);
    navigate(`/map?navigateEnd=${facilityId}`);
  };

  const getIcon = (type) => {
    const cls = "text-white";
    switch (type) {
      case 'food': return <Utensils size={18} className={cls} />;
      case 'water': return <Droplet size={18} className={cls} />;
      case 'medical': return <HeartPulse size={18} className={cls} />;
      case 'restroom': return <span className="font-extrabold text-xs text-white">WC</span>;
      default: return <HelpCircle size={18} className={cls} />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'food': return 'bg-amber-500 border-amber-400/20';
      case 'water': return 'bg-sky-500 border-sky-400/20';
      case 'medical': return 'bg-emerald-500 border-emerald-400/20';
      case 'restroom': return 'bg-indigo-500 border-indigo-400/20';
      default: return 'bg-slate-500 border-slate-400/20';
    }
  };

  // Filter facilities by tab and search query
  const filteredFacilities = facilities.filter(f => {
    const matchesTab = activeTab === 'all' || f.type === activeTab;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-fifa-neon font-bold tracking-widest uppercase">STADIUM DIRECTORY</span>
          <h1 className="text-2xl font-extrabold text-white">Facilities Finder</h1>
          <p className="text-xs text-slate-400">Search and navigate to restrooms, food concessions, first-aid, and hydration nodes.</p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-950/80 p-1 border border-fifa-border rounded-xl">
          {[
            { id: 'all', label: 'All' },
            { id: 'restroom', label: 'Toilets' },
            { id: 'food', label: 'Food' },
            { id: 'water', label: 'Water' },
            { id: 'medical', label: 'Medical' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-fifa-blue text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by section or concession name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full glass-input pl-9 py-2 text-xs"
        />
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-xs text-slate-400">Loading stadium facilities...</p>
        </div>
      ) : filteredFacilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((fac) => (
            <div 
              key={fac.id}
              className="glass-panel p-5 rounded-3xl border border-fifa-border flex flex-col justify-between glass-panel-hover"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${getBg(fac.type)}`}>
                      {getIcon(fac.type)}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">{fac.name}</h3>
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-slate-400">
                        <MapPin size={10} className="text-fifa-blue-light" />
                        {fac.location}
                      </span>
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${
                    fac.isOpen 
                      ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-950/20 text-red-400 border-red-500/20'
                  }`}>
                    {fac.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-1 text-center bg-slate-950/40 p-2.5 rounded-xl border border-fifa-border/40 mb-5">
                  <div>
                    <span className="block text-[7px] text-slate-400 font-bold uppercase">Distance</span>
                    <div className="flex items-center justify-center gap-0.5 text-white font-black text-[10px] mt-0.5">
                      <Footprints size={10} className="text-slate-400" />
                      <span>{fac.distance}</span>
                    </div>
                  </div>
                  <div className="border-x border-fifa-border/40">
                    <span className="block text-[7px] text-slate-400 font-bold uppercase">Walk Time</span>
                    <div className="flex items-center justify-center gap-0.5 text-white font-black text-[10px] mt-0.5">
                      <Clock size={10} className="text-slate-400" />
                      <span>{fac.walkingTime}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[7px] text-slate-400 font-bold uppercase">Queue</span>
                    <span className={`block font-black text-[10px] mt-0.5 ${
                      fac.queueStatus === 'Low' ? 'text-emerald-400' : fac.queueStatus === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {fac.queueStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => handleNavigate(fac.id, fac.name)}
                disabled={!fac.isOpen}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-fifa-border/80 text-white font-bold py-2 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-40"
              >
                <Navigation size={10} className="text-fifa-neon" />
                Navigate Here
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-8 text-center border border-fifa-border rounded-2xl">
          <p className="text-xs text-slate-400">No facilities matching "{searchQuery}" in this category.</p>
        </div>
      )}

    </div>
  );
};

export default Facilities;
