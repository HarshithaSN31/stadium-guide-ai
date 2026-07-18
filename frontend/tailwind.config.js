/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fifa: {
          dark: '#030712', // Dark background
          card: 'rgba(17, 24, 39, 0.7)', // Glassmorphism card back
          border: 'rgba(255, 255, 255, 0.08)', // Soft glass border
          blue: {
            DEFAULT: '#0052B4', // FIFA royal blue
            dark: '#0A192F', // Deep stadium night blue
            light: '#3B82F6', // Neon blue highlight
          },
          neon: {
            DEFAULT: '#00FF66', // Football pitch neon green
            dark: '#00B344', // Forest grass green
          },
          red: {
            DEFAULT: '#EF4444', // Evacuation / alert red
            glow: 'rgba(239, 68, 68, 0.3)'
          }
        }
      },
      backgroundImage: {
        'stadium-lights': "radial-gradient(circle at top, rgba(59, 130, 246, 0.15) 0%, transparent 60%)",
        'pitch-green': "radial-gradient(circle at bottom, rgba(0, 255, 102, 0.05) 0%, transparent 60%)",
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-glow': '0 0 15px rgba(0, 255, 102, 0.3)',
        'blue-glow': '0 0 20px rgba(0, 82, 180, 0.4)',
      }
    },
  },
  plugins: [],
}
