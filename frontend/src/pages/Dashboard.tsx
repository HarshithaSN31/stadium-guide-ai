import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Ticket, Flame, Navigation, 
  Utensils, Droplet, HeartPulse, 
  Bus, Info, CloudSun, AlertTriangle,
  Compass, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react';

export const Dashboard = () => {
  const { user, ticket, speakAlert } = useAuth();
  const navigate = useNavigate();

  const [crowdAlerts, setCrowdAlerts] = useState([]);
  const [matchCountdown, setMatchCountdown] = useState({ hours: 4, mins: 17, secs: 30 });
  const [loading, setLoading] = useState(true);

  // Countdown timer simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMatchCountdown(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { hours: prev.hours, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, mins: 59, secs: 59 };
        clearInterval(interval);
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch crowd status for the dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/crowd-density');
        setCrowdAlerts(res.data.recommendations || []);
      } catch (err) {
        console.error(err);
      } finally {
        // Add artificial delay for beautiful skeleton demo loader
        setTimeout(() => {
          setLoading(false);
        }, 600);
      }
    };
    fetchDashboardData();
  }, []);

  const handleQuickAction = (path, actionLabel) => {
    speakAlert(`Navigating to ${actionLabel}`);
    navigate(path);
  };

  const formatTime = (t) => t.toString().padStart(2, '0');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  // Pre-configured intelligent recommendations based on active ticket section & gate
  const gateName = ticket?.gate || 'Gate A';
  const sectionName = ticket?.section || 'Section A1';

  const getGateRecommendation = () => {
    if (gateName === 'Gate A') return { text: 'Use Gate A (North Entrance) - scans areGreen (1.5 min average wait).', code: 'GREEN' };
    if (gateName === 'Gate B') return { text: 'Gate B South is currently Yellow (4 min average wait). Consider Gate D detour if parked in Lot G.', code: 'YELLOW' };
    return { text: 'Standard entrance scans running at Gate turnstiles.', code: 'GREEN' };
  };

  const getFoodRecommendation = () => {
    if (sectionName === 'Section A1' || sectionName === 'Section A2') {
      return { text: 'Taco Kickoff (Section B1) is recommended over Burger Plaza (Section A2) to save 8 minutes of queue lines.', gate: 'Taco Kickoff' };
    }
    return { text: 'FIFA Concourse stores are open. Refill your Coca Cola souvenir bottles at Water Station 1.', gate: 'Hydration Stn 1' };
  };

  const gateRec = getGateRecommendation();
  const foodRec = getFoodRecommendation();

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-fifa-neon font-bold tracking-widest uppercase">FIFA 2026 MATCHDAY ASSISTANT</span>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Hello, {user?.name || 'Spectator'}!</h1>
          <p className="text-xs text-slate-400">Welcome to MetLife Stadium. Read your personalized fan advice guidelines below.</p>
        </div>

        {/* Countdown */}
        <div className="glass-panel px-4 py-2 border border-fifa-blue-light/35 rounded-2xl flex items-center gap-3 shadow-neon-glow">
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Kickoff Countdown</span>
            <div className="flex items-baseline gap-1 font-mono text-sm font-black text-white">
              <span>{formatTime(matchCountdown.hours)}</span>
              <span className="text-fifa-neon animate-pulse">:</span>
              <span>{formatTime(matchCountdown.mins)}</span>
              <span className="text-fifa-neon animate-pulse">:</span>
              <span className="text-fifa-neon">{formatTime(matchCountdown.secs)}</span>
            </div>
          </div>
          <span className="w-1.5 h-6 bg-fifa-border rounded"></span>
          <div className="text-right">
            <span className="text-[8px] bg-red-950 border border-red-500/25 text-red-500 font-black px-2 py-0.5 rounded uppercase tracking-wide animate-pulse">
              Live
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        // Premium Skeleton Loader
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 h-64 bg-slate-900/60 border border-fifa-border rounded-3xl"></div>
          <div className="h-64 bg-slate-900/60 border border-fifa-border rounded-3xl"></div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 lg:col-span-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-900/60 border border-fifa-border rounded-2xl"></div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Main Grid: Ticket Stub & AI Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Today's Ticket Stub Card */}
            <motion.div 
              variants={cardVariants}
              className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-fifa-border relative overflow-hidden flex flex-col justify-between group glass-panel-hover"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-fifa-blue/10 rounded-full blur-3xl pointer-events-none"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-fifa-blue-light font-bold tracking-wider uppercase flex items-center gap-1.5">
                    <Ticket size={12} /> Today's Match ticket
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium font-mono">ID: {ticket?.id || 'tkt_demo'}</span>
                </div>
                <h2 className="text-xl font-black text-white mb-1 uppercase">{ticket?.match || 'Argentina vs France'}</h2>
                <p className="text-[11px] text-slate-400 mb-6">{ticket?.date || 'June 12, 2026'} • {ticket?.time || '20:00 EST'}</p>

                <div className="grid grid-cols-4 gap-2 text-center bg-slate-950/45 p-3.5 rounded-2xl border border-fifa-border/60">
                  <div className="border-r border-fifa-border/30">
                    <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Gate</span>
                    <span className="text-sm font-black text-fifa-neon">{ticket?.gate || 'Gate A'}</span>
                  </div>
                  <div className="border-r border-fifa-border/30">
                    <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Section</span>
                    <span className="text-sm font-black text-white">{ticket?.section || 'Sec A1'}</span>
                  </div>
                  <div className="border-r border-fifa-border/30">
                    <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Row</span>
                    <span className="text-sm font-black text-white">{ticket?.row || '18'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Seat</span>
                    <span className="text-sm font-black text-white">{ticket?.seat || '24'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => handleQuickAction('/map', 'Seat Navigation')}
                  className="flex-1 bg-fifa-blue hover:bg-fifa-blue/90 border border-fifa-blue-light/50 text-white font-bold rounded-xl py-3 text-xs transition-all text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95 shadow-blue-glow"
                >
                  <Navigation size={12} />
                  Start Smart Seat Route
                </button>
                <button 
                  onClick={() => navigate('/ticket')}
                  className="px-4 py-3 rounded-xl border border-fifa-border bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors"
                >
                  View stub
                </button>
              </div>
            </motion.div>

            {/* AI Advisor Card */}
            <motion.div 
              variants={cardVariants}
              className="glass-panel p-6 rounded-3xl border border-fifa-border flex flex-col justify-between glass-panel-hover"
            >
              <div>
                <span className="text-[10px] text-fifa-neon font-bold tracking-wider uppercase flex items-center gap-1.5 mb-4">
                  <Sparkles size={12} /> AI Advisor Assistant
                </span>
                
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-fifa-border/50 text-[11px] text-slate-300">
                    <div className="font-extrabold text-white mb-0.5 uppercase tracking-wide flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Gate Recommendation
                    </div>
                    {gateRec.text}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-fifa-border/50 text-[11px] text-slate-300">
                    <div className="font-extrabold text-white mb-0.5 uppercase tracking-wide flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      Concession Recommendation
                    </div>
                    {foodRec.text}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-fifa-border/50 text-[11px] text-slate-300">
                    <div className="font-extrabold text-white mb-0.5 uppercase tracking-wide flex items-center gap-1 text-red-400">
                      <Flame size={10} />
                      Concourse Crowd Alert
                    </div>
                    Section A2 corridor is heavily packed. We recommend taking field level outer paths.
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleQuickAction('/chat', 'AI Assistant')}
                className="w-full py-2.5 mt-4 rounded-xl border border-fifa-border bg-slate-900 hover:bg-slate-800 text-xs font-bold text-fifa-neon flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <span>Ask AI Assistant</span>
                <ArrowRight size={12} />
              </button>
            </motion.div>

          </div>

          {/* Grid: Quick Actions */}
          <motion.div variants={cardVariants} className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Quick Stadium Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Restrooms', icon: Info, path: '/facilities?type=restroom', color: 'text-indigo-400 border-indigo-950/20 hover:border-indigo-500/35 bg-indigo-950/10' },
                { label: 'Food Stalls', icon: Utensils, path: '/facilities?type=food', color: 'text-amber-400 border-amber-950/20 hover:border-amber-500/35 bg-amber-950/10' },
                { label: 'Water Stations', icon: Droplet, path: '/facilities?type=water', color: 'text-sky-400 border-sky-950/20 hover:border-sky-500/35 bg-sky-950/10' },
                { label: 'Medical Rooms', icon: HeartPulse, path: '/facilities?type=medical', color: 'text-emerald-400 border-emerald-950/20 hover:border-emerald-500/35 bg-emerald-950/10' },
                { label: 'Transport Guide', icon: Bus, path: '/transport', color: 'text-blue-400 border-blue-950/20 hover:border-blue-500/35 bg-blue-950/10' },
                { label: 'Emergency Evac', icon: AlertTriangle, path: '/emergency', color: 'text-red-400 border-red-950/20 hover:border-red-500/35 bg-red-950/10' }
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action.path, action.label)}
                    className={`p-4 glass-panel rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 group hover:-translate-y-1 active:scale-95 ${action.color}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-950/50 flex items-center justify-center border border-fifa-border group-hover:scale-105 transition-transform">
                      <Icon size={16} />
                    </div>
                    <span className="text-[11px] font-bold text-center tracking-tight text-white">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Grid: Secondary Weather & Stadium state */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weather */}
            <motion.div 
              variants={cardVariants}
              className="glass-panel p-5 rounded-3xl border border-fifa-border flex items-center justify-between glass-panel-hover"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-950/30 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <CloudSun size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Stadium Roof & Weather</h4>
                  <p className="text-lg font-black text-white">72°F (22°C)</p>
                  <p className="text-[10px] text-slate-400">Retractable roof closed • Wind: Calm</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-fifa-neon border border-fifa-neon/20 px-2.5 py-0.5 rounded-lg uppercase bg-fifa-neon/5">Indoor Mode</span>
            </motion.div>

            {/* Transport status */}
            <motion.div 
              variants={cardVariants}
              className="glass-panel p-5 rounded-3xl border border-fifa-border flex items-center justify-between glass-panel-hover"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Transport After Match</h4>
                  <p className="text-xs font-bold text-white">Metro Egress Active</p>
                  <p className="text-[10px] text-slate-400">Trains depart Meadowlands Station every 6m.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 border border-fifa-border px-2.5 py-0.5 rounded-lg uppercase font-mono">Operational</span>
            </motion.div>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default Dashboard;
