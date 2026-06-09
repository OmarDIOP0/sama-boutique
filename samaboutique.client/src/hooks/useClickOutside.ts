import { useEffect, useRef } from "react";

/**
 * Appelle `handler` quand on clique en dehors de l'élément référencé,
 * ou quand on appuie sur Échap. Retourne la ref à attacher au conteneur.
 */
export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
    handler: () => void,
    active = true
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!active) return;

        const onPointer = (e: MouseEvent | TouchEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) handler();
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handler(); };

        document.addEventListener("mousedown", onPointer);
        document.addEventListener("touchstart", onPointer);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onPointer);
            document.removeEventListener("touchstart", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [handler, active]);

    return ref;
}
