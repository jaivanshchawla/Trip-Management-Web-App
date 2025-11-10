import { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  screens : {
    lg : '1026px'
  },
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        white: '#ffffff',
        warning: {
          DEFAULT: '#ffcc00',
          foreground: '#FFFFFF',
        },
        featureUpdate: {
          DEFAULT: '#4caf50',
          foreground: '#ffffff',
        },
        gray: {
          100: '#f5f5f5',
        },
        // Custom Colors
        whiteColor: '#ffffff',
        primaryColor: '#FF6A00',
        backgroundColor: '#FFFFFFFa',
        primaryTextColor: '#000000',
        secondaryTextColor: '#5a5a5a',
        splashColor: 'rgba(255, 255, 255, 0.3)',
        cardColor: '#ffffff',
        cardSecondaryColor: '#cecece',
        buttonColor: '#000000',
        borderColor: '#c3c3c3',
        bottomNavBarColor: '#FE8631', 
        primaryOrange: '#ff6a00',
        lightOrange: '#ffa666',
        lightOrangeButtonColor: '#ffcaA4',
        destructive: '#D95C2B',
        buttonTextColor: '#6F2718',
        hoverColor: '#FFC49980',

        // Replaced HSL-based Colors with example color codes
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#93c5fd",
        background: "#ffffff",
        foreground: "#020617",
        primary: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#64748b",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#f59e0b",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#020617",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#020617",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-radial-home': 'radial-gradient(ellipse_at_80%_50%,_#FFC499_0%,_#FFFFFF_80%)',
        'gradient-radial-home2': 'radial-gradient(ellipse_at_80%_50%,_#FFFFFF_0%,_#FFC499_80%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config