/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],

  plugins: [require("daisyui")],

  darkTheme: "dark",

  darkMode: ["selector", "[data-theme='dark']"],

  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#6366F1", // light indigo with a magenta hint
          "primary-content": "#FFFFFF",
          secondary: "#D946EF", // magenta
          "secondary-content": "#1E293B",
          accent: "#E879F9", // soft magenta accent
          "accent-content": "#1E293B",
          neutral: "#CBD5E1", // light cool gray
          "neutral-content": "#1E293B",
          "base-100": "#F9FAFB", // very light gray background
          "base-200": "#F3F4F6",
          "base-300": "#E5E7EB",
          "base-content": "#1E293B", // dark gray text
          info: "#93C5FD", // light blue for info
          success: "#A78BFA", // lavender for success
          warning: "#FBBF24", // amber
          error: "#F87171", // soft red for error
          "--rounded-btn": "9999rem",
          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        dark: {
          primary: "#4F46E5", // deeper indigo-magenta
          "primary-content": "#F9FAFB",
          secondary: "#DB2777", // dark magenta
          "secondary-content": "#F9FAFB",
          accent: "#E879F9", // soft magenta accent
          "accent-content": "#F9FAFB",
          neutral: "#64748B", // mid-tone cool gray
          "neutral-content": "#F9FAFB",
          "base-100": "#1E293B", // dark gray background
          "base-200": "#111827",
          "base-300": "#4F46E5", // deeper indigo-magenta background
          "base-content": "#F9FAFB", // light content
          info: "#60A5FA", // light blue for info
          success: "#A78BFA", // lavender for success
          warning: "#F59E0B", // amber
          error: "#EF4444", // red
          "--rounded-btn": "9999rem",
          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },

  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};
