import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['variant', '&:is(.dark *)'],
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7', // 현재 from-purple-500
            600: '#9333ea',
            700: '#7e22ce',
            800: '#6b21a8',
            900: '#581c87'
          },
          pink: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899', // 현재 to-pink-500
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843'
          }
        },
        // Status Colors
        status: {
          success: '#10b981', // emerald-500
          error: '#ef4444', // red-500
          warning: '#f59e0b', // amber-500
          info: '#6b7280' // gray-500
        }
      },
      fontSize: {
        // Display (가장 큰 제목)
        'display-lg': ['3.5rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-sm': ['2.5rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.01em' }],

        // Heading
        'heading-xl': ['2.25rem', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],
        'heading-lg': ['1.875rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-md': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
        'heading-xs': ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],

        // Body
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-xs': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }]
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        shimmer: 'shimmer 2s linear infinite'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, #a855f7, #ec4899)',
        'brand-gradient-vertical': 'linear-gradient(to bottom, #a855f7, #ec4899)',
        'brand-gradient-radial': 'radial-gradient(circle, #a855f7, #ec4899)'
      }
    }
  },
  plugins: []
}

export default config
