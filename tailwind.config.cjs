const colors = require("tailwindcss/colors");

/**
 * @type {import('tailwindcss/tailwind-config').TailwindConfig}
 */
module.exports = {
  content: ["./pages/**/*.{js,ts,md,jsx,tsx,mdx}", "./components/**/*.{js,ts,md,jsx,tsx,mdx}"],
  darkMode: ["class", "[data-theme='dark']"],
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
        "brand-link-dark": "#79adf1",
        "brand-link-light": "#0073e1",

        "text-light": "#2e3338",
        "text-dark": "#dcddde",
        "background-dark": "#36373e",

        "icons-light": "#343331",
        "icons-dark": "#dedddc",

        "sidebar-secondary-dark": "#323339",
        "sidebar-tertiary-light": "#f2f3f5",
        "sidebar-tertiary-dark": "#36373e",

        "table-head-background-dark": "#27272a",
        "table-row-background-secondary-dark": "#232428",

        "theme-light-sidebar": "#f2f3f5",
        "theme-light-sidebar-text": "#6a7480",
        "theme-light-sidebar-hover": "#D4D7DC",
        "theme-light-sidebar-hover-text": "#060607",

        "theme-dark-sidebar": "#36373e",
        "theme-dark-sidebar-text": "#b9bbbe",
        "theme-dark-sidebar-hover": "#393C43",
        "trueGray": colors.zinc,

        "theme-light-collapsible": "#e6e7e8",
        "theme-dark-collapsible": "#27292d",
      },

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
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
