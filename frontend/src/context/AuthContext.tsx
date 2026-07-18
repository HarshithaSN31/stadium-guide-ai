import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// API instance configured to read VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const api = axios.create({
  baseURL: API_URL,
});

// Add interceptor to append authorization token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fifa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fifa_token') || null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Accessibility States
  const [largeText, setLargeText] = useState(localStorage.getItem('acc_largeText') === 'true');
  const [highContrast, setHighContrast] = useState(localStorage.getItem('acc_highContrast') === 'true');
  const [wheelchairRoute, setWheelchairRoute] = useState(localStorage.getItem('acc_wheelchair') === 'true');
  const [voiceGuidance, setVoiceGuidance] = useState(localStorage.getItem('acc_voice') === 'true');

  // Load user profile and ticket if token exists
  useEffect(() => {
    const initSession = async () => {
      if (token) {
        try {
          const profileRes = await api.get('/profile');
          setUser(profileRes.data);
          
          const ticketRes = await api.get('/ticket');
          setTicket(ticketRes.data);
        } catch (error) {
          console.error('Session restore failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initSession();
  }, [token]);

  // Voice Speech Synthesizer for spoken alerts
  const speakAlert = (text) => {
    if (!voiceGuidance) return;
    try {
      window.speechSynthesis.cancel(); // Stop current speaking
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
    }
  };

  // Trigger voice guidance changes
  useEffect(() => {
    localStorage.setItem('acc_largeText', largeText.toString());
    localStorage.setItem('acc_highContrast', highContrast.toString());
    localStorage.setItem('acc_wheelchair', wheelchairRoute.toString());
    localStorage.setItem('acc_voice', voiceGuidance.toString());

    // Apply global classes to document element
    const root = document.documentElement;
    if (largeText) {
      root.classList.add('accessibility-large-text');
    } else {
      root.classList.remove('accessibility-large-text');
    }

    if (highContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }
  }, [largeText, highContrast, wheelchairRoute, voiceGuidance]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('fifa_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      
      // Attempt ticket fetch
      const ticketRes = await api.get('/ticket');
      setTicket(ticketRes.data);
      
      speakAlert('Successfully logged in. Welcome back to Stadium Guide.');
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Login failed';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/register', { name, email, password });
      localStorage.setItem('fifa_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);

      // Attempt ticket fetch
      const ticketRes = await api.get('/ticket');
      setTicket(ticketRes.data);

      speakAlert('Account created successfully. Welcome to Stadium Guide.');
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      // Simulating a Google login returning token via mock endpoint
      // To simulate, we perform a guest login which gets a mock token,
      // but configured with Google details.
      const res = await api.post('/guest-login');
      const googleUser = {
        id: 'google_user_id',
        name: 'Alex Morgan (Google)',
        email: 'alex.morgan@gmail.com',
        photo: 'https://lh3.googleusercontent.com/a/default-user',
        preferences: { accessibilityMode: false, highContrast: false, largeText: false, voiceGuidance: false }
      };
      
      localStorage.setItem('fifa_token', res.data.token);
      setToken(res.data.token);
      setUser(googleUser);

      const ticketRes = await api.get('/ticket');
      setTicket(ticketRes.data);

      speakAlert('Successfully authenticated with Google.');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Google authentication failed' };
    } finally {
      setLoading(false);
    }
  };

  const guestLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post('/guest-login');
      localStorage.setItem('fifa_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);

      const ticketRes = await api.get('/ticket');
      setTicket(ticketRes.data);

      speakAlert('Entering Guest Mode. Explore the stadium guide.');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Guest session creation failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('fifa_token');
    setToken(null);
    setUser(null);
    setTicket(null);
    speakAlert('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      ticket,
      loading,
      login,
      register,
      googleLogin,
      guestLogin,
      logout,
      // Accessibility states
      largeText,
      setLargeText,
      highContrast,
      setHighContrast,
      wheelchairRoute,
      setWheelchairRoute,
      voiceGuidance,
      setVoiceGuidance,
      speakAlert
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
