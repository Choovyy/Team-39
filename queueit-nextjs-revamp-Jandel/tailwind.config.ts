import { green } from "@/Utils/Global_variables";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lgreen: "#CCFC57",
        lgreenHover: "#A8D94A",
        redHover:"#CC5252",
        dpurple: "#7D57FC",
        lushgreen: "rgba(204,252,87,0.5)",
        lushred: "rgba(255,102,102,0.5)",
        lushorange: "rgba(255,165,0,0.5)",
        notlushgreen: "rgba(204,252,87,0.8)",
        notlushred: "rgba(255,102,102,0.8)",
        notlushorange: "rgba(255,165,0,0.8)",
      },
    },
  },
  plugins: [],
} satisfies Config;
