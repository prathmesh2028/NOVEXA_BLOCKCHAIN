import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEY = "novexa-theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        return stored;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    return "dark"; // Dark NOVEXA theme is default
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    if (body) {
      body.setAttribute("data-theme", theme);
    }
    if (theme === "light") {
      root.classList.add("light", "theme-light");
      root.classList.remove("dark", "theme-dark");
      if (body) {
        body.classList.add("light", "theme-light");
        body.classList.remove("dark", "theme-dark");
      }
    } else {
      root.classList.add("dark", "theme-dark");
      root.classList.remove("light", "theme-light");
      if (body) {
        body.classList.add("dark", "theme-dark");
        body.classList.remove("light", "theme-light");
      }
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage write errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
