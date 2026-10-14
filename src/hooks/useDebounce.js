import { useState, useEffect } from "react";

/**
 * Hook reutilizable para aplicar debounce a un valor cambiante (ej. inputs de búsqueda).
 * Evita llamadas redundantes a la API mientras el usuario escribe.
 *
 * @param {any} value - Valor a debouncificar.
 * @param {number} delay - Tiempo de espera en milisegundos (por defecto 350ms).
 * @returns {any} Valor debouncificado.
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
