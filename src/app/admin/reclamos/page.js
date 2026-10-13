"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import ClaimTracking from "@/components/reclamos/ClaimTracking";
import { getCategoryIcon } from "@/components/brand/icons";
import { CLAIM_STATUSES } from "@/utils/claimStatus";
import { tiempoRelativo, formatearFecha } from "@/utils/dateFormatters";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import {
  Search,
  X,
  Filter,
  Building2,
  MapPin,
  Clock,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  ArrowRightLeft,
  Eye,
  FileText,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Inbox,
  AlertCircle,
} from "lucide-react";

const ESTADOS_FILTRO = [
  { key: "", label: "Todos los estados" },
  ...CLAIM_STATUSES.map((s) => ({ key: s, label: s })),
];

export default function AdminReclamosPage() {
  const router = useRouter();

  // Estados principales de lista y paginación
  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPag, setTotalPag] = useState(1);
  const [pagina, setPagina] = useState(1);

  // Filtros y búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const searchTimeoutRef = useRef(null);

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
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [modalReasignar, setModalReasignar] = useState(null); // Reclamo a reasignar
  const [instituciones, setInstituciones] = useState([]);
  const [loadingInstituciones, setLoadingInstituciones] = useState(false);
  const [institucionDestino, setInstitucionDestino] = useState("");
  const [motivoReasignacion, setMotivoReasignacion] = useState("");
  const [errorReasignacion, setErrorReasignacion] = useState("");
  const [guardandoReasignacion, setGuardandoReasignacion] = useState(false);

  // Cargar estadísticas
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await apiClient.get("/admin/reclamos/stats");
      if (res.data?.ok) {
        setStats(res.data.data);
      }
    } catch {
      // stats fallback
    } finally {
      setLoadingStats(false);
    }
  };

  // Cargar reclamos paginados
  const fetchReclamos = useCallback(async (page = pagina, estado = filtroEstado, search = busqueda) => {
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
  }, [pagina, filtroEstado, busqueda]);

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

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReclamos(pagina, filtroEstado, busqueda);
  }, [pagina, filtroEstado]);

  // Manejo de búsqueda con debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setBusqueda(val);
    setPagina(1);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchReclamos(1, filtroEstado, val);
    }, 350);
  };

  const handleClearSearch = () => {
    setBusqueda("");
    setPagina(1);
    fetchReclamos(1, filtroEstado, "");
  };

  // Abrir detalle completo
  const abrirDetalle = async (id) => {
    setLoadingDetalle(true);
    try {
      const res = await apiClient.get(`/admin/reclamos/${id}`);
      if (res.data?.ok) {
        setDetalle(res.data.data);
      } else {
        toast.error(res.data?.mensaje || "Error al cargar el detalle del reclamo.");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "No se pudo consultar el detalle.");
    } finally {
      setLoadingDetalle(false);
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
        // Si el detalle estaba abierto con este reclamo, refrescarlo
        if (detalle && detalle.id === recId) {
          await abrirDetalle(recId);
        }
        await fetchReclamos(pagina, filtroEstado, busqueda);
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

  // Filtrado territorial para instituciones elegibles
  const institucionesElegibles = modalReasignar
    ? instituciones.filter(
        (inst) =>
          Number(inst.id_ciudad) === Number(modalReasignar.id_ciudad) &&
          Number(inst.id) !== Number(modalReasignar.id_institucion)
      )
    : [];

  return (
    <div className="w-full space-y-6">
      {/* Encabezado */}
      <PageHeader
        title="Supervisión de Reclamos"
        description="Supervisión global de reclamos ciudadanos, auditoría de eventos y reasignación institucional territorial."
        action={
          <Button
            onClick={() => {
              fetchReclamos(pagina, filtroEstado, busqueda);
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs">
          <p className="text-xs font-semibold text-text-muted m-0">Total Reclamos</p>
          <h3 className="text-2xl font-black text-text-primary mt-1 m-0">
            {loadingStats ? <Loader2 size={18} className="animate-spin text-text-muted" /> : stats.total}
          </h3>
          <p className="text-[11px] text-text-secondary mt-1 m-0">Reportes registrados</p>
        </div>

        <div
          onClick={() => {
            setFiltroEstado(filtroEstado === "Pendiente" ? "" : "Pendiente");
            setPagina(1);
          }}
          className={`p-4 rounded-2xl bg-surface border shadow-xs cursor-pointer transition-all hover:border-amber-400 ${
            filtroEstado === "Pendiente" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-border-subtle"
          }`}
          title="Click para filtrar Pendientes"
        >
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 m-0">Pendientes</p>
          <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 m-0">
            {loadingStats ? <Loader2 size={18} className="animate-spin text-text-muted" /> : stats.pendientes}
          </h3>
          <p className="text-[11px] text-text-secondary mt-1 m-0">Sin iniciar gestión</p>
        </div>

        <div
          onClick={() => {
            setFiltroEstado(filtroEstado === "En proceso" ? "" : "En proceso");
            setPagina(1);
          }}
          className={`p-4 rounded-2xl bg-surface border shadow-xs cursor-pointer transition-all hover:border-sky-400 ${
            filtroEstado === "En proceso" ? "border-sky-500 ring-2 ring-sky-500/20" : "border-border-subtle"
          }`}
          title="Click para filtrar En proceso"
        >
          <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 m-0">En Proceso</p>
          <h3 className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1 m-0">
            {loadingStats ? (
              <Loader2 size={18} className="animate-spin text-text-muted" />
            ) : (
              (stats.enProceso || 0) + (stats.enRevision || 0)
            )}
          </h3>
          <p className="text-[11px] text-text-secondary mt-1 m-0">Con intervención activa</p>
        </div>

        <div
          onClick={() => {
            setFiltroEstado(filtroEstado === "Resuelto" ? "" : "Resuelto");
            setPagina(1);
          }}
          className={`p-4 rounded-2xl bg-surface border shadow-xs cursor-pointer transition-all hover:border-emerald-400 ${
            filtroEstado === "Resuelto" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-border-subtle"
          }`}
          title="Click para filtrar Resueltos"
        >
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 m-0">Resueltos</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 m-0">
            {loadingStats ? <Loader2 size={18} className="animate-spin text-text-muted" /> : stats.resueltos}
          </h3>
          <p className="text-[11px] text-text-secondary mt-1 m-0">Completados con éxito</p>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="bg-surface rounded-2xl border border-border-subtle p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar por ID, título, dirección, autor o institución..."
              value={busqueda}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-border-subtle bg-surface text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-hidden transition-all"
            />
            {busqueda && (
              <button
                onClick={handleClearSearch}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded-full cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filtro por estado */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-muted shrink-0 hidden sm:block" />
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPagina(1);
              }}
              className="py-2 px-3 text-xs sm:text-sm rounded-xl border border-border-subtle bg-surface text-text-primary focus:border-primary outline-hidden transition-all cursor-pointer"
            >
              {ESTADOS_FILTRO.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>

            {(busqueda || filtroEstado) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBusqueda("");
                  setFiltroEstado("");
                  setPagina(1);
                  fetchReclamos(1, "", "");
                }}
                className="text-xs text-text-secondary"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Resumen de resultados */}
        <div className="text-[12px] text-text-muted flex items-center justify-between pt-1">
          <span>
            Mostrando <strong>{reclamos.length}</strong> de <strong>{total}</strong> reclamos registrados
          </span>
          {filtroEstado && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium text-[11px]">
              Filtro activo: {filtroEstado}
            </span>
          )}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold m-0">Error en la consulta</p>
            <p className="text-xs mt-1 m-0">{error}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => fetchReclamos(pagina, filtroEstado, busqueda)}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Contenedor de la Tabla */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-text-muted gap-3">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-sm m-0">Cargando reclamos de la plataforma...</p>
          </div>
        ) : reclamos.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center mx-auto mb-3 text-text-muted">
              <Inbox size={24} />
            </div>
            <h4 className="text-base font-bold text-text-primary m-0">No se encontraron reclamos</h4>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              No hay reportes que coincidan con los criterios de búsqueda o filtros seleccionados.
            </p>
          </div>
        ) : (
          <>
            {/* Tabla para Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border-subtle text-text-secondary font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Reclamo / Ubicación</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Institución Responsable</th>
                    <th className="py-3 px-4">Autor / Fecha</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {reclamos.map((r) => {
                    const CatIcon = getCategoryIcon(r.categoriaCodigo || r.categoriaNombre, r.categoriaNombre);
                    return (
                      <tr key={r.id} className="hover:bg-surface-subtle/50 transition-colors">
                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-text-muted whitespace-nowrap">
                          #{String(r.id).padStart(4, "0")}
                        </td>

                        {/* Título y Dirección */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-semibold text-text-primary line-clamp-1 m-0">
                            {r.titulo}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mt-1">
                            <MapPin size={12} className="shrink-0 text-text-muted" />
                            <span className="truncate">{r.direccion || "Sin dirección especificada"}</span>
                          </div>
                        </td>

                        {/* Categoría */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-subtle border border-border-subtle text-text-primary text-xs font-medium">
                            <CatIcon size={14} className="text-primary shrink-0" />
                            <span>{r.categoriaNombre || "General"}</span>
                          </div>
                        </td>

                        {/* Institución */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {r.institucionNombre ? (
                            <div className="flex items-center gap-1.5 text-xs text-text-primary">
                              <Building2 size={13} className="text-text-muted shrink-0" />
                              <span className="font-medium truncate max-w-[180px]">
                                {r.institucionNombre}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/40">
                              <AlertTriangle size={11} /> Sin asignar
                            </span>
                          )}
                        </td>

                        {/* Autor y Fecha */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-text-secondary">
                          <p className="m-0 text-text-primary font-medium truncate max-w-[150px]">
                            {r.autorNombre || "Ciudadano"}
                          </p>
                          <p className="m-0 text-[11px] text-text-muted mt-0.5">
                            {tiempoRelativo(r.fecha_creacion)}
                          </p>
                        </td>

                        {/* Estado */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <ClaimStatusBadge estado={r.estado} />
                        </td>

                        {/* Acciones */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirDetalle(r.id)}
                              leftIcon={<Eye size={14} />}
                              title="Ver detalle e historial"
                            >
                              Detalle
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => abrirReasignar(r)}
                              leftIcon={<ArrowRightLeft size={14} />}
                              className="text-primary hover:bg-primary-subtle"
                              title="Reasignar a otra institución"
                            >
                              Reasignar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tarjetas Mobile */}
            <div className="md:hidden divide-y divide-border-subtle">
              {reclamos.map((r) => {
                const CatIcon = getCategoryIcon(r.categoriaCodigo || r.categoriaNombre, r.categoriaNombre);
                return (
                  <div key={r.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-text-muted">
                        #{String(r.id).padStart(4, "0")}
                      </span>
                      <ClaimStatusBadge estado={r.estado} />
                    </div>

                    <h4 className="font-semibold text-text-primary text-sm m-0">
                      {r.titulo}
                    </h4>

                    <div className="space-y-1.5 text-xs text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <CatIcon size={13} className="text-primary shrink-0" />
                        <span>{r.categoriaNombre || "General"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-text-muted shrink-0" />
                        <span className="truncate">{r.direccion || "Sin dirección"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-text-muted shrink-0" />
                        <span>{r.institucionNombre || "Sin asignar"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                        <User size={12} className="shrink-0" />
                        <span>{r.autorNombre || "Ciudadano"} · {tiempoRelativo(r.fecha_creacion)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirDetalle(r.id)}
                        leftIcon={<Eye size={14} />}
                      >
                        Ver Detalle
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => abrirReasignar(r)}
                        leftIcon={<ArrowRightLeft size={14} />}
                        className="text-primary"
                      >
                        Reasignar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginador */}
            {totalPag > 1 && (
              <div className="p-4 border-t border-border-subtle flex items-center justify-between gap-4 text-xs">
                <span className="text-text-muted">
                  Página <strong>{pagina}</strong> de <strong>{totalPag}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagina <= 1}
                    onClick={() => setPagina((p) => Math.max(p - 1, 1))}
                    leftIcon={<ChevronLeft size={14} />}
                  >
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagina >= totalPag}
                    onClick={() => setPagina((p) => Math.min(p + 1, totalPag))}
                    rightIcon={<ChevronRight size={14} />}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL 1: DETALLE COMPLETO Y SUPERVISIÓN */}
      <Modal
        isOpen={Boolean(detalle)}
        onClose={() => setDetalle(null)}
        title={detalle ? `Supervisión Reclamo #${String(detalle.id).padStart(4, "0")}` : ""}
        description="Ficha técnica, trazabilidad y registro histórico de auditoría."
        icon={<FileText size={20} />}
        iconBgClass="bg-primary/10 text-primary"
        maxWidth="lg"
      >
        {detalle && (
          <div className="space-y-5">
            {/* Aviso informativo de supervisión administrativa */}
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle flex items-start gap-2.5 text-xs text-text-secondary">
              <ShieldAlert size={16} className="text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-text-primary block font-medium">
                  Supervisión y Gobernanza Administrativa
                </strong>
                El panel de administración tiene facultades de control y reasignación territorial. La actualización de estados operativos corresponde exclusivamente a la institución responsable designada.
              </div>
            </div>

            {/* Encabezado y Estado actual */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface border border-border-subtle">
              <div>
                <div className="flex items-center gap-2">
                  <ClaimStatusBadge estado={detalle.estado} />
                  <ClaimTracking reclamo={detalle} advertir={true} />
                </div>
                <h3 className="text-base font-bold text-text-primary mt-2 m-0">
                  {detalle.titulo}
                </h3>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  abrirReasignar(detalle);
                }}
                leftIcon={<ArrowRightLeft size={14} />}
              >
                Reasignar
              </Button>
            </div>

            {/* Descripción */}
            {detalle.descripcion && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Descripción del reporte
                </span>
                <p className="text-xs sm:text-sm text-text-primary bg-surface p-3 rounded-xl border border-border-subtle whitespace-pre-line m-0 leading-relaxed">
                  {detalle.descripcion}
                </p>
              </div>
            )}

            {/* Metadatos en cuadrícula */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-border-subtle bg-surface space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Tag size={12} className="text-primary" /> Categoría
                </span>
                <p className="font-medium text-text-primary m-0">
                  {detalle.categoriaNombre || "General"}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-border-subtle bg-surface space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Building2 size={12} className="text-primary" /> Institución Responsable
                </span>
                <p className="font-medium text-text-primary m-0">
                  {detalle.institucionNombre || "Sin asignar"}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-border-subtle bg-surface space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <MapPin size={12} className="text-primary" /> Ubicación y Ciudad
                </span>
                <p className="font-medium text-text-primary m-0">
                  {detalle.direccion || "Sin dirección"}
                  {detalle.ciudadNombre ? ` · ${detalle.ciudadNombre}` : ""}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-border-subtle bg-surface space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <User size={12} className="text-primary" /> Autor del Reclamo
                </span>
                <p className="font-medium text-text-primary m-0">
                  {detalle.autorNombre || "Ciudadano"}
                </p>
                <p className="text-[11px] text-text-muted m-0">
                  Registrado el {formatearFecha(detalle.fecha_creacion)}
                </p>
              </div>
            </div>

            {/* Historial de Auditoría */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 m-0">
                <Clock size={13} className="text-primary" />
                Historial de Cambios y Auditoría
              </h4>

              {(!detalle.historial || detalle.historial.length === 0) ? (
                <p className="text-xs text-text-muted italic bg-surface-subtle p-3 rounded-xl border border-border-subtle">
                  No se registran eventos históricos adicionales para este reclamo.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {detalle.historial.map((h, idx) => (
                    <div
                      key={h.id || idx}
                      className="p-3 rounded-xl bg-surface border border-border-subtle flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-primary uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded-md bg-surface-subtle border border-border-subtle">
                            {h.tipo_evento || "EVENTO"}
                          </span>
                          {h.estado_nuevo && (
                            <span className="text-[11px] text-text-secondary">
                              Estado: <strong>{h.estado_nuevo}</strong>
                            </span>
                          )}
                        </div>
                        <p className="text-text-primary m-0 mt-1">{h.detalle}</p>
                        <p className="text-[11px] text-text-muted m-0">
                          Por: {h.autorNombre || "Sistema / Administrador"}
                        </p>
                      </div>
                      <span className="text-[11px] text-text-muted whitespace-nowrap shrink-0">
                        {formatearFecha(h.fecha_creacion)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Acciones del Modal */}
            <div className="pt-4 border-t border-border-subtle flex justify-end">
              <Button variant="outline" onClick={() => setDetalle(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: REASIGNACIÓN AUDITADA */}
      <Modal
        isOpen={Boolean(modalReasignar)}
        onClose={() => setModalReasignar(null)}
        title="Reasignar Institución Responsable"
        description="Transferí la responsabilidad técnica de este reclamo respetando la jurisdicción territorial."
        icon={<ArrowRightLeft size={20} />}
        iconBgClass="bg-primary/10 text-primary"
        maxWidth="md"
      >
        {modalReasignar && (
          <div className="space-y-4">
            {/* Ficha resumen del reclamo */}
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-text-muted">
                  #{String(modalReasignar.id).padStart(4, "0")}
                </span>
                <span className="text-[11px] font-medium text-text-secondary">
                  Jurisdicción: <strong>{modalReasignar.ciudadNombre || "Misma Ciudad"}</strong>
                </span>
              </div>
              <p className="font-semibold text-text-primary text-sm m-0 line-clamp-1">
                {modalReasignar.titulo}
              </p>
              <p className="text-text-secondary m-0">
                Institución actual: <strong>{modalReasignar.institucionNombre || "Sin asignar"}</strong>
              </p>
            </div>

            {/* Selector de nueva institución */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                Nueva Institución Responsable *
              </label>

              {loadingInstituciones ? (
                <div className="flex items-center gap-2 py-2 text-xs text-text-muted">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  <span>Cargando instituciones elegibles...</span>
                </div>
              ) : institucionesElegibles.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span>
                    No existen otras instituciones verificadas registradas en la misma ciudad para reasignar este reclamo.
                  </span>
                </div>
              ) : (
                <select
                  value={institucionDestino}
                  onChange={(e) => setInstitucionDestino(e.target.value)}
                  className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-border-subtle bg-surface text-text-primary focus:border-primary outline-hidden"
                >
                  <option value="">Seleccionar institución destino...</option>
                  {institucionesElegibles.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Motivo obligatorio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                Motivo de la Reasignación *
              </label>
              <textarea
                rows={3}
                placeholder="Explicá el motivo técnico o administrativo de la reasignación (obligatorio para auditoría)..."
                value={motivoReasignacion}
                onChange={(e) => setMotivoReasignacion(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-border-subtle bg-surface text-text-primary focus:border-primary outline-hidden resize-y"
              />
              <p className="text-[11px] text-text-muted mt-1 m-0">
                Este motivo quedará asentado de forma indeleble en el historial de eventos del reclamo.
              </p>
            </div>

            {/* Error de validación */}
            {errorReasignacion && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs font-medium">
                ⚠ {errorReasignacion}
              </div>
            )}

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
              <Button
                variant="outline"
                onClick={() => setModalReasignar(null)}
                disabled={guardandoReasignacion}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmarReasignacion}
                loading={guardandoReasignacion}
                disabled={institucionesElegibles.length === 0 || !institucionDestino}
                leftIcon={<ArrowRightLeft size={15} />}
              >
                Confirmar reasignación
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}