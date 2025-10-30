/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            h1: { fontSize: "1.875rem", fontWeight: "700", color: "#1e40af" }, // 30px
            h2: { fontSize: "1.5rem", fontWeight: "700", color: "#1e3a8a" },   // 24px
            h3: { fontSize: "1.25rem", fontWeight: "600", color: "#1e3a8a" },  // 20px
          },
        },
        invert: {
          css: {
            h1: { color: "#60a5fa" },
            h2: { color: "#3b82f6" },
            h3: { color: "#3b82f6" },
          },
        },
      },

      // ✅ Added animations
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 1s ease-out",
      },
    },
  },

  // ✅ Plugins must be an array
  plugins: [require("@tailwindcss/typography")],
};
