import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F6F7F9",
        foreground: "#1F2937",
        muted: "#EEF1F4",
        mutedForeground: "#6B7280",
        card: "#FFFFFF",
        cardForeground: "#1F2937",
        border: "#E5E7EB",
        input: "#FFFFFF",
        primary: "#FF4B2B",
        primaryForeground: "#FFFFFF",
        secondary: "#F3F4F6",
        secondaryForeground: "#111827",
        accent: "#F5F7FA",
        accentForeground: "#111827",
        destructive: "#DC2626",
        destructiveForeground: "#FFFFFF",
      },
      borderRadius: {
        lg: "0.875rem",
        md: "0.625rem",
        sm: "0.5rem",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
