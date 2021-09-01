module.exports = {
  mode: "jit",
  purge: [
    "./pages/**/*.{js,ts,md,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,md,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
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

        "table-head-background-light": "cac7c3",
        "table-row-background-primary-light": "#edecea",
        "table-row-background-secondary-light": "#e7e6e3",

        "table-head-background-dark": "#35383c",
        "table-row-background-primary-dark": "#121315",
        "table-row-background-secondary-dark": "#18191c",

        "theme-light-sidebar": "#f2f3f5",
        "theme-light-sidebar-text": "#6a7480",
        "theme-light-sidebar-hover": "#D4D7DC",
        "theme-light-sidebar-hover-text": "#060607",

        "theme-dark-sidebar": "#2e3136",
        "theme-dark-sidebar-text": "#b9bbbe",
      },

      // TODO: Change these out for whatever legitimate font family names discord uses,
      // just here to visualise what itd look like with them rn
      fontFamily: {
        "whitney": ["Whitney Medium", "sans-serif"],
        "whitney-bold": ["Whitney Semibold Regular", "sans-serif"],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
