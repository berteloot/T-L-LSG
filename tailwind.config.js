import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        forma: ["var(--font-sans)"]
      },
      colors: {
        lean: {
          blue: "var(--c-lean-blue)",
          momentum: "var(--c-momentum-blue)",
          trust: "var(--c-trust-navy)",
          midnight: "var(--c-midnight-core)"
        },
        neutral: {
          slate: "var(--c-soft-slate)",
          paper: "var(--c-paper-offwhite)",
          altitude: "var(--c-altitude-white)"
        },
        accent: {
          lavender: "var(--c-lavender-mist)",
          aqua: "var(--c-aqua-breeze)",
          orange: "var(--c-solar-orange)",
          sand: "var(--c-sandstone)"
        },
        // Additional colors needed for existing CSS
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0099FF',
          600: '#006EF2',
          700: '#002E66',
          800: '#001F38',
          900: '#000f1c',
        },
        lavender: {
          50: '#f8f7ff',
          100: '#f0efff',
          200: '#e4e2ff',
          300: '#d1cdff',
          400: '#b8b2ff',
          500: '#A3A6FA',
          600: '#8b8cf8',
          700: '#7c7df6',
          800: '#6b6cf4',
          900: '#5a5bf2',
        },
        aqua: {
          50: '#f0fdfc',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#ABE8E5',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Additional colors for existing CSS compatibility
        'lean-blue': '#0099FF',
        'momentum-blue': '#006EF2',
        'trust-navy': '#002E66',
        'midnight-core': '#001F38',
        'solar-orange': '#FF8221',
        'solar-orange-night': '#450D0A',
        'lavender-mist': '#A3A6FA',
        'aqua-breeze': '#ABE8E5',
        'sandstone': '#D6D1BD'
      },
      boxShadow: {
        'volumetric': '0 10px 40px 0 rgba(0, 0, 0, 0.1), 0 2px 8px 0 rgba(0, 0, 0, 0.06)',
        'brand': '0 4px 14px 0 rgba(0, 153, 255, 0.15)',
        'brand-hover': '0 8px 25px 0 rgba(0, 153, 255, 0.25)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'volumetric-slide': 'volumetricSlide 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'volumetric-scale': 'volumetricScale 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'functional-reveal': 'functionalReveal 0.3s ease-out',
        'functional-guide': 'functionalGuide 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        volumetricSlide: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(40px) scale(0.95) rotateX(10deg)',
            filter: 'blur(4px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1) rotateX(0deg)',
            filter: 'blur(0px)'
          },
        },
        volumetricScale: {
          '0%': { 
            opacity: '0', 
            transform: 'scale(0.8) rotateY(15deg)',
            filter: 'blur(2px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale(1) rotateY(0deg)',
            filter: 'blur(0px)'
          },
        },
        functionalReveal: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        functionalGuide: {
          '0%': { opacity: '0', transform: 'translateX(-20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'h1': ['2.5rem', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '500' }],
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
    }
  },
  plugins: []
} satisfies Config;