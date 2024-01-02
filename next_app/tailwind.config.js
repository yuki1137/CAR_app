/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: "#1B7F79",
        secondary: "#FF4858",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(100%)" }, //開始時は右端から
          "100%": { transform: "translateX(0)" }, //終了時は左端まで移動
        },
        slideOut: {
          "0%": { transform: "translateX(0)" }, //開始時は左端から
          "100%": { transform: "translateX(100%)" }, //終了時は右端まで移動
        },
      },
      animation: {
        slideIn: "slideIn 0.3s ease-out forwards",
        slideOut: "slideOut 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
  important: true,
};
