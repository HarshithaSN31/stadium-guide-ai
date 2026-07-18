import React, { useState, useRef, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, MessageSquare, Bot, 
  HelpCircle, MapPin, Footprints, Clock, 
  Compass, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { StadiumMap } from '../components/StadiumMap';

export const AIAssistant = () => {
  const { ticket, wheelchairRoute, speakAlert } = useAuth();
  
  // Chat History
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your official **FIFA World Cup 2026 AI Stadium Guide**.\n\nAsk me where your seat is, how to avoid crowded hallways, or the nearest restroom and I will draw routes and highlight concession stands in real time!",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Synchronized Map states triggered by AI actions
  const [mapPath, setMapPath] = useState(null);
  const [highlightedSeat, setHighlightedSeat] = useState(null);
  const [mapFacilityType, setMapFacilityType] = useState('all');
  const [showCrowd, setShowCrowd] = useState(false);
  const [mapUserLoc, setMapUserLoc] = useState('Gate A');
  const [crowdData, setCrowdData] = useState([]);
  const [navMetrics, setNavMetrics] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Fetch crowd data on mount
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const res = await api.post('/ai-chat', {
        message: text,
        context: {
          ticket,
          accessibility: wheelchairRoute
        }
      });

      // API returns structured response
      const { reply, action } = res.data;

      // Execute UI Action requested by the AI model
      let actionRouteData = null;
      if (action && action.type !== 'NONE') {
        const { type, payload } = action;
        
        if (type === 'NAVIGATE') {
          const start = payload.startNode || ticket?.gate || 'Gate A';
          const end = payload.endNode || ticket?.section || 'Section A1';
          const wheelchair = payload.wheelchairMode || wheelchairRoute;

          setMapUserLoc(start);
          setMapFacilityType('all');
          
          if (end.startsWith('Section')) {
            setHighlightedSeat({ section: end, row: ticket?.row || '18', seat: ticket?.seat || '24' });
          }

          // Fetch path from routing engine
          const routeRes = await api.post('/navigate', {
            startNode: start,
            endNode: end,
            wheelchairMode: wheelchair
          });
          setMapPath(routeRes.data.path);
          setNavMetrics({
            distance: routeRes.data.distanceMeters,
            time: routeRes.data.estimatedMinutes
          });
          actionRouteData = routeRes.data;
        } 
        
        else if (type === 'HIGHLIGHT_FACILITY') {
          const facId = payload.facilityId;
          const start = payload.startNode || ticket?.section || 'Section A1';
          
          if (facId.includes('restroom')) setMapFacilityType('restroom');
          else if (facId.includes('food')) setMapFacilityType('food');
          else if (facId.includes('medical')) setMapFacilityType('medical');
          else if (facId.includes('water')) setMapFacilityType('water');

          // Compute path from seat to facility
          const routeRes = await api.post('/navigate', {
            startNode: start,
            endNode: facId,
            wheelchairMode: wheelchairRoute
          });
          setMapPath(routeRes.data.path);
          setNavMetrics({
            distance: routeRes.data.distanceMeters,
            time: routeRes.data.estimatedMinutes
          });
          actionRouteData = routeRes.data;
        } 
        
        else if (type === 'SHOW_EMERGENCY') {
          const section = payload.section || ticket?.section || 'Section A1';
          const evacRes = await api.get(`/emergency-route?section=${encodeURIComponent(section)}`);
          
          setMapUserLoc(section);
          setMapPath(evacRes.data.evacuationPath?.path);
          setHighlightedSeat({ section });
          setMapFacilityType('medical');
          setNavMetrics({
            distance: evacRes.data.evacuationPath?.distanceMeters,
            time: evacRes.data.evacuationPath?.estimatedMinutes
          });
          actionRouteData = evacRes.data.evacuationPath;
        } 
        
        else if (type === 'SHOW_TRANSPORT') {
          setMapUserLoc(ticket?.section || 'Section A1');
          const routeRes = await api.post('/navigate', {
            startNode: ticket?.section || 'Section A1',
            endNode: 'Gate A',
            wheelchairMode: wheelchairRoute
          });
          setMapPath(routeRes.data.path);
          setNavMetrics({
            distance: routeRes.data.distanceMeters,
            time: routeRes.data.estimatedMinutes
          });
          actionRouteData = routeRes.data;
        }
      }

      // Append bot response
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: reply,
        timestamp: new Date(),
        actionType: action?.type,
        route: actionRouteData
      }]);

      // Speak response first lines
      const cleanSpeakText = reply.replace(/[*#]/g, '');
      speakAlert(cleanSpeakText.split('\n')[0]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "I'm having difficulty connecting to stadium control towers. Please recheck your ticket details.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const presetPrompts = [
    { label: "🧭 Navigate to My Seat", prompt: "Take me to my seat" },
    { label: "🚽 Nearest Restroom", prompt: "Where is the nearest restroom from my section?" },
    { label: "🍔 Find Vegetarian Concessions", prompt: "Find nearest vegetarian food stall" },
    { label: "♿ Step-Free Ramps Route", prompt: "I need wheelchair access to my seat" },
    { label: "🚦 Crowd Alert Diversions", prompt: "How do I avoid crowded areas near Section A2?" },
    { label: "🚆 Best Post-Match Transit", prompt: "What is the best transport option after the match?" }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch h-[calc(100vh-160px)] min-h-[500px]">
      
      {/* AI Conversational Chat Pane */}
      <div className="xl:col-span-2 glass-panel rounded-3xl border border-fifa-border flex flex-col justify-between overflow-hidden shadow-glass relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fifa-blue/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Chat Header */}
        <div className="p-4 border-b border-fifa-border bg-slate-950/45 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-fifa-blue border border-fifa-blue-light/35 flex items-center justify-center text-white shadow-blue-glow">
              <Bot size={18} />
            </div>
            <div>
              <h2 className="text-xs font-black text-white uppercase tracking-wider">FIFA Matchday AI Guide</h2>
              <span className="text-[9px] text-fifa-neon font-bold uppercase tracking-wider block">Context Aware Gemini Service</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[8px] bg-slate-900 border border-fifa-border text-slate-400 font-bold px-2 py-0.5 rounded-md">
              Roof Closed
            </span>
          </div>
        </div>

        {/* Chat log list */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  msg.sender === 'user' ? 'bg-slate-900 text-slate-300 border-fifa-border' : 'bg-fifa-blue text-fifa-neon border-fifa-blue/40'
                }`}>
                  {msg.sender === 'user' ? <MessageSquare size={14} /> : <Bot size={14} />}
                </div>

                <div className="space-y-2">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                    msg.sender === 'user'
                      ? 'bg-fifa-blue/15 border-fifa-blue-light/30 text-white rounded-tr-none'
                      : 'bg-slate-950/80 border-fifa-border text-slate-200 rounded-tl-none shadow-md'
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {/* Inline Map Route Preview inside Chat Bubble for Mobile layouts */}
                  {msg.route && (
                    <div className="xl:hidden w-full max-w-sm rounded-2xl overflow-hidden border border-fifa-border shadow-lg">
                      <div className="bg-slate-950/90 p-2.5 text-[10px] font-bold text-white border-b border-fifa-border flex justify-between">
                        <span className="flex items-center gap-1"><MapPin size={10} className="text-fifa-neon" /> Route Preview</span>
                        <span className="text-fifa-blue-light font-mono">{msg.route.distanceMeters}m ({msg.route.estimatedMinutes} mins)</span>
                      </div>
                      <div className="h-[200px] w-full">
                        <StadiumMap
                          activePath={msg.route.path}
                          highlightedSeat={null}
                          showCrowdHeatmap={false}
                          selectedFacilityType="all"
                          userLocationNode={msg.route.path[0]?.id}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-xl bg-fifa-blue text-fifa-neon border border-fifa-border flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-fifa-border text-xs text-slate-400 rounded-tl-none flex items-center gap-2 shadow-md">
                <Sparkles size={12} className="animate-spin text-fifa-neon" />
                <span>AI processing matchday coordinates...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-fifa-border bg-slate-950/45 shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask AI: 'Take me to my seat', 'Nearest toilet', 'Emergency plan'..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 glass-input py-2.5 text-xs font-semibold focus:ring-1 focus:ring-fifa-blue"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-fifa-blue hover:bg-fifa-blue/90 border border-fifa-blue-light/50 text-white font-bold text-xs transition-colors flex items-center justify-center disabled:opacity-50 active:scale-95"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* SYNCHRONIZED INTERACTIVE MAP PANE */}
      <div className="hidden xl:flex flex-col gap-4">
        
        {/* Active Route Metrics overlay */}
        {navMetrics && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-4 rounded-3xl border border-fifa-border flex items-center justify-around text-center shadow-md bg-slate-950/90"
          >
            <div>
              <span className="text-slate-400 text-[8px] font-bold uppercase block mb-0.5">Route Distance</span>
              <div className="flex items-center justify-center gap-1 text-white font-black text-xs">
                <Footprints size={12} className="text-fifa-neon" />
                <span>{navMetrics.distance}m</span>
              </div>
            </div>
            <span className="w-px h-6 bg-fifa-border"></span>
            <div>
              <span className="text-slate-400 text-[8px] font-bold uppercase block mb-0.5">ETA Duration</span>
              <div className="flex items-center justify-center gap-1 text-white font-black text-xs">
                <Clock size={12} className="text-fifa-blue-light" />
                <span>{navMetrics.time} mins</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Live synced map */}
        <div className="flex-1 glass-panel rounded-3xl border border-fifa-border overflow-hidden relative min-h-[300px]">
          <div className="absolute top-3 left-3 z-10 bg-slate-950/80 px-2 py-1 rounded-lg border border-fifa-border text-[9px] font-bold text-white flex items-center gap-1 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-fifa-neon animate-pulse"></span>
            <span>LIVE SYNC MAP VIEW</span>
          </div>

          <StadiumMap
            activePath={mapPath}
            highlightedSeat={highlightedSeat}
            showCrowdHeatmap={false}
            selectedFacilityType={mapFacilityType}
            userLocationNode={mapUserLoc}
            crowdData={crowdData}
            onNodeClick={(nodeId) => {
              if (nodeId.startsWith('Gate')) setMapUserLoc(nodeId);
            }}
          />
        </div>

        {/* Prompt shortcuts */}
        <div className="glass-panel p-4 rounded-3xl border border-fifa-border space-y-2 bg-slate-950/45">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block ml-1">AI Prompt Hotkeys</span>
          <div className="grid grid-cols-2 gap-2">
            {presetPrompts.slice(0, 4).map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p.prompt)}
                disabled={loading}
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-fifa-border text-[10px] font-bold text-white text-left truncate transition-all active:scale-95 disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AIAssistant;
