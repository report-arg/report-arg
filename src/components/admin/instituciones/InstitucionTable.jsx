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
  ShieldOff,
  ShieldCheck,
  Star,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useInstituciones } from "@/hooks/admin/useInstituciones";
import InstitucionAvatar from "./InstitucionAvatar";
import InstitucionStatsCards from "./InstitucionStatsCards";
import InstitucionFilterBar from "./InstitucionFilterBar";
import InstitucionDetailModal from "./InstitucionDetailModal";
import InstitucionApproveModal from "./InstitucionApproveModal";
import InstitucionRejectModal from "./InstitucionRejectModal";
import InstitucionStatusModal from "./InstitucionStatusModal";

export default function InstitucionTable() {
  const {
    instituciones,
    stats,
    ciudades,
    categoriasGlobales,
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
    filtroCiudad,
    setFiltroCiudad,
    cargarInstituciones,
    cargarStats,
    modalDetalle,
    setModalDetalle,
    modalAprobar,
    setModalAprobar,
    modalRechazar,
    setModalRechazar,
    modalCambiarEstado,
    setModalCambiarEstado,
    modalPrincipal,
    setModalPrincipal,
    procesandoAccion,
    verificarInstitucion,
    rechazarInstitucion,
    cambiarEstadoInstitucion,
    actualizarCategoriasInstitucion,
    designarPrincipalInstitucion,
  } = useInstituciones({ filtroInicialEstado: "todos", fetchStats: true });

  return (
    <div className="space-y-6">
      {/* 1. Tarjetas de Métricas Institucionales */}
      <InstitucionStatsCards stats={stats} loading={loadingStats} />

      {/* 2. Barra de Búsqueda y Filtros */}
      <InstitucionFilterBar
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        onLimpiarBusqueda={limpiarBusqueda}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        filtroCiudad={filtroCiudad}
        onFiltroCiudadChange={setFiltroCiudad}
        ciudades={ciudades}
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
            <Button onClick={() => cargarInstituciones()} variant="outline" size="sm">
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
            <h4 className="text-sm font-bold text-text-primary m-0">
              No se encontraron instituciones
            </h4>
            <p className="text-xs text-text-muted mt-1 max-w-sm m-0">
              {busqueda || filtroEstado !== "todos" || filtroCiudad
                ? "No hay resultados para los criterios de búsqueda y filtros seleccionados."
                : "No hay instituciones registradas en la base de datos."}
            </p>
            {(busqueda || filtroEstado !== "todos" || filtroCiudad) && (
              <Button
                onClick={() => {
                  limpiarBusqueda();
                  setFiltroEstado("todos");
                  setFiltroCiudad("");
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
                    const esVerificada = Number(inst.verificada) === 1;
                    const esActiva = Number(inst.activo ?? 1) === 1;
                    const esSuspendida = esVerificada && !esActiva;
                    const esRechazada =
                      !esVerificada &&
                      (inst.status === "rejected" || Boolean(inst.motivo_rechazo));
                    const esPrincipal = Number(inst.es_principal) === 1;
                    const cantCategorias = Array.isArray(inst.categorias)
                      ? inst.categorias.length
                      : 0;

                    return (
                      <tr
                        key={inst.id}
                        className="hover:bg-surface-subtle/50 transition-colors"
                      >
                        {/* Institución */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <InstitucionAvatar
                              foto={inst.foto_perfil}
                              nombre={inst.nombre}
                              size="md"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-text-primary m-0 truncate">
                                  {inst.nombre}
                                </p>
                                {esPrincipal && (
                                  <Badge
                                    variant="primary"
                                    size="sm"
                                    icon={<Star size={10} className="fill-current" />}
                                  >
                                    Principal
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <Badge variant="outline" size="sm" pill={false}>
                                  {inst.tipo || "Institución"}
                                </Badge>
                                {esVerificada && cantCategorias > 0 && (
                                  <span className="text-[10px] text-text-muted font-medium">
                                    · {cantCategorias} categoría{cantCategorias !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Ciudad / Territorio */}
                        <td className="py-3.5 px-4 text-text-secondary">
                          <div className="flex items-center gap-1.5 font-medium text-text-primary">
                            <MapPin size={13} className="text-text-muted shrink-0" />
                            <span>
                              {inst.ciudad_nombre
                                ? `${inst.ciudad_nombre}${
                                    inst.provincia ? `, ${inst.provincia}` : ""
                                  }`
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
                          {esSuspendida ? (
                            <Badge variant="danger" size="sm">
                              Suspendida
                            </Badge>
                          ) : esVerificada ? (
                            <Badge variant="success" size="sm">
                              Verificada
                            </Badge>
                          ) : esRechazada ? (
                            <Badge variant="danger" size="sm">
                              Rechazada
                            </Badge>
                          ) : (
                            <Badge variant="warning" size="sm">
                              Pendiente
                            </Badge>
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
                              title="Ver ficha completa y categorías"
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
                            {!esVerificada && !esRechazada && (
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
                            {esVerificada && (
                              <Button
                                onClick={() => setModalCambiarEstado(inst)}
                                variant={esActiva ? "danger-soft" : "success"}
                                size="sm"
                                leftIcon={
                                  esActiva ? (
                                    <ShieldOff size={13} />
                                  ) : (
                                    <ShieldCheck size={13} />
                                  )
                                }
                                title={
                                  esActiva
                                    ? "Suspender institución"
                                    : "Rehabilitar institución"
                                }
                              >
                                {esActiva ? "Suspender" : "Rehabilitar"}
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
                const esVerificada = Number(inst.verificada) === 1;
                const esActiva = Number(inst.activo ?? 1) === 1;
                const esSuspendida = esVerificada && !esActiva;
                const esRechazada =
                  !esVerificada &&
                  (inst.status === "rejected" || Boolean(inst.motivo_rechazo));
                const esPrincipal = Number(inst.es_principal) === 1;

                return (
                  <div key={inst.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <InstitucionAvatar
                          foto={inst.foto_perfil}
                          nombre={inst.nombre}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-text-primary m-0 truncate">
                              {inst.nombre}
                            </h4>
                            {esPrincipal && (
                              <Badge variant="primary" size="sm">
                                Principal
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-text-muted capitalize">
                            {inst.tipo || "Institución"}
                          </span>
                        </div>
                      </div>
                      {esSuspendida ? (
                        <Badge variant="danger" size="sm">
                          Suspendida
                        </Badge>
                      ) : esVerificada ? (
                        <Badge variant="success" size="sm">
                          Verificada
                        </Badge>
                      ) : esRechazada ? (
                        <Badge variant="danger" size="sm">
                          Rechazada
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Pendiente
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-text-secondary space-y-1 bg-surface-subtle/50 p-2.5 rounded-xl border border-border-subtle">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-text-muted shrink-0" />
                        <span className="truncate">
                          {inst.ciudad_nombre
                            ? `${inst.ciudad_nombre}${
                                inst.provincia ? `, ${inst.provincia}` : ""
                              }`
                            : "Sin ciudad"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-text-muted shrink-0" />
                        <span className="truncate">{inst.email || "Sin email"}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
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
                      {!esVerificada && !esRechazada && (
                        <Button
                          onClick={() => setModalRechazar(inst)}
                          variant="danger-soft"
                          size="sm"
                          leftIcon={<XCircle size={12} />}
                        >
                          Rechazar
                        </Button>
                      )}
                      {esVerificada && (
                        <Button
                          onClick={() => setModalCambiarEstado(inst)}
                          variant={esActiva ? "danger-soft" : "success"}
                          size="sm"
                          leftIcon={
                            esActiva ? (
                              <ShieldOff size={12} />
                            ) : (
                              <ShieldCheck size={12} />
                            )
                          }
                        >
                          {esActiva ? "Suspender" : "Rehabilitar"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="p-4 border-t border-border-subtle bg-surface-subtle/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
                <span>
                  Mostrando página <strong className="text-text-primary">{pagina}</strong>{" "}
                  de <strong className="text-text-primary">{totalPaginas}</strong> (
                  {totalRegistros} registros en total)
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={() => cambiarPagina(pagina - 1)}
                    disabled={pagina <= 1 || loading}
                    variant="outline"
                    size="sm"
                    leftIcon={<ChevronLeft size={14} />}
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => cambiarPagina(pagina + 1)}
                    disabled={pagina >= totalPaginas || loading}
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

      {/* 4. Modales de Acción */}
      <InstitucionDetailModal
        isOpen={Boolean(modalDetalle)}
        onClose={() => setModalDetalle(null)}
        institucion={modalDetalle}
        categoriasGlobales={categoriasGlobales}
        onAprobar={(inst) => setModalAprobar(inst)}
        onRechazar={(inst) => setModalRechazar(inst)}
        onCambiarEstado={(inst) => setModalCambiarEstado(inst)}
        onDesignarPrincipal={(inst) => setModalPrincipal(inst)}
        onActualizarCategorias={actualizarCategoriasInstitucion}
        procesando={procesandoAccion}
      />

      <InstitucionApproveModal
        isOpen={Boolean(modalAprobar)}
        onClose={() => setModalAprobar(null)}
        onConfirm={() => verificarInstitucion(modalAprobar)}
        institucion={modalAprobar}
        loading={procesandoAccion}
      />

      <InstitucionRejectModal
        isOpen={Boolean(modalRechazar)}
        onClose={() => setModalRechazar(null)}
        onConfirm={(motivo) => rechazarInstitucion(modalRechazar, motivo)}
        institucion={modalRechazar}
        loading={procesandoAccion}
      />

      <InstitucionStatusModal
        isOpen={Boolean(modalCambiarEstado)}
        onClose={() => setModalCambiarEstado(null)}
        onConfirm={(datos) => cambiarEstadoInstitucion(modalCambiarEstado, datos)}
        institucion={modalCambiarEstado}
        loading={procesandoAccion}
      />

      <ConfirmModal
        isOpen={Boolean(modalPrincipal)}
        onClose={() => setModalPrincipal(null)}
        onConfirm={() => designarPrincipalInstitucion(modalPrincipal)}
        title="¿Designar como Institución Principal?"
        description={
          modalPrincipal
            ? `Estás por designar a "${modalPrincipal.nombre}" como la Institución Principal de ${
                modalPrincipal.ciudad_nombre || "su ciudad"
              }. Pasará a ser el organismo responsable por defecto para recibir reclamos sin entidad especializada y habilitar la operación de la ciudad.`
            : ""
        }
        variant="primary"
        confirmText="Designar como Principal"
        cancelText="Cancelar"
        loading={procesandoAccion}
        loadingText="Designando..."
        icon={<Star size={20} />}
      />
    </div>
  );
}
