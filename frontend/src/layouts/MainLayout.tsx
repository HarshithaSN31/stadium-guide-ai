import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Map, Ticket, MessageSquareCode, 
  UtensilsCrossed, Accessibility, ShieldAlert, 
  Bus, UserCircle, LogOut, Flame, ShieldAlert as AlertIcon
} from 'lucide-react';

export const MainLayout = ({ children }) => {
  const { user, logout, highContrast, largeText, ticket } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Smart Map', path: '/map', icon: Map },
    { name: 'My Ticket', path: '/ticket', icon: Ticket },
    { name: 'AI Assistant', path: '/chat', icon: MessageSquareCode },
    { name: 'Facilities', path: '/facilities', icon: UtensilsCrossed },
    { name: 'Accessibility', path: '/accessibility', icon: Accessibility },
    { name: 'Emergency', path: '/emergency', icon: ShieldAlert, highlight: true },
    { name: 'Transport', path: '/transport', icon: Bus },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-[#030712] relative overflow-x-hidden ${highContrast ? 'high-contrast-mode' : ''} ${largeText ? 'accessibility-large-text' : ''}`}>
      
      {/* Stadium ambient light backgrounds */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-stadium-lights pointer-events-none z-0"></div>
      <div className="absolute inset-0 goal-net-overlay pointer-events-none opacity-20 z-0"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950/90 border-r border-fifa-border shrink-0 z-20 backdrop-blur-xl relative">
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-fifa-border flex flex-col gap-1.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-fifa-blue flex items-center justify-center text-xs font-black text-white italic">F</span>
            <span className="font-extrabold tracking-wider text-sm bg-gradient-to-r from-white via-slate-200 to-fifa-blue-light bg-clip-text text-transparent uppercase">Stadium Guide AI</span>
          </div>
          <span className="text-[10px] text-fifa-neon font-semibold tracking-widest uppercase">FIFA World Cup 2026</span>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 bg-slate-900/60 border border-fifa-border rounded-xl flex items-center gap-3">
          <img 
            src={user?.photo || 'https://api.dicebear.com/7.x/adventurer/svg?seed=fifafan'} 
            alt="User avatar" 
            className="w-10 h-10 rounded-full border border-fifa-blue-light/35 bg-slate-800"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold truncate text-white">{user?.name || 'Guest Spectator'}</h4>
            <span className="text-[9px] text-slate-400 block truncate">{user?.isGuest ? 'Guest Mode' : user?.email}</span>
            {ticket && (
              <span className="inline-block mt-1 text-[8px] bg-fifa-blue/40 border border-fifa-blue-light/30 text-fifa-blue-light px-1.5 py-0.5 rounded font-medium">
                {ticket.section}
              </span>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group
                  ${item.highlight 
                    ? 'bg-red-950/20 text-red-500 border border-red-900/30 hover:bg-red-650/40 hover:text-white' 
                    : isActive 
                      ? 'bg-fifa-blue/20 text-fifa-neon border border-fifa-blue/50 shadow-neon-glow' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent'
                  }
                `}
              >
                <Icon size={16} className={`shrink-0 transition-transform group-hover:scale-110 ${item.highlight ? 'text-red-500' : isActive ? 'text-fifa-neon' : 'text-slate-400 group-hover:text-white'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-fifa-border">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-fifa-border"
          >
            <LogOut size={14} />
            <span>{user?.isGuest ? 'Exit Guest Mode' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        
        {/* Top Header */}
        <header className="h-16 bg-slate-950/80 border-b border-fifa-border backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-30">
          {/* Brand Logo for Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="w-5 h-5 rounded bg-fifa-blue flex items-center justify-center text-[10px] font-black text-white italic">F</span>
            <span className="font-extrabold text-xs tracking-wider text-white">STADIUM GUIDE AI</span>
          </div>

          {/* Quick tournament info */}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="bg-fifa-blue/30 text-fifa-blue-light px-2 py-0.5 rounded border border-fifa-blue-light/20 text-[10px] font-semibold">FIFA 2026 OFFICIAL ASSISTANT</span>
            <span className="text-slate-400 font-medium">MetLife Stadium, NJ</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick emergency button */}
            <button 
              onClick={() => navigate('/emergency')}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-bold transition-all shadow-md active:scale-95 shadow-red-500/20"
            >
              <AlertIcon size={12} className="animate-pulse" />
              <span>SOS EMERGENCY</span>
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 md:pb-6 relative z-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 border-t border-fifa-border z-40 backdrop-blur-xl flex items-center justify-around px-2">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl transition-all ${
                isActive ? 'text-fifa-neon scale-105' : 'text-slate-400'
              }`}
            >
              <Icon size={18} />
              <span className="text-[8px] font-bold tracking-tight truncate max-w-full">{item.name}</span>
            </NavLink>
          );
        })}
        {/* Profile indicator for Mobile */}
        <NavLink
          to="/profile"
          className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl transition-all ${
            isActive ? 'text-fifa-neon scale-105' : 'text-slate-400'
          }`}
        >
          <UserCircle size={18} />
          <span className="text-[8px] font-bold tracking-tight">Profile</span>
        </NavLink>
      </nav>

    </div>
  );
};

export default MainLayout;
