"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Inbox,
  Search,
  X,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
} from "lucide-react";
import apiClient from "@/services/apiClient";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import { formatearFecha } from "@/utils/dateFormatters";

export default function InstitutionTable() {
  const [instituciones, setInstituciones] = useState([]);
  const [stats, setStats] = useState({ total: 0, verificadas: 0, pendientes: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState("");

  // Búsqueda, filtros y paginación
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Modales
  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalAprobar, setModalAprobar] = useState(null);
  const [modalRechazar, setModalRechazar] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [motivoError, setMotivoError] = useState("");
  const [procesando, setProcesando] = useState(false);

  // Ref para debounce de búsqueda
  const searchTimeoutRef = useRef(null);

  // Cargar estadísticas
  const cargarStats = async () => {
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
  };

  // Cargar instituciones según filtros y página
  const cargarInstituciones = async (p = pagina, search = busqueda, estado = filtroEstado) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (estado !== "todos") params.append("estado", estado);
      if (search.trim()) params.append("busqueda", search.trim());
      params.append("pagina", p);
      params.append("limite", "15");

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
  };

  useEffect(() => {
    cargarStats();
    cargarInstituciones(1, busqueda, filtroEstado);
  }, [filtroEstado]);

  // Manejador de búsqueda con debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setBusqueda(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setPagina(1);
      cargarInstituciones(1, val, filtroEstado);
    }, 350);
  };

  const handleClearSearch = () => {
    setBusqueda("");
    setPagina(1);
    cargarInstituciones(1, "", filtroEstado);
  };

  const handleCambiarPagina = (nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas || nuevaPagina === pagina) return;
    setPagina(nuevaPagina);
    cargarInstituciones(nuevaPagina, busqueda, filtroEstado);
  };

  // Acción: Aprobar institución
  const handleAprobar = async () => {
    if (!modalAprobar) return;
    setProcesando(true);
    try {
      const res = await apiClient.put(`/admin/instituciones/${modalAprobar.id}/verificar`);
      if (res.data?.ok) {
        toast.success(`Institución "${modalAprobar.nombre}" verificada correctamente.`);
        setModalAprobar(null);
        if (modalDetalle?.id === modalAprobar.id) {
          setModalDetalle((prev) => (prev ? { ...prev, verificada: 1, fecha_verificacion: new Date().toISOString() } : null));
        }
        await cargarInstituciones();
        await cargarStats();
      } else {
        toast.error(res.data?.mensaje || "Error al verificar la institución.");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al procesar la verificación.");
    } finally {
      setProcesando(false);
    }
  };

  // Acción: Rechazar institución
  const handleRechazar = async () => {
    if (!modalRechazar) return;
    if (!motivoRechazo.trim()) {
      setMotivoError("El motivo de rechazo es obligatorio para notificar a la entidad.");
      return;
    }

    setProcesando(true);
    try {
      const res = await apiClient.put(`/admin/instituciones/${modalRechazar.id}/rechazar`, {
        motivo: motivoRechazo.trim(),
      });
      if (res.data?.ok) {
        toast.success(`Solicitud de "${modalRechazar.nombre}" rechazada correctamente.`);
        setModalRechazar(null);
        setMotivoRechazo("");
        setMotivoError("");
        if (modalDetalle?.id === modalRechazar.id) {
          setModalDetalle((prev) => (prev ? { ...prev, verificada: 0, fecha_verificacion: null } : null));
        }
        await cargarInstituciones();
        await cargarStats();
      } else {
        toast.error(res.data?.mensaje || "Error al rechazar la institución.");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al procesar el rechazo.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Tarjetas de Métricas Institucionales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border-subtle shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted m-0">Total Instituciones</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 m-0">
              {loadingStats ? <Loader2 size={20} className="animate-spin text-text-muted mt-1" /> : stats.total}
            </h3>
            <p className="text-[11px] text-text-secondary mt-1 m-0">Entidades registradas en el sistema</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Building2 size={24} />
          </div>
        </div>

        {/* Verificadas */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border-subtle shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted m-0">Verificadas</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 m-0">
              {loadingStats ? <Loader2 size={20} className="animate-spin text-text-muted mt-1" /> : stats.verificadas}
            </h3>
            <p className="text-[11px] text-text-secondary mt-1 m-0">Operativas y validadas</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Pendientes */}
        <div
          onClick={() => setFiltroEstado(filtroEstado === "pendiente" ? "todos" : "pendiente")}
          className={`p-4 sm:p-5 rounded-2xl bg-surface border shadow-xs flex items-center justify-between cursor-pointer transition-all hover:border-amber-400 ${
            filtroEstado === "pendiente" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-border-subtle"
          }`}
          title="Click para filtrar solo pendientes"
        >
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 m-0 flex items-center gap-1.5">
              <span>Pendientes de Validación</span>
              {stats.pendientes > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </p>
            <h3 className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 m-0">
              {loadingStats ? <Loader2 size={20} className="animate-spin text-text-muted mt-1" /> : stats.pendientes}
            </h3>
            <p className="text-[11px] text-text-secondary mt-1 m-0">
              Requieren revisión en{" "}
              <Link
                href="/admin/solicitudes"
                onClick={(e) => e.stopPropagation()}
                className="text-primary hover:underline font-semibold"
              >
                Solicitudes
              </Link>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Inbox size={24} />
          </div>
        </div>
      </div>

      {/* 2. Barra de Búsqueda, Filtros y Actualización */}
      <div className="p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={handleSearchChange}
            placeholder="Buscar por nombre, email, tipo, ciudad o dirección..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:bg-surface focus:border-primary outline-hidden transition-all"
          />
          {busqueda && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
              title="Limpiar búsqueda"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtro por estado y botón actualizar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPagina(1);
              }}
              className="appearance-none pl-8 pr-8 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-semibold text-text-primary focus:bg-surface focus:border-primary outline-hidden cursor-pointer transition-all"
            >
              <option value="todos">Estado: Todos</option>
              <option value="verificada">Verificadas</option>
              <option value="pendiente">Pendientes de revisión</option>
            </select>
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>

          <Button
            onClick={() => {
              cargarStats();
              cargarInstituciones(pagina, busqueda, filtroEstado);
            }}
            variant="outline"
            size="sm"
            loading={loading}
            leftIcon={<RefreshCw size={13} />}
            title="Actualizar listado"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* 3. Contenedor de la Tabla */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        {/* Estado: Error */}
        {error && (
          <div className="p-6 text-center space-y-2">
            <p className="text-xs text-rose-600 font-semibold m-0">{error}</p>
            <Button
              onClick={() => cargarInstituciones(pagina, busqueda, filtroEstado)}
              variant="outline"
              size="sm"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Estado: Cargando */}
        {loading && !error && (
          <div className="py-20 flex flex-col items-center justify-center text-text-muted text-xs gap-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span>Consultando instituciones registradas...</span>
          </div>
        )}

        {/* Estado: Vacío */}
        {!loading && !error && instituciones.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-text-muted mb-3">
              <Building2 size={24} />
            </div>
            <h4 className="text-sm font-bold text-text-primary m-0">No se encontraron instituciones</h4>
            <p className="text-xs text-text-muted mt-1 max-w-sm m-0">
              {busqueda || filtroEstado !== "todos"
                ? "No hay resultados para los criterios de búsqueda y filtros seleccionados."
                : "No hay instituciones registradas en la base de datos."}
            </p>
            {(busqueda || filtroEstado !== "todos") && (
              <Button
                onClick={() => {
                  setBusqueda("");
                  setFiltroEstado("todos");
                  setPagina(1);
                  cargarInstituciones(1, "", "todos");
                }}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}

        {/* Tabla de Resultados */}
        {!loading && !error && instituciones.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Institución</th>
                  <th className="py-3 px-4">Ciudad / Territorio</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {instituciones.map((inst) => {
                  const esVerificada = Boolean(inst.verificada);
                  return (
                    <tr key={inst.id} className="hover:bg-surface-subtle/50 transition-colors">
                      {/* Institución */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {inst.foto_perfil ? (
                            <img
                              src={inst.foto_perfil}
                              alt={inst.nombre}
                              className="w-9 h-9 rounded-xl object-cover border border-border-subtle shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 font-bold">
                              <Building2 size={18} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-text-primary m-0 truncate">
                              {inst.nombre}
                            </p>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-subtle border border-border-subtle text-text-secondary capitalize">
                              {inst.tipo || "Institución"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Ciudad / Territorio */}
                      <td className="py-3.5 px-4 text-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-text-muted shrink-0" />
                          <span>
                            {inst.ciudad_nombre
                              ? `${inst.ciudad_nombre}${inst.provincia ? `, ${inst.provincia}` : ""}`
                              : "Sin ciudad asignada"}
                          </span>
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <Mail size={13} className="text-text-muted shrink-0" />
                          <span className="truncate">{inst.email || "Sin email"}</span>
                        </div>
                        {inst.telefono && (
                          <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                            <Phone size={12} className="shrink-0" />
                            <span>{inst.telefono}</span>
                          </div>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4">
                        {esVerificada ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Verificada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pendiente
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            onClick={() => setModalDetalle(inst)}
                            variant="outline"
                            size="sm"
                            leftIcon={<Eye size={13} />}
                            title="Ver detalles completos de la institución"
                          >
                            Detalle
                          </Button>

                          {!esVerificada && (
                            <>
                              <Button
                                onClick={() => setModalAprobar(inst)}
                                variant="success"
                                size="sm"
                                leftIcon={<CheckCircle2 size={13} />}
                                title="Aprobar y verificar institución"
                              >
                                Verificar
                              </Button>
                              <Button
                                onClick={() => {
                                  setModalRechazar(inst);
                                  setMotivoRechazo("");
                                  setMotivoError("");
                                }}
                                variant="danger-soft"
                                size="sm"
                                leftIcon={<XCircle size={13} />}
                                title="Rechazar solicitud con motivo"
                              >
                                Rechazar
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Barra de Paginación */}
        {!loading && !error && totalRegistros > 0 && (
          <div className="p-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
            <span>
              Mostrando {instituciones.length} de {totalRegistros} instituciones
            </span>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-secondary">
                Página {pagina} de {totalPaginas}
              </span>
              <div className="inline-flex items-center gap-1">
                <button
                  onClick={() => handleCambiarPagina(pagina - 1)}
                  disabled={pagina <= 1}
                  className="p-1.5 rounded-lg border border-border-subtle text-text-primary hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Página anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => handleCambiarPagina(pagina + 1)}
                  disabled={pagina >= totalPaginas}
                  className="p-1.5 rounded-lg border border-border-subtle text-text-primary hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Página siguiente"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Modal de Detalle Completo */}
      {modalDetalle && (
        <Modal
          isOpen={true}
          onClose={() => setModalDetalle(null)}
          title="Ficha Institucional"
          description={`Detalles completos y estado operativo de ${modalDetalle.nombre}`}
          icon={<Building2 size={20} />}
          maxWidth="md"
        >
          <div className="space-y-5">
            {/* Cabecera del detalle */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-subtle border border-border-subtle">
              {modalDetalle.foto_perfil ? (
                <img
                  src={modalDetalle.foto_perfil}
                  alt={modalDetalle.nombre}
                  className="w-14 h-14 rounded-xl object-cover border border-border-subtle shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Building2 size={28} />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-base font-bold text-text-primary m-0 truncate">
                  {modalDetalle.nombre}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface border border-border-subtle text-text-secondary uppercase tracking-wider">
                    {modalDetalle.tipo || "Institución"}
                  </span>
                  {modalDetalle.verificada ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                      Verificada
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                      Pendiente de Verificación
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Grilla de información */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border-subtle">
                <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  Ciudad / Territorio
                </span>
                <p className="font-semibold text-text-primary m-0 flex items-center gap-1.5">
                  <MapPin size={13} className="text-text-muted" />
                  {modalDetalle.ciudad_nombre
                    ? `${modalDetalle.ciudad_nombre}${modalDetalle.provincia ? `, ${modalDetalle.provincia}` : ""}`
                    : "No asignada"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-subtle">
                <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  Dirección
                </span>
                <p className="font-semibold text-text-primary m-0">
                  {modalDetalle.direccion || "No especificada"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-subtle">
                <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  Correo Electrónico
                </span>
                <p className="font-semibold text-text-primary m-0 flex items-center gap-1.5 truncate">
                  <Mail size={13} className="text-text-muted shrink-0" />
                  {modalDetalle.email || "Sin email"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-subtle">
                <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  Teléfono de Contacto
                </span>
                <p className="font-semibold text-text-primary m-0 flex items-center gap-1.5">
                  <Phone size={13} className="text-text-muted shrink-0" />
                  {modalDetalle.telefono || "No especificado"}
                </p>
              </div>

              {modalDetalle.fecha_verificacion && (
                <div className="p-3 rounded-xl bg-surface border border-border-subtle sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                    Fecha de Verificación
                  </span>
                  <p className="font-semibold text-text-primary m-0 flex items-center gap-1.5">
                    <Calendar size={13} className="text-text-muted shrink-0" />
                    {formatearFecha(modalDetalle.fecha_verificacion)}
                  </p>
                </div>
              )}
            </div>

            {/* Acciones de pie si está pendiente */}
            {!modalDetalle.verificada && (
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-amber-800 dark:text-amber-300 m-0">
                  Esta institución espera aprobación para gestionar reclamos.
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => {
                      setModalAprobar(modalDetalle);
                    }}
                    variant="success"
                    size="sm"
                    leftIcon={<CheckCircle2 size={13} />}
                  >
                    Verificar
                  </Button>
                  <Button
                    onClick={() => {
                      setModalRechazar(modalDetalle);
                      setMotivoRechazo("");
                      setMotivoError("");
                    }}
                    variant="danger-soft"
                    size="sm"
                    leftIcon={<XCircle size={13} />}
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 6. Modal Confirmar Verificación */}
      {modalAprobar && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setModalAprobar(null)}
          onConfirm={handleAprobar}
          title="Verificar Institución"
          description={`¿Confirmás la verificación y habilitación operativa de "${modalAprobar.nombre}" en ReportARG? Se le enviará una notificación por correo electrónico.`}
          variant="success"
          confirmText="Verificar y Habilitar"
          cancelText="Cancelar"
          loading={procesando}
          loadingText="Verificando..."
          icon={<CheckCircle2 size={20} />}
        />
      )}

      {/* 7. Modal Confirmar Rechazo */}
      {modalRechazar && (
        <ConfirmModal
          isOpen={true}
          onClose={() => {
            setModalRechazar(null);
            setMotivoRechazo("");
            setMotivoError("");
          }}
          onConfirm={handleRechazar}
          title="Rechazar Solicitud Institucional"
          description={`Ingresá el motivo detallado de rechazo para "${modalRechazar.nombre}". Este motivo será enviado por correo electrónico a la casilla del solicitante.`}
          variant="danger"
          confirmText="Rechazar Solicitud"
          cancelText="Cancelar"
          loading={procesando}
          loadingText="Rechazando..."
          icon={<XCircle size={20} />}
        >
          <div className="mt-4 space-y-1.5 text-left">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Motivo del Rechazo <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={motivoRechazo}
              onChange={(e) => {
                setMotivoRechazo(e.target.value);
                setMotivoError("");
              }}
              placeholder="Ej: La documentación presentada es ilegible o no se acreditó la personería jurídica ante el municipio..."
              className={`w-full text-xs p-3 rounded-xl bg-surface-subtle border ${
                motivoError ? "border-rose-500" : "border-border-subtle"
              } focus:bg-surface focus:border-rose-500 text-text-primary placeholder:text-text-muted outline-hidden transition-all`}
            />
            {motivoError && <p className="text-[11px] text-rose-500 m-0">{motivoError}</p>}
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}