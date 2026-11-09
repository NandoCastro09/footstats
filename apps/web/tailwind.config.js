export default {
  content: {
    relative: true,
    files: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  },
  theme: {
    extend: {
      colors: {
        bg: "#0A0D0B",
        lime: "#C8F135",
        muted: "#9AA59C",
        alert: {
          DEFAULT: "#FF7A45",
          text: "#FF9A62",
        },
        zone: {
          liberta: "#C8F135",
          pre: "#6FD89A",
          sula: "#4FA3E0",
          z4: "#FF7A45",
        },

        primary: {
          DEFAULT: "#C8F135",
          bright: "#DAF77A",
          solid: "#C8F135",
          "solid-hover": "#B4DB22",
          light: "#222B14",
        },
        success: {
          DEFAULT: "#6FD89A",
          light: "#18291F",
        },
        live: {
          DEFAULT: "#FF5A36",
          text: "#FF9A62",
          strong: "#B83A14",
          dark: "#9A3010",
          light: "#2A1A14",
        },
        warning: {
          DEFAULT: "#D99A2B",
          text: "#E5B45C",
          light: "#2B2616",
        },
        danger: {
          DEFAULT: "#FF9A62",
          solid: "#B8401A",
          "solid-hover": "#9A3414",
          light: "#2A1A14",
        },
        ink: {
          DEFAULT: "#EEF2EC",
          2: "#B4BEB5",
          soft: "#B4BEB5",
          muted: "#9AA59C",
          inverse: "#0A0D0B",
        },
        line: {
          DEFAULT: "#1E2721",
          strong: "#2E3A31",
          field: "#5F6E62",
        },
        surface: {
          DEFAULT: "#121714",
          2: "#0E1310",
          subtle: "#0A0D0B",
          raised: "#0E1310",
          strong: "#3A463D",
          deep: "#0A0D0B",
        },
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "live-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.3", transform: "scale(0.7)" },
        },
      },
      animation: {
        "live-pulse": "live-pulse 1.4s ease-in-out infinite",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
      letterSpacing: {
        label: "0.14em",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ['"Barlow Condensed"', "sans-serif"],
      },
      borderRadius: {
        control: "10px",
        card: "14px",
        panel: "20px",
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
