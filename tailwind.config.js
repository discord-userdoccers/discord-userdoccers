const colors = require("tailwindcss/colors");

/** @type {Parameters<import('tailwindcss')>[0]} */
module.exports = {
  mode: "jit",
  purge: [
    "./pages/**/*.{js,ts,md,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,md,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      padding: {
        teensy: "0.1rem",
      },
      gridTemplateRows: {
        "max-content": "max-content",
      },
      colors: {
        "brand-blurple": "#5865F2",
        "brand-link": "#00AFF4",

        "text-light": "#2e3338",
        "text-dark": "#dcddde",
        "background-dark": "#36393f",
        "sidebar-selected-primary-light": "#060607",
        "sidebar-selected-tertiary-light": "#D4D7DC",
        "sidebar-icon-primary-light": "#747f8d",
        "sidebar-tertiary-light": "#f2f3f5",
        "sidebar-tertiary-dark": "#2e3136",

        "table-head-background-dark": "#202225",
        "table-row-background-secondary-dark": "#18191c",

        "theme-light-sidebar": "#f2f3f5",
        "theme-light-sidebar-text": "#6a7480",
        "theme-light-sidebar-hover": "#D4D7DC",
        "theme-light-sidebar-hover-text": "#060607",

        "theme-dark-sidebar": "#2e3136",
        "theme-dark-sidebar-text": "#b9bbbe",
        "theme-dark-sidebar-hover": "#393C43",
        "trueGray": colors.trueGray,
      },

      // TODO: Change these out for whatever legitimate font family names discord uses,
      // just here to visualise what itd look like with them rn
      fontFamily: {
        "whitney": ["Whitney Medium", "sans-serif"],
        "whitney-bold": ["Whitney Semibold Regular", "sans-serif"],
      },
      animation: {
        "fade-in-out": "fadeIn 75ms ease-in",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
  },
  variants: {
    extend: {
      animation: ["motion-safe"],
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
