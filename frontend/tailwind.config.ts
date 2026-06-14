import type { Config } from "tailwindcss";

// Design tokens extracted from design/hrast.html — the client-approved direction.
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Themeable — driven by the CSS variables in globals.css (data-theme).
        white: "rgb(var(--c-white) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        sand: "rgb(var(--c-sand) / <alpha-value>)",
        soft: "rgb(var(--c-soft) / <alpha-value>)",
        line: "rgb(var(--c-ink) / 0.11)",
      },
      fontFamily: {
        serif: ["var(--font-marcellus)", "Georgia", "serif"],
        sans: ["var(--font-mulish)", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        hrast: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      letterSpacing: {
        label: "0.22em", // letterspaced small-caps nav links / chapter links
        caps: "0.32em", // .caps section labels
        brand: "0.34em", // centered serif brand
        btn: "0.24em", // pill button
      },
    },
  },
  plugins: [],
};
export default config;
