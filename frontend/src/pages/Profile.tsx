import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, ShieldAlert, LogOut, Ticket, Settings } from 'lucide-react';

export const Profile = () => {
  const { user, ticket, logout, wheelchairRoute, highContrast, largeText, speakAlert } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    speakAlert("Signed out successfully");
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-[10px] text-fifa-neon font-bold tracking-widest uppercase">ACCOUNT MANAGER</span>
        <h1 className="text-2xl font-extrabold text-white">Fan Profile</h1>
        <p className="text-xs text-slate-400">Manage your World Cup ticket associations and stadium accessibility settings.</p>
      </div>

      {/* Profile Card */}
      <div className="glass-panel p-6 rounded-3xl border border-fifa-border flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fifa-blue/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-slate-900 border border-fifa-blue-light/30 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
          <img 
            src={user?.photo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.name || 'fifa')}`}
            alt="User profile avatar" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="text-center sm:text-left flex-1 space-y-2">
          <h2 className="text-lg font-black text-white">{user?.name || 'Guest Spectator'}</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-400">
            <span className="flex items-center justify-center sm:justify-start gap-1">
              <Mail size={12} className="text-slate-400" />
              {user?.email || 'guest@fifa.com'}
            </span>
            <span className="inline-block self-center sm:self-auto bg-slate-900 text-[10px] text-slate-300 font-bold border border-fifa-border px-2 py-0.5 rounded-md">
              {user?.isGuest ? 'Guest Mode' : 'Authenticated Fan'}
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Details summary */}
      {ticket ? (
        <div className="glass-panel p-6 rounded-3xl border border-fifa-border space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-fifa-border pb-3">
            <Ticket size={16} className="text-fifa-blue-light" /> Match Day Ticket
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Match Event:</span>
              <span className="font-bold text-white">{ticket.match}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Stadium:</span>
              <span className="font-bold text-white">{ticket.stadium}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Assigned Entrance Gate:</span>
              <span className="font-bold text-fifa-neon">{ticket.gate}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Seat Location:</span>
              <span className="font-bold text-white">
                {ticket.section} • Row {ticket.row} • Seat {ticket.seat}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-3xl border border-fifa-border/80 text-center space-y-3">
          <Ticket className="mx-auto text-slate-500" size={32} />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">No Match Ticket Linked</h3>
          <p className="text-[10px] text-slate-400">Explore stadium paths under demo settings. Log in with a fan account to link tickets.</p>
        </div>
      )}

      {/* Accessibility Status Summary */}
      <div className="glass-panel p-6 rounded-3xl border border-fifa-border space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-fifa-border pb-3">
          <Settings size={16} className="text-fifa-blue-light" /> Assistive Profile Preferences
        </h3>
        
        <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-300">
          <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-fifa-border/50">
            <span>Step-free Routing:</span>
            <span className={`font-bold ${wheelchairRoute ? 'text-fifa-neon' : 'text-slate-500'}`}>
              {wheelchairRoute ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-fifa-border/50">
            <span>High Contrast:</span>
            <span className={`font-bold ${highContrast ? 'text-fifa-neon' : 'text-slate-500'}`}>
              {highContrast ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-fifa-border/50">
            <span>Large Text:</span>
            <span className={`font-bold ${largeText ? 'text-fifa-neon' : 'text-slate-500'}`}>
              {largeText ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-fifa-border/50">
            <span>Voice Announcements:</span>
            <span className={`font-bold ${wheelchairRoute ? 'text-fifa-neon' : 'text-slate-500'}`}>
              {wheelchairRoute ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/accessibility')}
          className="w-full bg-slate-950 hover:bg-slate-900 border border-fifa-border text-white font-bold py-2 rounded-xl text-xs transition-all active:scale-98"
        >
          Configure Preferences
        </button>
      </div>

      {/* Sign Out Action */}
      <button
        onClick={handleSignOut}
        className="w-full bg-red-950/20 text-red-500 border border-red-900/30 hover:bg-red-900/20 hover:border-red-500 hover:text-white font-bold rounded-2xl py-3 text-xs transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm"
      >
        <LogOut size={14} />
        <span>{user?.isGuest ? 'Exit Guest Mode' : 'Sign Out of Fan Account'}</span>
      </button>

    </div>
  );
};

export default Profile;
