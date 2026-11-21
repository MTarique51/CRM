import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: { ink: "#172033", brand: "#4f46e5", canvas: "#f6f7fb" },
      boxShadow: { soft: "0 8px 30px rgba(15,23,42,.06)" },
    },
  },
  plugins: [],
};
export default config;
