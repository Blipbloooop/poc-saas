"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

const DEFAULT_PRIMARY = "#16a34a";
const DEFAULT_SECONDARY = "#0f172a";
const STORAGE_PRIMARY_KEY = "theme-color";
const STORAGE_SECONDARY_KEY = "theme-secondary";
const STORAGE_COMPACT_KEY = "theme-sidebar-compact";

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  sidebarCompact: boolean;
  setSidebarCompact: (compact: boolean) => void;
  applyTheme: (primary: string, secondary: string, compact: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: DEFAULT_PRIMARY,
  secondaryColor: DEFAULT_SECONDARY,
  sidebarCompact: false,
  setSidebarCompact: () => {},
  applyTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY);
  const [sidebarCompact, setSidebarCompactState] = useState(false);

  useEffect(() => {
    const primary = localStorage.getItem(STORAGE_PRIMARY_KEY) ?? DEFAULT_PRIMARY;
    const secondary = localStorage.getItem(STORAGE_SECONDARY_KEY) ?? DEFAULT_SECONDARY;
    const compact = localStorage.getItem(STORAGE_COMPACT_KEY) === "true";
    setPrimaryColor(primary);
    setSecondaryColor(secondary);
    setSidebarCompactState(compact);
    document.documentElement.style.setProperty("--primary", primary);
    document.documentElement.style.setProperty("--secondary", secondary);
  }, []);

  // Séparé de applyTheme pour que le bouton collapse de la sidebar persiste sans re-appliquer tout le thème
  const setSidebarCompact = (compact: boolean) => {
    setSidebarCompactState(compact);
    localStorage.setItem(STORAGE_COMPACT_KEY, String(compact));
  };

  const applyTheme = (primary: string, secondary: string, compact: boolean) => {
    setPrimaryColor(primary);
    setSecondaryColor(secondary);
    setSidebarCompactState(compact);
    document.documentElement.style.setProperty("--primary", primary);
    document.documentElement.style.setProperty("--secondary", secondary);
    localStorage.setItem(STORAGE_PRIMARY_KEY, primary);
    localStorage.setItem(STORAGE_SECONDARY_KEY, secondary);
    localStorage.setItem(STORAGE_COMPACT_KEY, String(compact));
  };

  return (
    <ThemeContext.Provider
      value={{ primaryColor, secondaryColor, sidebarCompact, setSidebarCompact, applyTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
