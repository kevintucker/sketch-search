/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk dark theme
        'cyber-dark': '#0a0a0a',
        'cyber-navy': '#0f172a',
        'cyber-purple': '#1e1b4b',
        'cyber-blue': '#0891b2',
        'cyber-cyan': '#06b6d4',
        'cyber-pink': '#ec4899',
        'cyber-magenta': '#d946ef',
        'cyber-gray': '#374151',
        'cyber-light': '#f3f4f6',
      },
      fontFamily: {
        'cyber': ['Orbitron', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #06b6d4, 0 0 10px #06b6d4, 0 0 15px #06b6d4' },
          '100%': { boxShadow: '0 0 10px #06b6d4, 0 0 20px #06b6d4, 0 0 30px #06b6d4' },
        },
        'pulse-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px #06b6d4)' },
          '50%': { filter: 'drop-shadow(0 0 16px #06b6d4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'cyber': '0 4px 20px rgba(6, 182, 212, 0.3), inset 0 0 20px rgba(6, 182, 212, 0.1)',
        'cyber-pink': '0 4px 20px rgba(236, 72, 153, 0.3), inset 0 0 20px rgba(236, 72, 153, 0.1)',
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0891b2 100%)',
        'cyber-panel': 'linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 27, 75, 0.6) 100%)',
      },
    },
  },
  plugins: [],
}