"use client";

import { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";

// Simple in-memory cache so we don't spam the API on every page transition
const categoriasCache = {
  todas: null,
  reclamo: null,
  comunicado: null
};

/**
 * Hook reutilizable para obtener categorías según su tipo.
 * @param {string} tipo - "todas" | "reclamo" | "comunicado"
 */
export default function useCategorias(tipo = "todas") {
  const [categorias, setCategorias] = useState(categoriasCache[tipo] || []);
  const [loading, setLoading] = useState(!categoriasCache[tipo]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si ya está en caché, no hacemos fetch de nuevo a menos que queramos forzar recarga (lo cual no es común aquí)
    if (categoriasCache[tipo]) {
      setCategorias(categoriasCache[tipo]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let endpoint = "/feed/categorias"; // Default para explorar
    if (tipo === "reclamo") endpoint = "/reclamos/categorias";
    else if (tipo === "comunicado") endpoint = "/comunicados/categorias";

    apiClient.get(endpoint)
      .then(res => {
        if (res.data?.ok) {
          categoriasCache[tipo] = res.data.data;
          setCategorias(res.data.data);
        } else {
          throw new Error(res.data?.mensaje || "Error al cargar categorías");
        }
      })
      .catch(err => {
        console.error(`Error al cargar categorías [${tipo}]:`, err);
        setError(err);
        toast.error("Ocurrió un error al cargar las categorías.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tipo]);

  return { categorias, loading, error };
}
