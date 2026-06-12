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
        white: "#F7F4EF",
        ink: "#221C16",
        sand: "#C8B49A",
        soft: "#8A8074",
        line: "rgb(34 28 22 / 0.11)", // #221C161C
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
