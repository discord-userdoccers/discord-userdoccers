const colors = require("tailwindcss/colors");
const plugin = require("tailwindcss/plugin");

/**
 * @type {import('tailwindcss/tailwind-config').TailwindConfig}
 */
module.exports = {
  content: ["./pages/**/*.{js,ts,md,jsx,tsx,mdx}", "./components/**/*.{js,ts,md,jsx,tsx,mdx}"],
  darkMode: ["class", ':is([data-theme="dark"], [data-theme="amoled"])'],
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
        "background-dark": "var(--background-dark)",

        "icons-light": "#343331",
        "icons-dark": "#dedddc",

        "sidebar-secondary-dark": "var(--sidebar-secondary-dark)",
        "sidebar-tertiary-light": "#f2f3f5",
        "sidebar-tertiary-dark": "var(--sidebar-tertiary-dark)",

        "table-head-background-dark": "var(--table-head-background-dark)",
        "table-row-background-secondary-dark": "var(--table-row-background-secondary-dark)",

        "theme-light-sidebar": "#f2f3f5",
        "theme-light-sidebar-text": "#6a7480",
        "theme-light-sidebar-hover": "#D4D7DC",
        "theme-light-sidebar-hover-text": "#060607",

        "theme-dark-sidebar": "var(--theme-dark-sidebar)",
        "theme-dark-sidebar-text": "#b9bbbe",
        "theme-dark-sidebar-hover": "var(--theme-dark-sidebar-hover)",
        "trueGray": colors.zinc,

        "theme-light-collapsible": "#e6e7e8",
        "theme-dark-collapsible": "var(--theme-dark-collapsible)",
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
      typography: {
        DEFAULT: {
          css: {
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    plugin(function ({ addVariant }) {
      addVariant("amoled", 'html.amoled &');
    }),
  ],
};
