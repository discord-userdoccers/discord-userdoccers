module.exports = {
  mode: "jit",
  purge: [
    "./pages/**/*.{js,ts,md,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,md,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
