import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, MapPin, Calendar, Clock, Navigation, AlertCircle, Sparkles } from 'lucide-react';

export const MyTicket = () => {
  const { ticket, speakAlert } = useAuth();
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState({ hours: 4, mins: 17, secs: 30 });

  // Kickoff Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { hours: prev.hours, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, mins: 59, secs: 59 };
        clearInterval(interval);
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigateClick = () => {
    speakAlert('Plotting route from Gate to your seat.');
    navigate('/map');
  };

  const demoTicket = {
    match: 'Argentina vs France (Opening Match)',
    stadium: 'MetLife Stadium (FIFA Edition)',
    section: 'Section A1',
    row: '18',
    seat: '24',
    gate: 'Gate A',
    date: 'June 12, 2026',
    time: '20:00 EST',
    qrCode: 'FIFA-METLIFE-SEC-A1-ROW18-SEAT24'
  };

  const currentTicket = ticket || demoTicket;
  const formatTime = (t) => t.toString().padStart(2, '0');

  return (
    <div className="max-w-xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-[10px] text-fifa-neon font-bold tracking-widest uppercase">MATCHDAY ENTRY CARD</span>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Spectator Ticket stub</h1>
        <p className="text-xs text-slate-400">Linked to your authenticated fan registry. Present for entry gate barcode scanners.</p>
      </div>

      {/* High-Fidelity Ticket stub */}
      <div className="relative bg-slate-950 border border-fifa-border rounded-3xl overflow-hidden shadow-glass group">
        
        {/* Top brand header */}
        <div className="p-5 border-b border-fifa-border/40 flex justify-between items-center bg-slate-900/40">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-fifa-blue flex items-center justify-center text-[10px] font-black text-white italic">F</span>
            <span className="font-extrabold text-[10px] tracking-wider text-white">FIFA WORLD CUP 2026</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-fifa-neon font-black uppercase">
            <Sparkles size={10} className="animate-pulse" />
            <span>VIP Admission</span>
          </div>
        </div>

        {/* Match details */}
        <div className="p-6 text-center space-y-2">
          <h2 className="text-xl font-black text-white leading-tight uppercase tracking-tight">{currentTicket.match}</h2>
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
            <MapPin size={11} className="text-fifa-blue-light" />
            {currentTicket.stadium}
          </span>
        </div>

        {/* Timings */}
        <div className="grid grid-cols-2 border-y border-fifa-border/40 text-center bg-slate-900/10">
          <div className="py-3 border-r border-fifa-border/40 flex flex-col items-center justify-center">
            <Calendar size={13} className="text-slate-500 mb-0.5" />
            <span className="text-[8px] text-slate-500 font-bold uppercase">Matchday Date</span>
            <span className="text-xs font-bold text-white">{currentTicket.date}</span>
          </div>
          <div className="py-3 flex flex-col items-center justify-center">
            <Clock size={13} className="text-slate-500 mb-0.5" />
            <span className="text-[8px] text-slate-500 font-bold uppercase">Gate Entrance Open</span>
            <span className="text-xs font-bold text-white">{currentTicket.time}</span>
          </div>
        </div>

        {/* Seat credentials */}
        <div className="p-5 grid grid-cols-4 gap-2 text-center bg-slate-950/70 border-b border-fifa-border/40 relative">
          <div>
            <span className="block text-[8px] text-slate-400 font-bold uppercase">Gate</span>
            <span className="text-sm font-black text-fifa-neon">{currentTicket.gate}</span>
          </div>
          <div>
            <span className="block text-[8px] text-slate-400 font-bold uppercase">Section</span>
            <span className="text-sm font-black text-white">{currentTicket.section.replace('Section ', '')}</span>
          </div>
          <div>
            <span className="block text-[8px] text-slate-400 font-bold uppercase">Row</span>
            <span className="text-sm font-black text-white">{currentTicket.row}</span>
          </div>
          <div>
            <span className="block text-[8px] text-slate-400 font-bold uppercase">Seat</span>
            <span className="text-sm font-black text-white">{currentTicket.seat}</span>
          </div>
        </div>

        {/* Ticket Perforation Notches & Separator Line */}
        <div className="relative h-4 flex items-center justify-between">
          {/* Left punchout hole */}
          <div className="w-4 h-8 rounded-full bg-[#030712] border-r border-fifa-border -translate-x-2"></div>
          {/* Dashed perforation */}
          <div className="flex-1 border-t border-dashed border-fifa-border/40 mx-2"></div>
          {/* Right punchout hole */}
          <div className="w-4 h-8 rounded-full bg-[#030712] border-l border-fifa-border translate-x-2"></div>
        </div>

        {/* QR Code section */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-900/30">
          <div className="p-4 bg-white rounded-2xl shadow-blue-glow mb-3">
            <QRCodeSVG 
              value={currentTicket.qrCode} 
              size={110}
              fgColor="#030712"
              bgColor="#FFFFFF"
            />
          </div>
          <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase mb-4">{currentTicket.qrCode}</span>

          {/* Countdown inside ticket stub */}
          <div className="flex flex-col items-center">
            <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Kickoff Countdown</span>
            <div className="flex items-center gap-1 font-mono text-xs font-black text-fifa-neon">
              <span>{formatTime(countdown.hours)}h</span>
              <span>:</span>
              <span>{formatTime(countdown.mins)}m</span>
              <span>:</span>
              <span className="text-white">{formatTime(countdown.secs)}s</span>
            </div>
          </div>
        </div>

      </div>

      {/* Navigate seat */}
      <button 
        onClick={handleNavigateClick}
        className="w-full bg-fifa-blue hover:bg-fifa-blue/90 border border-fifa-blue-light/50 text-white font-bold rounded-2xl py-3 text-xs transition-all flex items-center justify-center gap-1.5 shadow-blue-glow active:scale-95"
      >
        <Navigation size={14} className="text-fifa-neon" />
        <span>Navigate to My Seat</span>
      </button>

      {/* Advisory Info */}
      <div className="p-4 rounded-2xl bg-slate-950/45 border border-fifa-border flex gap-3 text-[11px] text-slate-400">
        <AlertCircle size={16} className="text-fifa-blue-light shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-white uppercase tracking-wider block mb-0.5">Safety & Bag Policy Reminder</span>
          MetLife Stadium bag restrictions apply. Handheld companion assistance is available on voice mode for all ticket entries.
        </div>
      </div>

    </div>
  );
};

export default MyTicket;
