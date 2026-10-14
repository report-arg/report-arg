"use client";

import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useInstitutions } from "@/hooks/admin/useInstitutions";
import InstitutionAvatar from "./InstitutionAvatar";
import InstitutionStatsCards from "./InstitutionStatsCards";
import InstitutionFilterBar from "./InstitutionFilterBar";
import InstitutionDetailModal from "./InstitutionDetailModal";
import InstitutionApproveModal from "./InstitutionApproveModal";
import InstitutionRejectModal from "./InstitutionRejectModal";

export default function InstitutionTable() {
  const {
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
    modalDetalle,
    setModalDetalle,
    modalAprobar,
    setModalAprobar,
    modalRechazar,
    setModalRechazar,
    procesandoAccion,
    verificarInstitucion,
    rechazarInstitucion,
  } = useInstitutions({ filtroInicialEstado: "todos", fetchStats: true });

  return (
    <div className="space-y-6">
      {/* 1. Tarjetas de Métricas Institucionales */}
      <InstitutionStatsCards stats={stats} loading={loadingStats} />

      {/* 2. Barra de Búsqueda y Filtros */}
      <InstitutionFilterBar
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        onLimpiarBusqueda={limpiarBusqueda}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        onRefresh={() => {
          cargarStats();
          cargarInstituciones();
        }}
        loading={loading}
      />

      {/* 3. Tabla y Listado de Resultados */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        {/* Error */}
        {error && (
          <div className="p-6 text-center space-y-2">
            <p className="text-xs text-rose-600 font-semibold m-0">{error}</p>
            <Button
              onClick={() => cargarInstituciones()}
              variant="outline"
              size="sm"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="py-20 flex flex-col items-center justify-center text-text-muted text-xs gap-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span>Consultando instituciones registradas...</span>
          </div>
        )}

        {/* Vacío */}
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
                  limpiarBusqueda();
                  setFiltroEstado("todos");
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

        {/* Tabla desktop y cards mobile */}
        {!loading && !error && instituciones.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
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
                    const esRechazada = Boolean(inst.motivo_rechazo);
                    return (
                      <tr key={inst.id} className="hover:bg-surface-subtle/50 transition-colors">
                        {/* Institución */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <InstitutionAvatar
                              foto={inst.foto_perfil}
                              nombre={inst.nombre}
                              size="md"
                            />
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
                          <div className="flex items-center gap-1.5 font-medium text-text-primary">
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
                          ) : esRechazada ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Rechazada
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
                              title="Ver ficha completa"
                            >
                              Detalle
                            </Button>
                            {!esVerificada && (
                              <Button
                                onClick={() => setModalAprobar(inst)}
                                variant="success"
                                size="sm"
                                leftIcon={<CheckCircle size={13} />}
                                title="Aprobar y verificar"
                              >
                                Verificar
                              </Button>
                            )}
                            {!esRechazada && (
                              <Button
                                onClick={() => setModalRechazar(inst)}
                                variant="danger-soft"
                                size="sm"
                                leftIcon={<XCircle size={13} />}
                                title="Rechazar solicitud"
                              >
                                Rechazar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border-subtle">
              {instituciones.map((inst) => {
                const esVerificada = Boolean(inst.verificada);
                const esRechazada = Boolean(inst.motivo_rechazo);
                return (
                  <div key={inst.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <InstitutionAvatar
                          foto={inst.foto_perfil}
                          nombre={inst.nombre}
                          size="md"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-text-primary m-0 truncate">
                            {inst.nombre}
                          </h4>
                          <span className="text-[10px] text-text-muted capitalize">
                            {inst.tipo || "Institución"}
                          </span>
                        </div>
                      </div>
                      {esVerificada ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shrink-0">
                          Verificada
                        </span>
                      ) : esRechazada ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 shrink-0">
                          Rechazada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 shrink-0">
                          Pendiente
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-text-secondary space-y-1 bg-surface-subtle/50 p-2.5 rounded-xl border border-border-subtle">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-text-muted shrink-0" />
                        <span className="truncate">
                          {inst.ciudad_nombre
                            ? `${inst.ciudad_nombre}${inst.provincia ? `, ${inst.provincia}` : ""}`
                            : "Sin ciudad"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-text-muted shrink-0" />
                        <span className="truncate">{inst.email || "Sin email"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <Button
                        onClick={() => setModalDetalle(inst)}
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye size={12} />}
                      >
                        Detalle
                      </Button>
                      {!esVerificada && (
                        <Button
                          onClick={() => setModalAprobar(inst)}
                          variant="success"
                          size="sm"
                          leftIcon={<CheckCircle size={12} />}
                        >
                          Verificar
                        </Button>
                      )}
                      {!esRechazada && (
                        <Button
                          onClick={() => setModalRechazar(inst)}
                          variant="danger-soft"
                          size="sm"
                          leftIcon={<XCircle size={12} />}
                        >
                          Rechazar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="p-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                <span>
                  Total: <strong className="text-text-primary">{totalRegistros}</strong> instituciones (página {pagina} de {totalPaginas})
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={() => cambiarPagina(pagina - 1)}
                    disabled={pagina <= 1}
                    variant="outline"
                    size="sm"
                    leftIcon={<ChevronLeft size={14} />}
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => cambiarPagina(pagina + 1)}
                    disabled={pagina >= totalPaginas}
                    variant="outline"
                    size="sm"
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

      {/* 4. Modales Compartidos */}
      <InstitutionDetailModal
        isOpen={Boolean(modalDetalle)}
        onClose={() => setModalDetalle(null)}
        institucion={modalDetalle}
        onAprobar={(inst) => {
          setModalAprobar(inst);
        }}
        onRechazar={(inst) => {
          setModalRechazar(inst);
        }}
      />

      <InstitutionApproveModal
        isOpen={Boolean(modalAprobar)}
        onClose={() => setModalAprobar(null)}
        onConfirm={() => verificarInstitucion(modalAprobar)}
        institucion={modalAprobar}
        loading={procesandoAccion}
      />

      <InstitutionRejectModal
        isOpen={Boolean(modalRechazar)}
        onClose={() => setModalRechazar(null)}
        onConfirm={(motivo) => rechazarInstitucion(modalRechazar, motivo)}
        institucion={modalRechazar}
        loading={procesandoAccion}
      />
    </div>
  );
}
