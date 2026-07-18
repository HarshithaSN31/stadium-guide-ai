import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Accessibility as AccIcon, Eye, Type, Volume2, MoveRight } from 'lucide-react';

export const Accessibility = () => {
  const { 
    largeText, setLargeText,
    highContrast, setHighContrast,
    wheelchairRoute, setWheelchairRoute,
    voiceGuidance, setVoiceGuidance,
    speakAlert
  } = useAuth();

  const handleToggle = (setting, val, label) => {
    setting(val);
    // Standard feedback
    setTimeout(() => {
      speakAlert(`${label} has been ${val ? 'activated' : 'deactivated'}.`);
    }, 150);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-[10px] text-fifa-neon font-bold tracking-widest uppercase">INCLUSION SERVICES</span>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <AccIcon size={24} className="text-fifa-blue-light" /> Accessibility Settings
        </h1>
        <p className="text-xs text-slate-400">Configure visual and navigational assists for your match day stadium experience.</p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-fifa-border divide-y divide-fifa-border/40">
        
        {/* Wheelchair routing */}
        <div className="py-4 first:pt-0 flex items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-fifa-border flex items-center justify-center text-slate-400 shrink-0">
              <AccIcon size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Wheelchair Step-free Routing</h3>
              <p className="text-[10px] text-slate-400">Automatically compute navigation paths using only escalators, elevators, and ramps. Filters out steps.</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle(setWheelchairRoute, !wheelchairRoute, 'Wheelchair friendly routing')}
            className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
              wheelchairRoute ? 'bg-fifa-neon' : 'bg-slate-800'
            }`}
          >
            <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
              wheelchairRoute ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* High contrast */}
        <div className="py-4 flex items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-fifa-border flex items-center justify-center text-slate-400 shrink-0">
              <Eye size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">High Contrast Colors</h3>
              <p className="text-[10px] text-slate-400">Maximize contrast utilizing sharp yellow overlays and pitch black cards for low-vision spectators.</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle(setHighContrast, !highContrast, 'High contrast mode')}
            className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
              highContrast ? 'bg-fifa-neon' : 'bg-slate-800'
            }`}
          >
            <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
              highContrast ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Large Text */}
        <div className="py-4 flex items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-fifa-border flex items-center justify-center text-slate-400 shrink-0">
              <Type size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Large Text Option</h3>
              <p className="text-[10px] text-slate-400">Scales overall typography sizing layout, menu list text, and ticket coordinates readability.</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle(setLargeText, !largeText, 'Large text scaling')}
            className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
              largeText ? 'bg-fifa-neon' : 'bg-slate-800'
            }`}
          >
            <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
              largeText ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Voice Announcer */}
        <div className="py-4 last:pb-0 flex items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-fifa-border flex items-center justify-center text-slate-400 shrink-0">
              <Volume2 size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Audio Voice Navigation</h3>
              <p className="text-[10px] text-slate-400">Speaks directions, facility details, and critical crowd density reports aloud via device text-to-speech.</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle(setVoiceGuidance, !voiceGuidance, 'Audio voice guidance')}
            className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
              voiceGuidance ? 'bg-fifa-neon' : 'bg-slate-800'
            }`}
          >
            <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
              voiceGuidance ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

      </div>

      {/* Quick Test Speech block */}
      {voiceGuidance && (
        <div className="glass-panel p-5 rounded-2xl border border-fifa-border/80 flex items-center justify-between gap-4">
          <span className="text-[10px] text-slate-300 font-bold uppercase">Test Voice Speaker Engine</span>
          <button
            onClick={() => speakAlert("Test speech active. Audio feedback is ready for matchday.")}
            className="px-3.5 py-1.5 rounded-xl bg-fifa-blue hover:bg-fifa-blue/90 border border-fifa-blue-light/50 text-[10px] font-bold text-white transition-all active:scale-95 flex items-center gap-1"
          >
            <span>Play Test Announcement</span>
            <MoveRight size={10} />
          </button>
        </div>
      )}

    </div>
  );
};

export default Accessibility;
