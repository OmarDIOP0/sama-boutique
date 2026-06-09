import { useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
    try {
        const saved = localStorage.getItem("sama-theme") as Theme | null;
        if (saved === "light" || saved === "dark") return saved;
        // Sinon préférence système
        if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
    } catch { /* ignore */ }
    return "light";
}

function apply(theme: Theme) {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    // Compat shadcn / tailwind dark variant
    root.classList.toggle("dark", theme === "dark");
}

/**
 * Gère le thème clair/sombre : localStorage + prefers-color-scheme,
 * applique `data-theme` sur <html>. À utiliser n'importe où (état partagé via storage event).
 */
export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme);

    // Appliquer au montage + à chaque changement
    useEffect(() => { apply(theme); }, [theme]);

    // Synchroniser entre onglets / instances
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === "sama-theme" && (e.newValue === "light" || e.newValue === "dark")) {
                setThemeState(e.newValue);
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const setTheme = useCallback((t: Theme) => {
        try { localStorage.setItem("sama-theme", t); } catch { /* ignore */ }
        apply(t);
        setThemeState(t);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark");
    }, [theme, setTheme]);

    return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
}

// Applique le thème dès le chargement (avant React) pour éviter le flash
export function initTheme() {
    apply(getInitialTheme());
}
