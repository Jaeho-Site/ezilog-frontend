const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        gray: colors.neutral
      },
      fontFamily: {
        // to change, update font in layout.tsx
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        serif: ["var(--font-lora)", ...defaultTheme.fontFamily.serif],
        stock: [defaultTheme.fontFamily.sans]
      },
      aspectRatio: {
        "4/3": "4 / 3",
        "3/2": "3 / 2",
        "2/3": "2 / 3",
        "9/16": "9 / 16",
        "5/4": "5 / 4", // 기존에 사용 중인 비율 추가
        "4/5": "4 / 5"  // 세로가 더 긴 4:5 비율 추가
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
}; 