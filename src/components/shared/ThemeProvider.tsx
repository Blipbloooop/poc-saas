"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { updateOrganizationTheme } from "@/server/actions/theme";
import { DEFAULT_THEME_PRIMARY, DEFAULT_THEME_SECONDARY } from "@/lib/constants/theme";

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  organizationLogo: string | null;
  organizationName: string;
  applyTheme: (primary: string, secondary: string) => void;
  setOrganizationLogo: (url: string) => void;
  setOrganizationName: (name: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: DEFAULT_THEME_PRIMARY,
  secondaryColor: DEFAULT_THEME_SECONDARY,
  organizationLogo: null,
  organizationName: "",
  applyTheme: () => {},
  setOrganizationLogo: () => {},
  setOrganizationName: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
  initialPrimary?: string;
  initialSecondary?: string;
  initialLogo?: string | null;
  initialName?: string;
}

// Le thème (couleurs), le logo et le nom viennent de l'organisation en base — voir
// getOrganizationTheme / getMyCompanyProfile, appelés côté serveur dans
// (dashboard)/layout.tsx et passés ici en props.
export function ThemeProvider({
  children,
  initialPrimary = DEFAULT_THEME_PRIMARY,
  initialSecondary = DEFAULT_THEME_SECONDARY,
  initialLogo = null,
  initialName = "",
}: ThemeProviderProps) {
  const [primaryColor, setPrimaryColor] = useState(initialPrimary);
  const [secondaryColor, setSecondaryColor] = useState(initialSecondary);
  const [organizationLogo, setOrganizationLogo] = useState(initialLogo);
  const [organizationName, setOrganizationName] = useState(initialName);

  useEffect(() => {
    document.documentElement.style.setProperty("--primary", primaryColor);
    document.documentElement.style.setProperty("--secondary", secondaryColor);

    // Sans ce nettoyage, ces styles inline restent sur <html> après une
    // navigation côté client vers une page hors du dashboard (ex: /signin
    // après déconnexion), puisque <html> persiste entre les routes.
    return () => {
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--secondary");
    };
  }, [primaryColor, secondaryColor]);

  const applyTheme = (primary: string, secondary: string) => {
    setPrimaryColor(primary);
    setSecondaryColor(secondary);
    updateOrganizationTheme(primary, secondary).catch(() => {});
  };

  return (
    <ThemeContext.Provider
      value={{
        primaryColor,
        secondaryColor,
        organizationLogo,
        organizationName,
        applyTheme,
        setOrganizationLogo,
        setOrganizationName,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
