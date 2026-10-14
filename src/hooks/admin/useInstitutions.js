"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Hook centralizado para la gestión de instituciones y solicitudes.
 * Comparte lógica de consulta, filtros, estadísticas, verificación y rechazo
 * entre el padrón general (/admin/institutions) y la bandeja de pendientes (/admin/solicitudes).
 *
 * @param {Object} options
 * @param {string} [options.filtroInicialEstado="todos"] - Estado inicial ('todos', 'verificada', 'pendiente', 'rechazada')
 * @param {boolean} [options.fetchStats=true] - Si debe consultar las estadísticas globales
 * @param {number} [options.limite=15] - Cantidad de registros por página
 */
export function useInstitutions({
  filtroInicialEstado = "todos",
  fetchStats = true,
  limite = 15,
} = {}) {
  const [instituciones, setInstituciones] = useState([]);
  const [stats, setStats] = useState({ total: 0, verificadas: 0, pendientes: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState("");

  // Paginación y filtros
  const [busqueda, setBusqueda] = useState("");
  const debouncedBusqueda = useDebounce(busqueda, 350);
  const [filtroEstado, setFiltroEstado] = useState(filtroInicialEstado);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Estados de modales compartidos
  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalAprobar, setModalAprobar] = useState(null);
  const [modalRechazar, setModalRechazar] = useState(null);
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  // Cargar estadísticas globales
  const cargarStats = useCallback(async () => {
    if (!fetchStats) return;
    try {
      setLoadingStats(true);
      const res = await apiClient.get("/admin/instituciones/stats");
      if (res.data?.ok && res.data?.data) {
        setStats(res.data.data);
      }
    } catch {
      // Error silencioso en estadísticas secundarias
    } finally {
      setLoadingStats(false);
    }
  }, [fetchStats]);

  // Cargar listado de instituciones
  const cargarInstituciones = useCallback(
    async (p = pagina, search = debouncedBusqueda, estado = filtroEstado) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (estado && estado !== "todos") params.append("estado", estado);
        if (search && search.trim()) params.append("busqueda", search.trim());
        params.append("pagina", String(p));
        params.append("limite", String(limite));

        const res = await apiClient.get(`/admin/instituciones?${params.toString()}`);
        if (res.data?.ok) {
          setInstituciones(res.data.data || []);
          setTotalPaginas(res.data.totalPaginas || 1);
          setTotalRegistros(res.data.total || 0);
          setPagina(res.data.pagina || p);
        } else {
          setError(res.data?.mensaje || "Error al cargar las instituciones.");
        }
      } catch (err) {
        setError(
          err.response?.data?.mensaje ||
            "No se pudo conectar con el servidor para consultar las instituciones."
        );
      } finally {
        setLoading(false);
      }
    },
    [pagina, debouncedBusqueda, filtroEstado, limite]
  );

  // Efecto cuando cambia la búsqueda debounced o el filtro de estado
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      cargarStats();
      cargarInstituciones(1, debouncedBusqueda, filtroEstado);
      return;
    }
    setPagina(1);
    cargarInstituciones(1, debouncedBusqueda, filtroEstado);
  }, [debouncedBusqueda, filtroEstado, cargarStats, cargarInstituciones]);

  // Manejar cambio de página
  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas || nuevaPagina === pagina) return;
    setPagina(nuevaPagina);
    cargarInstituciones(nuevaPagina, debouncedBusqueda, filtroEstado);
  };

  // Limpiar búsqueda
  const limpiarBusqueda = () => {
    setBusqueda("");
  };

  // Acción: Verificar / Aprobar institución
  const verificarInstitucion = async (institucion) => {
    if (!institucion?.id) return false;
    setProcesandoAccion(true);
    try {
      const res = await apiClient.put(`/admin/instituciones/${institucion.id}/verificar`);
      if (res.data?.ok) {
        toast.success(`Institución "${institucion.nombre}" verificada correctamente.`);
        setModalAprobar(null);
        if (modalDetalle?.id === institucion.id) {
          setModalDetalle((prev) =>
            prev ? { ...prev, verificada: 1, fecha_verificacion: new Date().toISOString() } : null
          );
        }
        await cargarInstituciones(pagina, debouncedBusqueda, filtroEstado);
        await cargarStats();
        return true;
      } else {
        toast.error(res.data?.mensaje || "Error al verificar la institución.");
        return false;
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al procesar la verificación.");
      return false;
    } finally {
      setProcesandoAccion(false);
    }
  };

  // Acción: Rechazar institución con motivo
  const rechazarInstitucion = async (institucion, motivo) => {
    if (!institucion?.id) return { ok: false, error: "ID de institución inválido" };
    if (!motivo || !motivo.trim()) {
      return { ok: false, error: "El motivo de rechazo es obligatorio para notificar a la entidad." };
    }

    setProcesandoAccion(true);
    try {
      const res = await apiClient.put(`/admin/instituciones/${institucion.id}/rechazar`, {
        motivo: motivo.trim(),
      });
      if (res.data?.ok) {
        toast.success(`Solicitud de "${institucion.nombre}" rechazada correctamente.`);
        setModalRechazar(null);
        if (modalDetalle?.id === institucion.id) {
          setModalDetalle((prev) =>
            prev ? { ...prev, verificada: 0, fecha_verificacion: null } : null
          );
        }
        await cargarInstituciones(pagina, debouncedBusqueda, filtroEstado);
        await cargarStats();
        return { ok: true };
      } else {
        const msg = res.data?.mensaje || "Error al rechazar la institución.";
        toast.error(msg);
        return { ok: false, error: msg };
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al rechazar la institución.";
      toast.error(msg);
      return { ok: false, error: msg };
    } finally {
      setProcesandoAccion(false);
    }
  };

  return {
    instituciones,
    stats,
    loading,
    loadingStats,
    error,
    pagina,
    totalPaginas,
    totalRegistros,
    cambiarPagina,
    busqueda,
    setBusqueda,
    limpiarBusqueda,
    filtroEstado,
    setFiltroEstado,
    cargarInstituciones,
    cargarStats,
    // Modales y acciones
    modalDetalle,
    setModalDetalle,
    modalAprobar,
    setModalAprobar,
    modalRechazar,
    setModalRechazar,
    procesandoAccion,
    verificarInstitucion,
    rechazarInstitucion,
  };
}

export default useInstitutions;
