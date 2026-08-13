import { createContext } from "react";

export type Theme = "light" | "dark";

export interface ThemeContextType {
    theme: Theme;
    setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);