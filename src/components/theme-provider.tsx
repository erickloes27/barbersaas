"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
    primaryColor: string;
    secondaryColor: string;
    setColors: (primary: string, secondary: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
    children,
    initialPrimary = "#fbbf24",
    initialSecondary = "#18181b",
}: {
    children: React.ReactNode;
    initialPrimary?: string;
    initialSecondary?: string;
}) {
    const [primaryColor, setPrimaryColor] = useState(initialPrimary);
    const [secondaryColor, setSecondaryColor] = useState(initialSecondary);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--primary", primaryColor);
        root.style.setProperty("--secondary", secondaryColor);
        // Também podemos setar variações se necessário, mas por enquanto vamos focar nas principais
    }, [primaryColor, secondaryColor]);

    const setColors = (primary: string, secondary: string) => {
        setPrimaryColor(primary);
        setSecondaryColor(secondary);
    };

    return (
        <ThemeContext.Provider value={{ primaryColor, secondaryColor, setColors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
