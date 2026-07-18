# Stadium Guide AI ⚽

An AI-powered stadium wayfinding, indoor navigation, and spectator assistance platform built for the **FIFA World Cup 2026** at **MetLife Stadium (FIFA Edition)**. Designed to optimize matchday experiences, this platform solves real-world tournament operational bottlenecks (seat locating, accessibility routes, concessions queues, and emergency evacuations).

---

## 🏗️ Interactive Map & AI Synchrony Workflow

The core tech highlight is the **AI-to-Map Action Binding**. When spectators submit natural language questions to the Gemini chatbot, the backend returns structured JSON containing both a text reply and a programmatic map action:

```
Spectator Chat           Gemini AI Agent             Express API             Vite Frontend
      │                         │                         │                         │
      ├────── "Take me" ───────>│                         │                         │
      │                         ├─ [Parse Ticket info] ──>│                         │
      │                         │                         ├──── [Return Actions] ──>│
      │                         │                         │                         ├─ Calculate Dijkstra Path
      │                         │                         │                         ├─ Slide Glowing Motion Dot
      │                         │                         │                         └─ Show floating ETA card
```

### JSON AI Payload Schema:
```json
{
  "reply": "🧭 **I have plotted the route to your seat (Section A1, Row 18, Seat 24) on your screen.**\n\nTake the escalators past Gate A and follow the outer ring concourse.",
  "action": {
    "type": "NAVIGATE",
    "payload": {
      "startNode": "Gate A",
      "endNode": "Section A1",
      "wheelchairMode": false
    }
  }
}
```

---

## 🌟 Enhanced Features

1. **Google Maps-Style Path Animation:** Draws glowing paths with active SVG motion indicators (`animateMotion`) gliding along lines in real-time.
2. **Context-Aware Dashboard Advice:** Dynamically reads ticket specifications to compute best arrival gates, shortest bathroom lines, and parking/metro schedules.
3. **Pulsing Crowd Heatmap:** Dynamic heatmap gradients pulse to highlight high-density confluxes (Green/Yellow/Red).
4. **Physical ticket stub visual:** Premium glassmorphic pass cutout notches, kickoff countdowns, and quick navigation coordinates.
5. **Text-To-Speech (TTS) voice announcements:** Audibly alerts directions, transport lineups, and SOS guidelines for low-vision spectators.
6. **Evacuation Siren:** SOS trigger mode flashes red alert grids, speaks evacuation vectors, and displays nearest emergency dispersals.

---

## ⚡ Performance & Lazy Loading Chunks

Vite divides the project bundle into separate chunks dynamically loaded on router requests, reducing initial page download requirements:
```
dist/assets/Facilities-C59agVbT.js        5.87 kB
dist/assets/Login-AB4mxDt_.js             6.13 kB
dist/assets/Transport-Cnbntb4f.js         6.27 kB
dist/assets/Accessibility-DzRp9UUu.js     6.55 kB
dist/assets/Profile-BU71ofLC.js           7.00 kB
dist/assets/Emergency-C9Ksw266.js         7.20 kB
dist/assets/SmartMap-BQWSN7oR.js         13.56 kB
dist/assets/Dashboard-CtuKw1zH.js        13.82 kB
dist/assets/AIAssistant-DCtYtMfk.js      14.31 kB
dist/assets/StadiumMap-B_Jx0S3w.js       19.84 kB
dist/assets/MyTicket-x8GDm5um.js         21.09 kB
```

---

## 🚀 Setup & Execution

### 1. Configure Environments
- **Backend (`backend/.env`):**
  ```env
  PORT=5000
  NODE_ENV=development
  JWT_SECRET=fifa_secret_key_phrase
  # Keep blank to run Mock database & mock AI fallback:
  GEMINI_API_KEY=
  FIREBASE_SERVICE_ACCOUNT=
  ```
- **Frontend (`frontend/.env`):**
  ```env
  VITE_API_URL=http://localhost:5000/api
  ```

### 2. Run API Server
```bash
cd backend
npm install
npm start
```

### 3. Run Dev Client
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open `http://localhost:5173` to interact with the application.
