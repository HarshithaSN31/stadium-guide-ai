import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

let genAI = null;
let model = null;
let isMockAI = false;

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    isMockAI = false;
    console.log('🤖 Connected to Google Gemini AI service successfully.');
  } catch (error) {
    isMockAI = true;
    console.log(`⚠️ Gemini AI initialization failed: ${error.message}. Running Mock AI instead.`);
  }
} else {
  isMockAI = true;
  console.log('🤖 Gemini API Key not found. Running high-fidelity Mock AI service.');
}

// Structured Mock AI responses matching action patterns
const getMockAIResponse = (message, context = {}) => {
  const msg = message.toLowerCase();
  const seat = context.ticket || { section: 'Section A1', row: '18', seat: '24', gate: 'Gate A' };
  const accessibility = context.accessibility || false;

  // 1. Seat Navigation
  if (msg.includes('seat') || msg.includes('my seat') || msg.includes('take me to') || msg.includes('navigate to')) {
    const start = seat.gate || 'Gate A';
    const end = seat.section || 'Section A1';
    
    let text = `🧭 **I have plotted the route to your seat (${seat.section}, Row ${seat.row}, Seat ${seat.seat}) on the map.**
- **Entrance Gate:** Enter through **${start}**.
- **Walking Path:** Go up the escalators, walk along the concourse ring and enter Portal 12.
- **Estimated Walk Time:** 3 minutes (190 meters).
- **Proximity Concessions:** Water Hydration Station 1 is on your route.`;
    
    if (accessibility) {
      text = `♿ **I have plotted the step-free accessibility route to your seat (${seat.section}, Row ${seat.row}, Seat ${seat.seat}) on the map.**
- **Accessible Entrance:** Use **${start} (North Entrance)** featuring ramp options.
- **Elevator access:** Head past the lobby and take **Elevator West** to Level 1.
- **Estimated Walk Time:** 4 minutes (wheelchair-friendly, zero steps).`;
    }

    return {
      reply: text,
      action: {
        type: 'NAVIGATE',
        payload: { startNode: start, endNode: end, wheelchairMode: accessibility }
      }
    };
  }

  // 2. Emergency Guidance
  if (msg.includes('emergency') || msg.includes('exit') || msg.includes('evacuate') || msg.includes('danger')) {
    const end = ['Section B1', 'Section B2', 'Section B3', 'Section B4'].includes(seat.section) ? 'Gate B' : 'Gate A';
    return {
      reply: `🚨 **EMERGENCY ALARM TRIPPED!**
Please remain calm. I have mapped the quickest evacuation path from your location to **${end}** (nearest dispersal gate). Walk briskly towards the flashing green signs. First Aid Rooms are flagged on your screen.`,
      action: {
        type: 'SHOW_EMERGENCY',
        payload: { section: seat.section }
      }
    };
  }

  // 3. Accessibility Assistance Info
  if (msg.includes('wheelchair') || msg.includes('lift') || msg.includes('disabled') || msg.includes('accessible')) {
    const start = seat.gate || 'Gate A';
    const end = seat.section || 'Section A1';
    return {
      reply: `♿ **Step-free path enabled.** 
I have updated the navigation map to compute routes using only ramps and elevators, avoiding all stairs and steps between your gate and ${end}.`,
      action: {
        type: 'NAVIGATE',
        payload: { startNode: start, endNode: end, wheelchairMode: true }
      }
    };
  }

  // 4. Facility Finder: Restrooms
  if (msg.includes('restroom') || msg.includes('toilet') || msg.includes('wc') || msg.includes('bathroom')) {
    return {
      reply: `🚽 **Nearest Restroom highlighted:**
I have mapped the route to **Restroom A1** (120m away). It features low queue traffic (under 1 min wait) and is fully accessible.`,
      action: {
        type: 'HIGHLIGHT_FACILITY',
        payload: { facilityId: 'fac_restroom_a', startNode: seat.section, endNode: 'fac_restroom_a' }
      }
    };
  }

  // 4. Facility Finder: Food
  if (msg.includes('food') || msg.includes('eat') || msg.includes('burger') || msg.includes('veggie') || msg.includes('vegetarian')) {
    return {
      reply: `🍔 **Concession Stand highlighted:**
I have mapped the path to **FIFA Burger Plaza** (180m away). Beyond meat vegetarian options are available. Queue wait is currently High (10 mins).`,
      action: {
        type: 'HIGHLIGHT_FACILITY',
        payload: { facilityId: 'fac_food_burger', startNode: seat.section, endNode: 'fac_food_burger' }
      }
    };
  }

  // 4. Facility Finder: Medical
  if (msg.includes('medical') || msg.includes('first aid') || msg.includes('doctor')) {
    return {
      reply: `🏥 **Medical Facility highlighted:**
I have plotted the direct path to **First Aid & Medical Room A** (150m away). Fully staffed with nurses and doctors.`,
      action: {
        type: 'HIGHLIGHT_FACILITY',
        payload: { facilityId: 'fac_medical_a', startNode: seat.section, endNode: 'fac_medical_a' }
      }
    };
  }

  // 5. Crowd Avoidance Alternate route
  if (msg.includes('crowd') || msg.includes('congested') || msg.includes('busy') || msg.includes('avoid')) {
    return {
      reply: `🚦 **Crowd Avoidance Route Recommended:**
Section A2 confluxes are currently **RED (Heavy Crowd)**. I have adjusted the route to divert you through **Section A1 Outer Corridor**, saving you 3 minutes of queue delays.`,
      action: {
        type: 'NAVIGATE',
        payload: { startNode: 'Gate A', endNode: 'Section C3', explanation: 'Diverted via Outer Concourse to bypass A2 crowd.' }
      }
    };
  }

  // 6. Transport Guide
  if (msg.includes('transport') || msg.includes('metro') || msg.includes('bus') || msg.includes('parking')) {
    return {
      reply: `🚆 **Post-Match Egress transport options are open.**
I have highlighted the **Meadowlands Rail Station** route (Gate A exit). Trains depart every 6 minutes. Metro queues are currently Medium (12 min wait).`,
      action: {
        type: 'SHOW_TRANSPORT',
        payload: {}
      }
    };
  }

  // Default Greeting
  return {
    reply: `👋 Welcome! I am your **FIFA 2026 Stadium Guide AI**.
Ask me questions like:
- *"Take me to my seat"* 🧭
- *"Where is the nearest restroom?"* 🚽
- *"Find vegetarian food"* 🍔
- *"I need wheelchair access"* ♿
- *"How do I avoid crowded areas?"* 🚦

I will automatically highlight locations and render optimal routes directly on the stadium map!`,
    action: {
      type: 'NONE',
      payload: null
    }
  };
};

