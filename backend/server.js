import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import stadiumRoutes from './routes/stadiumRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all client links for flexible testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Flat Route Mappings (Exposing directly under /api to align with specifications)
app.use('/api', authRoutes); // /api/login, /api/register, /api/guest-login
app.use('/api', stadiumRoutes); // /api/stadium-map, /api/facilities, /api/crowd-density, /api/transport, /api/emergency-route, /api/ai-chat, /api/navigate
app.use('/api', userRoutes); // /api/ticket, /api/profile, /api/preferences

// Root check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Stadium Guide AI API for FIFA World Cup 2026',
    status: 'Running',
    stadium: 'MetLife Stadium (FIFA Edition)'
  });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`⚽ Stadium Guide AI Backend Server running on http://localhost:${PORT}`);
});
