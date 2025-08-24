/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,html}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Anime-inspired neon theme
        cyber: {
          50: '#f0f4ff',
          100: '#e0ebff',
          200: '#c7d8ff',
          300: '#a4bbff',
          400: '#8b5cf6',  // main purple
          500: '#7c3aed',  // deep purple
          600: '#6d28d9',  // darker purple
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3c1361',
          950: '#1e0a3e'
        },
        neon: {
          pink: '#ff007f',     // hot pink
          cyan: '#00ffff',     // electric cyan
          purple: '#8b5cf6',   // electric purple
          blue: '#0080ff',     // electric blue
          green: '#00ff88',    // neon green
          yellow: '#ffff00',   // electric yellow
          orange: '#ff8800'    // neon orange
        },
        dark: {
          bg: '#0a0a0f',       // very dark blue-black
          surface: '#1a1a2e',  // dark blue-grey
          card: '#16213e',     // darker blue
          border: '#2a2f5b'    // medium blue-grey
        }
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif']
      },
      boxShadow: {
        'neon-sm': '0 0 5px rgba(139, 92, 246, 0.5)',
        'neon-md': '0 0 10px rgba(139, 92, 246, 0.6), 0 0 20px rgba(139, 92, 246, 0.3)',
        'neon-lg': '0 0 15px rgba(139, 92, 246, 0.7), 0 0 30px rgba(139, 92, 246, 0.4)',
        'neon-pink': '0 0 10px rgba(255, 0, 127, 0.6), 0 0 20px rgba(255, 0, 127, 0.3)',
        'neon-cyan': '0 0 10px rgba(0, 255, 255, 0.6), 0 0 20px rgba(0, 255, 255, 0.3)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(139, 92, 246, 0.1)'
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite alternate',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        'pulse-neon': {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5), 0 0 10px rgba(139, 92, 246, 0.3)' },
          '100%': { boxShadow: '0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.3)' }
        },
        'glow': {
          '0%': { textShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
          '100%': { textShadow: '0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.5)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }
    }
  },
  plugins: []
};
