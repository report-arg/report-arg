"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { RefreshCw, AlertCircle } from "lucide-react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

import ClaimStatsCards from "@/components/admin/reclamos/ClaimStatsCards";
import ClaimFilterBar from "@/components/admin/reclamos/ClaimFilterBar";
import ClaimTable from "@/components/admin/reclamos/ClaimTable";
import ClaimDetailModal from "@/components/admin/reclamos/ClaimDetailModal";
import ClaimReassignModal from "@/components/admin/reclamos/ClaimReassignModal";

export default function AdminReclamosPage() {
  // Lista y paginación
  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPag, setTotalPag] = useState(1);
  const [pagina, setPagina] = useState(1);

  // Filtros y búsqueda con debounce
  const [busqueda, setBusqueda] = useState("");
  const debouncedBusqueda = useDebounce(busqueda, 350);
  const [filtroEstado, setFiltroEstado] = useState("");

  // Métricas
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enRevision: 0,
    enProceso: 0,
    resueltos: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Modales
  const [detalle, setDetalle] = useState(null);
  const [modalReasignar, setModalReasignar] = useState(null);
  const [instituciones, setInstituciones] = useState([]);
  const [loadingInstituciones, setLoadingInstituciones] = useState(false);
  const [institucionDestino, setInstitucionDestino] = useState("");
  const [motivoReasignacion, setMotivoReasignacion] = useState("");
  const [errorReasignacion, setErrorReasignacion] = useState("");
  const [guardandoReasignacion, setGuardandoReasignacion] = useState(false);

  // Cargar estadísticas
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await apiClient.get("/admin/reclamos/stats");
      if (res.data?.ok) {
        setStats(res.data.data);
      }
    } catch {
      // stats fallback silencioso
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Cargar reclamos paginados
  const fetchReclamos = useCallback(
    async (page = pagina, estado = filtroEstado, search = debouncedBusqueda) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          pagina: String(page),
          limite: "15",
        });
        if (estado) params.set("estado", estado);
        if (search && search.trim()) params.set("busqueda", search.trim());

        const res = await apiClient.get(`/admin/reclamos/lista?${params.toString()}`);
        if (res.data?.ok) {
          setReclamos(res.data.data || []);
          setTotal(res.data.total || 0);
          setTotalPag(res.data.totalPaginas || 1);
        } else {
          setError(res.data?.mensaje || "Error al cargar la lista de reclamos.");
        }
      } catch (err) {
        setError(
          err.response?.data?.mensaje ||
            "No se pudo conectar con el servidor para consultar los reclamos."
        );
      } finally {
        setLoading(false);
      }
    },
    [pagina, filtroEstado, debouncedBusqueda]
  );

  // Cargar instituciones verificadas para reasignación
  const cargarInstituciones = async () => {
    if (instituciones.length > 0) return;
    setLoadingInstituciones(true);
    try {
      const res = await apiClient.get("/admin/instituciones?estado=verificada");
      if (res.data?.ok) {
        setInstituciones(res.data.data || []);
      }
    } catch {
      toast.error("Error al cargar lista de instituciones para reasignar.");
    } finally {
      setLoadingInstituciones(false);
    }
  };

  // Efecto inicial para métricas
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Efecto para cambios en búsqueda o estado
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchReclamos(1, filtroEstado, debouncedBusqueda);
      return;
    }
    setPagina(1);
    fetchReclamos(1, filtroEstado, debouncedBusqueda);
  }, [debouncedBusqueda, filtroEstado, fetchReclamos]);

  // Manejador de cambio de página
  const handleCambiarPagina = (nuevaPag) => {
    const clamped = Math.max(1, Math.min(nuevaPag, totalPag));
    setPagina(clamped);
    fetchReclamos(clamped, filtroEstado, debouncedBusqueda);
  };

  // Abrir detalle completo
  const abrirDetalle = async (id) => {
    try {
      const res = await apiClient.get(`/admin/reclamos/${id}`);
      if (res.data?.ok) {
        setDetalle(res.data.data);
      } else {
        toast.error(res.data?.mensaje || "Error al cargar el detalle del reclamo.");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "No se pudo consultar el detalle.");
    }
  };

  // Abrir modal de reasignación
  const abrirReasignar = async (rec) => {
    setModalReasignar(rec);
    setInstitucionDestino("");
    setMotivoReasignacion("");
    setErrorReasignacion("");
    await cargarInstituciones();
  };

  // Ejecutar reasignación con auditoría
  const handleConfirmarReasignacion = async () => {
    setErrorReasignacion("");

    if (!institucionDestino) {
      setErrorReasignacion("Debés seleccionar una institución destino.");
      return;
    }

    if (!motivoReasignacion.trim()) {
      setErrorReasignacion("El motivo de reasignación es obligatorio para registrar la auditoría.");
      return;
    }

    setGuardandoReasignacion(true);
    try {
      const res = await apiClient.patch(`/admin/reclamos/${modalReasignar.id}/institucion`, {
        id_institucion: Number(institucionDestino),
        motivo: motivoReasignacion.trim(),
      });

      if (res.data?.ok) {
        toast.success("Reclamo reasignado exitosamente con registro en el historial.");
        const recId = modalReasignar.id;
        setModalReasignar(null);
        if (detalle && detalle.id === recId) {
          await abrirDetalle(recId);
        }
        await fetchReclamos(pagina, filtroEstado, debouncedBusqueda);
        await fetchStats();
      } else {
        setErrorReasignacion(res.data?.mensaje || "Error al reasignar institución.");
      }
    } catch (err) {
      setErrorReasignacion(
        err.response?.data?.mensaje || "Error al procesar la reasignación."
      );
    } finally {
      setGuardandoReasignacion(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Encabezado */}
      <PageHeader
        title="Supervisión de Reclamos"
        description="Supervisión global de reclamos ciudadanos, auditoría de eventos y reasignación institucional territorial."
        action={
          <Button
            onClick={() => {
              fetchReclamos(pagina, filtroEstado, debouncedBusqueda);
              fetchStats();
            }}
            variant="outline"
            leftIcon={<RefreshCw size={16} className={loading ? "animate-spin" : ""} />}
          >
            Actualizar
          </Button>
        }
      />

      {/* Tarjetas KPI de Estado */}
      <ClaimStatsCards
        stats={stats}
        loading={loadingStats}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
      />

      {/* Controles de búsqueda y filtros */}
      <ClaimFilterBar
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        onLimpiarBusqueda={() => setBusqueda("")}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        onLimpiarTodo={() => {
          setBusqueda("");
          setFiltroEstado("");
        }}
        totalResultados={reclamos.length}
        totalGeneral={total}
      />

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold m-0">Error en la consulta</p>
            <p className="text-xs mt-1 m-0">{error}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => fetchReclamos(pagina, filtroEstado, debouncedBusqueda)}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Tabla y Cards */}
      <ClaimTable
        reclamos={reclamos}
        loading={loading}
        pagina={pagina}
        totalPaginas={totalPag}
        onCambiarPagina={handleCambiarPagina}
        onVerDetalle={abrirDetalle}
        onReasignar={abrirReasignar}
      />

      {/* MODAL 1: DETALLE COMPLETO Y SUPERVISIÓN */}
      <ClaimDetailModal
        isOpen={Boolean(detalle)}
        onClose={() => setDetalle(null)}
        detalle={detalle}
        onAbrirReasignar={(d) => abrirReasignar(d)}
      />

      {/* MODAL 2: REASIGNACIÓN AUDITADA */}
      <ClaimReassignModal
        isOpen={Boolean(modalReasignar)}
        onClose={() => setModalReasignar(null)}
        reclamo={modalReasignar}
        instituciones={instituciones}
        loadingInstituciones={loadingInstituciones}
        institucionDestino={institucionDestino}
        onInstitucionDestinoChange={setInstitucionDestino}
        motivo={motivoReasignacion}
        onMotivoChange={setMotivoReasignacion}
        error={errorReasignacion}
        guardando={guardandoReasignacion}
        onConfirmar={handleConfirmarReasignacion}
      />
    </div>
  );
}