export const getAIChatResponse = async (message, context = {}) => {
  if (isMockAI) {
    return getMockAIResponse(message, context);
  }

  try {
    const seatInfo = context.ticket 
      ? `Seat: Section ${context.ticket.section}, Row ${context.ticket.row}, Seat ${context.ticket.seat}, Gate ${context.ticket.gate}` 
      : 'No active ticket loaded.';
    const accessText = context.accessibility 
      ? 'User has accessibility mode ENABLED. Prioritize elevator routes, ramps, and step-free guidelines.' 
      : 'Standard routing.';

    // Construct system instructions forcing JSON output structure
    const systemPrompt = `You are the official FIFA World Cup 2026 AI Stadium Guide assistant.
You are helping a spectator at "MetLife Stadium (FIFA Edition)".
Spectator Ticket Info: ${seatInfo}.
Accessibility settings: ${accessText}.
Current stadium state context:
- Restroom A1: Section A1 Corridor, Open, Low Queue.
- Restroom B3: Section B3 Level 2, Open, Medium Queue.
- FIFA Burger Plaza: Section A2 Concourse, Open, High Queue (10 min). Vegetarian Beyond Burgers available.
- Taco Kickoff: Section B1, Open, Low Queue (2 min).
- First Aid A: Section A4 Ground, Open.
- First Aid B: Section C3 Gate C Corridor, Open.
- Meadowlands Train Station: Gate A exit, 6 min train intervals.
- Emergency exits: Gate A (North) and Gate B (South).
- Section A2 is RED (Highly Crowded). Recommend Section A1 detour instead.

You MUST respond ONLY in valid JSON format. Do not wrap in markdown blocks, just return raw JSON matching this TypeScript interface:
interface AIResponse {
  reply: string; // The conversational text response to display to the user. Use bold tags and lists where appropriate.
  action: {
    type: 'NAVIGATE' | 'HIGHLIGHT_SEAT' | 'HIGHLIGHT_FACILITY' | 'SHOW_TRANSPORT' | 'SHOW_EMERGENCY' | 'NONE';
    payload: {
      startNode?: string; // e.g. 'Gate A' or user section
      endNode?: string;   // e.g. 'Section A1' or 'fac_restroom_a'
      section?: string;   // e.g. 'Section A1'
      row?: string;
      seat?: string;
      facilityId?: string; // e.g. 'fac_restroom_a'
      wheelchairMode?: boolean;
    } | null;
  }
}`;

    const chatSession = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: '{"reply": "Understood. Ready to generate structured actions and text replies.", "action": {"type": "NONE", "payload": null}}' }] }
      ]
    });

    const result = await chatSession.sendMessage(message);
    const resultText = result.response.text().trim();

    // Clean JSON response block markers if returned by Gemini
    const cleanedText = resultText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    
    try {
      const parsed = JSON.parse(cleanedText);
      if (parsed.reply && parsed.action) {
        return parsed;
      }
    } catch (parseErr) {
      console.warn('Gemini output was not valid JSON, parsing as standard text:', cleanedText);
    }

    // Fallback if parsing fails
    return {
      reply: resultText,
      action: { type: 'NONE', payload: null }
    };

  } catch (error) {
    console.error('Error generating content from Gemini SDK:', error.message);
    return getMockAIResponse(message, context);
  }
};
