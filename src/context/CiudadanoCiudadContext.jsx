"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/services/apiClient";
import { authService } from "@/services/authService";
import { toast } from "sonner";

const STORAGE_KEY_PREFIX = "reportarg_ciudad_contexto_";
const MAX_CIUDADES_INTERES = 3;

const CiudadanoCiudadContext = createContext(null);

export function CiudadanoCiudadProvider({ children }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id || null;
  const userRole = session?.user?.role || null;

  const [loading, setLoading] = useState(true);
  const [ciudadResidencia, setCiudadResidencia] = useState(null);
  const [ciudadesInteres, setCiudadesInteres] = useState([]);
  const [ciudadesActivas, setCiudadesActivas] = useState([]);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const storageKey = userId ? `${STORAGE_KEY_PREFIX}${userId}` : null;

  const cargarContextoCiudad = useCallback(async () => {
    if (status === "loading") return;
    if (!userId || userRole !== "ciudadano") {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [meRes, activasRes, interesRes] = await Promise.allSettled([
        apiClient.get("/auth/me"),
        authService.getCiudadesActivas(),
        authService.getCiudadesInteres(),
      ]);

      const meData = meRes.status === "fulfilled" && meRes.value?.data?.ok ? meRes.value.data.data : null;
      const listaActivas = activasRes.status === "fulfilled" && activasRes.value?.ok ? (activasRes.value.data || []) : [];
      const interesPayload = interesRes.status === "fulfilled" && interesRes.value?.ok ? interesRes.value.data : null;

      setCiudadesActivas(listaActivas);

      const residencia = meData?.ciudad_residencia || {
        id: meData?.id_ciudad || null,
        nombre: meData?.ciudad_declarada || meData?.ciudad_activa || meData?.ciudad || "Sin localidad",
        provincia: meData?.provincia_declarada || meData?.provincia_activa || meData?.provincia || "",
        activa: Boolean(meData?.residencia_activa ?? meData?.id_ciudad),
      };
      setCiudadResidencia(residencia);

      const listaInteres = interesPayload?.ciudades || meData?.ciudades_interes || [];
      setCiudadesInteres(listaInteres);

      // Resolver qué ciudad queda seleccionada como contexto de consulta
      let guardadaId = null;
      if (typeof window !== "undefined" && storageKey) {
        const raw = window.sessionStorage.getItem(storageKey);
        if (raw) {
          const parsed = Number(raw);
          if (Number.isSafeInteger(parsed) && parsed > 0) {
            guardadaId = parsed;
          }
        }
      }

      if (guardadaId) {
        // Verificar si la ciudad guardada en sesión sigue activa (ya sea residencia, interés o visitante)
        if (residencia.activa && Number(residencia.id) === guardadaId) {
          setCiudadSeleccionada({ ...residencia, esResidencia: true });
        } else {
          const enInteres = listaInteres.find((c) => Number(c.id) === guardadaId && c.activa);
          const enActivas = listaActivas.find((c) => Number(c.id) === guardadaId);
          if (enInteres) {
            setCiudadSeleccionada({ ...enInteres, activa: true, esResidencia: false });
          } else if (enActivas) {
            setCiudadSeleccionada({ ...enActivas, activa: true, esResidencia: false });
          } else if (residencia.activa && residencia.id) {
            setCiudadSeleccionada({ ...residencia, esResidencia: true });
            if (typeof window !== "undefined" && storageKey) {
              window.sessionStorage.setItem(storageKey, String(residencia.id));
            }
          } else {
            setCiudadSeleccionada(null);
          }
        }
      } else if (residencia.activa && residencia.id) {
        setCiudadSeleccionada({ ...residencia, esResidencia: true });
      } else {
        setCiudadSeleccionada(null);
      }
    } catch {
      // Mantiene estado seguro ante error de red
    } finally {
      setLoading(false);
    }
  }, [status, userId, userRole, storageKey]);

  useEffect(() => {
    cargarContextoCiudad();
  }, [cargarContextoCiudad]);

  const seleccionarCiudad = useCallback(async (idCiudadInput) => {
    const idCiudad = Number(idCiudadInput);
    if (!idCiudad || !Number.isSafeInteger(idCiudad) || idCiudad <= 0) return false;

    setProcesando(true);
    try {
      const res = await authService.cambiarContextoCiudad(idCiudad);
      if (res?.ok && res?.data?.ciudad_seleccionada) {
        const nueva = {
          ...res.data.ciudad_seleccionada,
          esResidencia: Boolean(res.data.es_residencia),
        };
        setCiudadSeleccionada(nueva);
        if (typeof window !== "undefined" && storageKey) {
          window.sessionStorage.setItem(storageKey, String(nueva.id));
        }
        toast.success(
          nueva.esResidencia
            ? `Volviste a tu ciudad de residencia: ${nueva.nombre}`
            : `Consultando ${nueva.nombre} como visitante`
        );
        return true;
      }
      return false;
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.error || "No se pudo cambiar la ciudad seleccionada.";
      toast.error(msg);
      return false;
    } finally {
      setProcesando(false);
    }
  }, [storageKey]);

  const agregarCiudadInteres = useCallback(async (idCiudadInput) => {
    const idCiudad = Number(idCiudadInput);
    if (!idCiudad) return false;

    setProcesando(true);
    try {
      const res = await authService.addCiudadInteres(idCiudad);
      if (res?.ok && res?.data) {
        setCiudadesInteres(res.data.ciudades || []);
        toast.success(res.mensaje || "Ciudad de interés agregada.");
        return true;
      }
      return false;
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.error || "No se pudo agregar la ciudad de interés.";
      toast.error(msg);
      return false;
    } finally {
      setProcesando(false);
    }
  }, []);

  const eliminarCiudadInteres = useCallback(async (idCiudadInput) => {
    const idCiudad = Number(idCiudadInput);
    if (!idCiudad) return false;

    setProcesando(true);
    try {
      const res = await authService.removeCiudadInteres(idCiudad);
      if (res?.ok && res?.data) {
        const actualizadas = res.data.ciudades || [];
        setCiudadesInteres(actualizadas);
        toast.success(res.mensaje || "Ciudad de interés eliminada.");

        // Si el usuario estaba consultando la ciudad que acaba de eliminar, volver a su residencia activa
        if (ciudadSeleccionada && Number(ciudadSeleccionada.id) === idCiudad) {
          if (ciudadResidencia?.activa && ciudadResidencia?.id) {
            setCiudadSeleccionada({ ...ciudadResidencia, esResidencia: true });
            if (typeof window !== "undefined" && storageKey) {
              window.sessionStorage.setItem(storageKey, String(ciudadResidencia.id));
            }
          } else {
            setCiudadSeleccionada(null);
            if (typeof window !== "undefined" && storageKey) {
              window.sessionStorage.removeItem(storageKey);
            }
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.error || "No se pudo eliminar la ciudad de interés.";
      toast.error(msg);
      return false;
    } finally {
      setProcesando(false);
    }
  }, [ciudadSeleccionada, ciudadResidencia, storageKey]);

  const esVisitante = useMemo(() => {
    if (!ciudadSeleccionada?.id) return false;
    if (!ciudadResidencia?.activa || !ciudadResidencia?.id) return true;
    return Number(ciudadSeleccionada.id) !== Number(ciudadResidencia.id);
  }, [ciudadSeleccionada, ciudadResidencia]);

  const puedeOperarEnCiudadActual = useMemo(() => {
    return Boolean(ciudadResidencia?.activa && ciudadResidencia?.id && !esVisitante);
  }, [ciudadResidencia, esVisitante]);

  const ciudadesInteresInactivas = useMemo(
    () => ciudadesInteres.filter((c) => !c.activa),
    [ciudadesInteres]
  );

  const value = useMemo(
    () => ({
      loading,
      procesando,
      ciudadResidencia,
      ciudadesInteres,
      ciudadesInteresInactivas,
      ciudadesActivas,
      ciudadSeleccionada,
      esVisitante,
      puedeOperarEnCiudadActual,
      maxCiudadesInteres: MAX_CIUDADES_INTERES,
      modalAbierto,
      setModalAbierto,
      seleccionarCiudad,
      agregarCiudadInteres,
      eliminarCiudadInteres,
      recargarContextoCiudad: cargarContextoCiudad,
    }),
    [
      loading,
      procesando,
      ciudadResidencia,
      ciudadesInteres,
      ciudadesInteresInactivas,
      ciudadesActivas,
      ciudadSeleccionada,
      esVisitante,
      puedeOperarEnCiudadActual,
      modalAbierto,
      seleccionarCiudad,
      agregarCiudadInteres,
      eliminarCiudadInteres,
      cargarContextoCiudad,
    ]
  );

  return (
    <CiudadanoCiudadContext.Provider value={value}>
      {children}
    </CiudadanoCiudadContext.Provider>
  );
}

export function useCiudadanoCiudad() {
  const ctx = useContext(CiudadanoCiudadContext);
  if (!ctx) {
    return {
      loading: false,
      procesando: false,
      ciudadResidencia: null,
      ciudadesInteres: [],
      ciudadesInteresInactivas: [],
      ciudadesActivas: [],
      ciudadSeleccionada: null,
      esVisitante: false,
      puedeOperarEnCiudadActual: true,
      maxCiudadesInteres: MAX_CIUDADES_INTERES,
      modalAbierto: false,
      setModalAbierto: () => {},
      seleccionarCiudad: async () => false,
      agregarCiudadInteres: async () => false,
      eliminarCiudadInteres: async () => false,
      recargarContextoCiudad: async () => {},
    };
  }
  return ctx;
}
