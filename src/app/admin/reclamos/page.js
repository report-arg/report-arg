"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { RefreshCw, AlertCircle, ArrowLeft, MapPin } from "lucide-react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

import ReclamoStatsCards from "@/components/admin/reclamos/ReclamoStatsCards";
import ReclamoFilterBar from "@/components/admin/reclamos/ReclamoFilterBar";
import ReclamoTable from "@/components/admin/reclamos/ReclamoTable";
import ReclamoDetailModal from "@/components/admin/reclamos/ReclamoDetailModal";
import ReclamoReassignModal from "@/components/admin/reclamos/ReclamoReassignModal";
import ReclamoCiudadSelector from "@/components/admin/reclamos/ReclamoCiudadSelector";

function AdminReclamosContent() {
  const searchParams = useSearchParams?.();
  const ciudadParam = searchParams?.get?.("ciudad") || "";

  // Selección de Ciudad Territorial
  const [filtroCiudad, setFiltroCiudad] = useState(ciudadParam);

  // Lista y paginación
  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPag, setTotalPag] = useState(1);
  const [pagina, setPagina] = useState(1);

  // Filtros y búsqueda con debounce
  const [busqueda, setBusqueda] = useState("");
  const debouncedBusqueda = useDebounce(busqueda, 350);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroInstitucion, setFiltroInstitucion] = useState("");
  const [filtroAnomalia, setFiltroAnomalia] = useState(false);

  // Catálogos auxiliares para filtros
  const [ciudadesCatalogo, setCiudadesCatalogo] = useState([]);
  const [loadingCiudades, setLoadingCiudades] = useState(true);
  const [categoriasCatalogo, setCategoriasCatalogo] = useState([]);

  // Métricas de reclamos
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enRevision: 0,
    enProceso: 0,
    resueltos: 0,
    sinAsignar: 0,
    pendienteMasAntiguoDias: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Modales
  const [detalle, setDetalle] = useState(null);
  const [modalReasignar, setModalReasignar] = useState(null);
  const [instituciones, setInstituciones] = useState([]);
  const [loadingInstituciones, setLoadingInstituciones] = useState(false);
  const [institucionDestino, setInstitucionDestino] = useState("");
  const [motivoReasignacion, setMotivoReasignacion] = useState("");
  const [errorReasignacion, setErrorReasignacion] = useState("");
  const [guardandoReasignacion, setGuardandoReasignacion] = useState(false);

  // Salvaguardas de ciclo de vida y condiciones de carrera
  const isMountedRef = useRef(true);
  const reqIdRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cargar estadísticas filtradas por ciudad
  const fetchStats = useCallback(async (ciudadId = filtroCiudad) => {
    if (!ciudadId) return;
    setLoadingStats(true);
    try {
      const url = `/admin/reclamos/stats?ciudad=${encodeURIComponent(ciudadId)}`;
      const res = await apiClient.get(url);
      if (isMountedRef.current && res.data?.ok) {
        setStats(res.data.data);
      }
    } catch {
      // stats fallback silencioso
    } finally {
      if (isMountedRef.current) {
        setLoadingStats(false);
      }
    }
  }, [filtroCiudad]);

  // Cargar catálogos para filtros
  const fetchCatalogosFiltros = useCallback(async () => {
    setLoadingCiudades(true);
    try {
      const [resCiudades, resCats, resInst] = await Promise.all([
        apiClient.get("/admin/ciudades").catch(() => null),
        apiClient.get("/admin/categorias").catch(() => null),
        apiClient.get("/admin/instituciones?estado=verificada").catch(() => null),
      ]);
      if (!isMountedRef.current) return;
      if (resCiudades?.data?.ok && Array.isArray(resCiudades.data.data)) {
        setCiudadesCatalogo(resCiudades.data.data);
      }
      if (resCats?.data?.ok && Array.isArray(resCats.data.data)) {
        setCategoriasCatalogo(resCats.data.data);
      }
      if (resInst?.data?.ok && Array.isArray(resInst.data.data)) {
        setInstituciones(resInst.data.data);
      }
    } catch {
      // silencioso
    } finally {
      if (isMountedRef.current) setLoadingCiudades(false);
    }
  }, []);

  // Cargar reclamos paginados con protección contra carreras
  const fetchReclamos = useCallback(
    async (
      page = 1,
      estado = filtroEstado,
      search = debouncedBusqueda,
      ciudad = filtroCiudad,
      categoria = filtroCategoria,
      institucion = filtroInstitucion,
      anomalia = filtroAnomalia
    ) => {
      if (!ciudad) {
        setReclamos([]);
        setTotal(0);
        setTotalPag(1);
        setLoading(false);
        return;
      }

      const currentReqId = ++reqIdRef.current;
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          pagina: String(page),
          limite: "15",
          ciudad: String(ciudad),
        });
        if (estado) params.set("estado", estado);
        if (search && search.trim()) params.set("busqueda", search.trim());
        if (categoria) params.set("categoria", String(categoria));
        if (institucion) params.set("institucion", String(institucion));
        if (anomalia) params.set("anomalia", "true");

        const res = await apiClient.get(`/admin/reclamos/lista?${params.toString()}`);

        if (!isMountedRef.current || currentReqId !== reqIdRef.current) return;

        if (res.data?.ok) {
          setReclamos(res.data.data || []);
          setTotal(res.data.total || 0);
          setTotalPag(res.data.totalPaginas || 1);
          setPagina(page);
        } else {
          setError(res.data?.mensaje || "Error al cargar la lista de reclamos.");
        }
      } catch (err) {
        if (!isMountedRef.current || currentReqId !== reqIdRef.current) return;
        setError(
          err.response?.data?.mensaje ||
            "No se pudo conectar con el servidor para consultar los reclamos."
        );
      } finally {
        if (isMountedRef.current && currentReqId === reqIdRef.current) {
          setLoading(false);
        }
      }
    },
    [filtroEstado, debouncedBusqueda, filtroCiudad, filtroCategoria, filtroInstitucion, filtroAnomalia]
  );

  // Cargar instituciones verificadas para reasignación
  const cargarInstituciones = async () => {
    if (instituciones.length > 0) return;
    setLoadingInstituciones(true);
    try {
      const res = await apiClient.get("/admin/instituciones?estado=verificada");
      if (isMountedRef.current && res.data?.ok) {
        setInstituciones(res.data.data || []);
      }
    } catch {
      toast.error("Error al cargar lista de instituciones para reasignar.");
    } finally {
      if (isMountedRef.current) {
        setLoadingInstituciones(false);
      }
    }
  };

  // Efecto inicial para catálogos
  useEffect(() => {
    fetchCatalogosFiltros();
  }, [fetchCatalogosFiltros]);

  // Efecto para cambios en ciudad o filtros
  useEffect(() => {
    if (!filtroCiudad) {
      setReclamos([]);
      return;
    }
    setPagina(1);
    fetchReclamos(
      1,
      filtroEstado,
      debouncedBusqueda,
      filtroCiudad,
      filtroCategoria,
      filtroInstitucion,
      filtroAnomalia
    );
    fetchStats(filtroCiudad);
  }, [
    filtroCiudad,
    debouncedBusqueda,
    filtroEstado,
    filtroCategoria,
    filtroInstitucion,
    filtroAnomalia,
    fetchReclamos,
    fetchStats,
  ]);

  const handleCambiarPagina = (nuevaPag) => {
    const clamped = Math.max(1, Math.min(nuevaPag, totalPag));
    setPagina(clamped);
    fetchReclamos(clamped, filtroEstado, debouncedBusqueda, filtroCiudad);
  };

  const abrirDetalle = async (id) => {
    try {
      const res = await apiClient.get(`/admin/reclamos/${id}`);
      if (isMountedRef.current && res.data?.ok) {
        setDetalle(res.data.data);
      } else if (isMountedRef.current) {
        toast.error(res.data?.mensaje || "Error al cargar el detalle del reclamo.");
      }
    } catch (err) {
      if (isMountedRef.current) {
        toast.error(err.response?.data?.mensaje || "No se pudo consultar el detalle.");
      }
    }
  };

  const abrirReasignar = async (rec) => {
    setModalReasignar(rec);
    setInstitucionDestino("");
    setMotivoReasignacion("");
    setErrorReasignacion("");
    await cargarInstituciones();
  };

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
        if (isMountedRef.current) {
          setModalReasignar(null);
        }
        if (detalle && detalle.id === recId) {
          await abrirDetalle(recId);
        }
        await fetchReclamos(pagina, filtroEstado, debouncedBusqueda, filtroCiudad);
        await fetchStats(filtroCiudad);
      } else if (isMountedRef.current) {
        setErrorReasignacion(res.data?.mensaje || "Error al reasignar institución.");
      }
    } catch (err) {
      if (isMountedRef.current) {
        setErrorReasignacion(
          err.response?.data?.mensaje || "Error al procesar la reasignación."
        );
      }
    } finally {
      if (isMountedRef.current) {
        setGuardandoReasignacion(false);
      }
    }
  };

  const ciudadActual = ciudadesCatalogo.find(
    (c) => String(c.id_ciudad ?? c.id) === String(filtroCiudad)
  );

  return (
    <div className="w-full space-y-6">
      {/* VISTA 1: SI NO HAY CIUDAD SELECCIONADA -> SELECTOR TERRITORIAL */}
      {!filtroCiudad ? (
        <>
          <PageHeader
            title="Supervisión Territorial de Reclamos"
            description="Seleccioná una localidad para supervisar, filtrar y auditar los reclamos territoriales."
            action={
              <Button
                onClick={() => fetchCatalogosFiltros()}
                variant="outline"
                leftIcon={<RefreshCw size={16} className={loadingCiudades ? "animate-spin" : ""} />}
              >
                Actualizar
              </Button>
            }
          />

          <ReclamoCiudadSelector
            ciudades={ciudadesCatalogo}
            loading={loadingCiudades}
            onSelectCiudad={(id) => setFiltroCiudad(id)}
          />
        </>
      ) : (
        /* VISTA 2: CIUDAD SELECCIONADA -> GESTIÓN DE RECLAMOS DE ESA CIUDAD */
        <>
          {/* Banner de Localidad Activa con botón para cambiar ciudad */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltroCiudad("")}
                leftIcon={<ArrowLeft size={15} />}
              >
                Cambiar localidad
              </Button>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-text-primary truncate m-0 flex items-center gap-2">
                  <MapPin size={16} className="text-primary shrink-0" />
                  {ciudadActual ? ciudadActual.nombre : `Localidad #${filtroCiudad}`}
                </h2>
                <p className="text-xs text-text-muted m-0 truncate">
                  {ciudadActual?.provincia ? `${ciudadActual.provincia} • ` : ""}
                  {ciudadActual?.institucion_principal_nombre
                    ? `Institución Principal: ${ciudadActual.institucion_principal_nombre}`
                    : "Sin institución principal"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => {
                  fetchReclamos(pagina, filtroEstado, debouncedBusqueda, filtroCiudad);
                  fetchStats(filtroCiudad);
                }}
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
              >
                Actualizar
              </Button>
            </div>
          </div>

          {/* Tarjetas KPI de Estado para la Ciudad */}
          <ReclamoStatsCards
            stats={stats}
            loading={loadingStats}
            filtroEstado={filtroEstado}
            onFiltroEstadoChange={setFiltroEstado}
            filtroAnomalia={filtroAnomalia}
            onFiltroAnomaliaChange={setFiltroAnomalia}
          />

          {/* Filtros para la Ciudad */}
          <ReclamoFilterBar
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            onLimpiarBusqueda={() => setBusqueda("")}
            filtroEstado={filtroEstado}
            onFiltroEstadoChange={setFiltroEstado}
            filtroCiudad={filtroCiudad}
            onFiltroCiudadChange={setFiltroCiudad}
            ciudades={ciudadesCatalogo}
            filtroCategoria={filtroCategoria}
            onFiltroCategoriaChange={setFiltroCategoria}
            categorias={categoriasCatalogo}
            filtroInstitucion={filtroInstitucion}
            onFiltroInstitucionChange={setFiltroInstitucion}
            instituciones={instituciones.filter(
              (i) => !i.id_ciudad || String(i.id_ciudad) === String(filtroCiudad)
            )}
            filtroAnomalia={filtroAnomalia}
            onFiltroAnomaliaChange={setFiltroAnomalia}
            onLimpiarTodo={() => {
              setBusqueda("");
              setFiltroEstado("");
              setFiltroCategoria("");
              setFiltroInstitucion("");
              setFiltroAnomalia(false);
            }}
            totalResultados={reclamos.length}
            totalGeneral={total}
          />

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold m-0">Error en la consulta</p>
                <p className="text-xs mt-1 m-0">{error}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchReclamos(pagina, filtroEstado, debouncedBusqueda, filtroCiudad)}
              >
                Reintentar
              </Button>
            </div>
          )}

          <ReclamoTable
            reclamos={reclamos}
            loading={loading}
            pagina={pagina}
            totalPaginas={totalPag}
            onCambiarPagina={handleCambiarPagina}
            onVerDetalle={abrirDetalle}
            onReasignar={abrirReasignar}
          />
        </>
      )}

      {/* Modales Compartidos */}
      <ReclamoDetailModal
        isOpen={Boolean(detalle)}
        onClose={() => setDetalle(null)}
        detalle={detalle}
        onAbrirReasignar={(d) => abrirReasignar(d)}
      />

      <ReclamoReassignModal
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

export default function AdminReclamosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-muted text-sm">Cargando supervisión...</div>}>
      <AdminReclamosContent />
    </Suspense>
  );
}
