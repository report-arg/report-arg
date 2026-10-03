"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Calendar, History, MessageSquare,
  AlertTriangle, UserCheck, Check, Loader2, XCircle, Users, RefreshCw,
  CheckCircle2, ChevronDown, ChevronUp, Clock, ArrowRight, Lock, Plus,
  Image as ImageIcon, User
} from "lucide-react";
import apiClient from "@/services/apiClient";
import ClaimVisibilityBadge from "@/components/reclamos/ClaimVisibilityBadge";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ImageViewer from "@/components/ui/ImageViewer";
import { getCategoryIcon } from "@/components/brand/icons";
import { formatearFecha } from "@/utils/dateFormatters";
import { toast } from "sonner";

import { 
  PASOS_SECUENCIA, 
  formatearDetalleHistorial 
} from "@/utils/claimTimelineUtils";

import ClaimTimeline from "@/components/reclamos/ClaimTimeline";

const NOMBRES_EVENTO = {
  CANCELACION: "CANCELACIÓN",
  RESOLUCION: "RESOLUCIÓN",
  REAPERTURA: "REAPERTURA",
  CREACION: "CREACIÓN",
  EDICION: "EDICIÓN",
  CAMBIO_ESTADO: "CAMBIO DE ESTADO",
  REASIGNACION: "REASIGNACIÓN",
};

function getNombreEvento(tipo) {
  if (!tipo) return "EVENTO";
  return NOMBRES_EVENTO[tipo] || tipo.replace(/_/g, " ").toUpperCase();
}



function getNodeStyle(tipoEvento) {
  switch (tipoEvento) {
    case 'CANCELACION':
      return { dot: 'bg-rose-500 ring-4 ring-rose-500/20', text: 'text-rose-700 dark:text-rose-400' };
    case 'RESOLUCION':
      return { dot: 'bg-emerald-500 ring-4 ring-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400' };
    case 'REAPERTURA':
      return { dot: 'bg-amber-500 ring-4 ring-amber-500/20', text: 'text-amber-700 dark:text-amber-400' };
    default:
      return { dot: 'bg-primary ring-4 ring-primary/20', text: 'text-text-primary' };
  }
}



function renderContenidoEvento(ev, institucionNombre) {
  const detalleBase = formatearDetalleHistorial(ev.detalle, institucionNombre);
  if (!detalleBase) return null;

  if (ev.tipo_evento === 'CANCELACION') {
    const partes = detalleBase.split(/\.?\s*Motivo:\s*/i);
    const accion = partes[0]?.trim();
    const motivo = partes[1]?.trim();

    return (
      <div className="text-[11px] text-text-secondary mt-0.5 space-y-0.5 leading-relaxed">
        {accion && <p>{accion.endsWith('.') ? accion : `${accion}.`}</p>}
        {motivo && (
          <p className="text-text-secondary">
            <span className="font-semibold text-text-primary">Motivo:</span> {motivo}
          </p>
        )}
      </div>
    );
  }

  if (ev.tipo_evento === 'REAPERTURA') {
    const partes = detalleBase.split(/\.?\s*Motivo:\s*/i);
    const accion = partes[0]?.trim();
    const motivo = partes[1]?.trim();

    return (
      <div className="text-[11px] text-text-secondary mt-0.5 space-y-0.5 leading-relaxed">
        {accion && <p>{accion.endsWith('.') ? accion : `${accion}.`}</p>}
        {motivo && (
          <p className="text-text-secondary">
            <span className="font-semibold text-text-primary">Motivo:</span> {motivo}
          </p>
        )}
      </div>
    );
  }

  if (ev.tipo_evento === 'RESOLUCION') {
    const partes = detalleBase.split(/\.?\s*Mensaje:\s*/i);
    const accion = partes[0]?.trim();
    const mensaje = partes[1]?.trim();

    return (
      <div className="text-[11px] text-text-secondary mt-0.5 space-y-0.5 leading-relaxed">
        {accion && <p>{accion.endsWith('.') ? accion : `${accion}.`}</p>}
        {mensaje && (
          <p className="text-text-secondary">
            <span className="font-semibold text-text-primary">Resolución:</span> &ldquo;{mensaje}&rdquo;
          </p>
        )}
      </div>
    );
  }

  return (
    <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
      {detalleBase}
    </p>
  );
}

export default function InstitucionReclamoDetallePage() {
  const params = useParams();
  const router = useRouter();

  const [reclamo, setReclamo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [actualizaciones, setActualizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalResolver, setModalResolver] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalConfirmarEstado, setModalConfirmarEstado] = useState(null);
  const [saving, setSaving] = useState(false);

  const [motivoResolucion, setMotivoResolucion] = useState("");
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [nuevaActualizacion, setNuevaActualizacion] = useState("");
  const [mostrarTodasActualizaciones, setMostrarTodasActualizaciones] = useState(false);
  const [mostrarTodoHistorial, setMostrarTodoHistorial] = useState(false);
  const [mostrarFormActualizacion, setMostrarFormActualizacion] = useState(false);
  const [mostrarTooltipCancelar, setMostrarTooltipCancelar] = useState(false);
  const [modalFoto, setModalFoto] = useState(false);

  const fetchDetalle = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/reclamos/${params.id}`);
      if (res.data?.ok) {
        setReclamo(res.data.data);
        setHistorial(res.data.data.historial || []);
        setActualizaciones(res.data.data.actualizaciones || []);
      } else {
        setError(res.data?.mensaje || "Error al cargar reclamo");
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al cargar reclamo");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchDetalle();
  }, [fetchDetalle]);

  async function ejecutarAvanzarEstado(nuevoEstado) {
    setSaving(true);
    try {
      const res = await apiClient.patch(`/institucion/reclamos/${params.id}/estado`, { nuevoEstado });
      if (res.data?.ok) {
        toast.success(`Estado actualizado a "${nuevoEstado}"`);
        setModalConfirmarEstado(null);
        fetchDetalle();
      } else {
        toast.error(res.data?.mensaje || "Error al actualizar estado");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al actualizar estado");
    } finally {
      setSaving(false);
    }
  }

  function handlePasoClick(pasoKey) {
    if (!reclamo) return;
    if (reclamo.estado === "Cancelado") {
      toast.error("El reclamo está cancelado y no admite cambios de estado.");
      return;
    }
    if (reclamo.estado === "Resuelto") {
      toast.info("El reclamo ya se encuentra resuelto.");
      return;
    }
    if (pasoKey === reclamo.estado) {
      toast.info(`El reclamo ya se encuentra en estado "${pasoKey}".`);
      return;
    }

    const currentStepIdx = PASOS_SECUENCIA.findIndex(p => p.key === reclamo.estado);
    const targetIdx = PASOS_SECUENCIA.findIndex(p => p.key === pasoKey);

    if (targetIdx < currentStepIdx) {
      toast.info(`La etapa "${pasoKey}" ya fue completada previamente.`);
      return;
    }

    if (targetIdx > currentStepIdx + 1) {
      const siguientePaso = PASOS_SECUENCIA[currentStepIdx + 1]?.label;
      toast.warning(`Debés avanzar en orden secuencial. Primero pasá el reclamo a "${siguientePaso}".`);
      return;
    }

    // Es el paso inmediato siguiente
    if (pasoKey === "En revisión") {
      setModalConfirmarEstado({
        nuevoEstado: "En revisión",
        titulo: "¿Comenzar la revisión del reclamo?",
        descripcion: "El reclamo saldrá de la bandeja de pendientes. El ciudadano autor recibirá una notificación interna y se habilitará la publicación de novedades en la bitácora institucional."
      });
    } else if (pasoKey === "En proceso") {
      setModalConfirmarEstado({
        nuevoEstado: "En proceso",
        titulo: "¿Iniciar trabajos operativos?",
        descripcion: "Se indicará que los equipos o cuadrillas están activamente interviniendo en la vía pública o sede. El autor será notificado del avance."
      });
    } else if (pasoKey === "Resuelto") {
      setModalResolver(true);
    }
  }

  async function handleResolver(e) {
    e.preventDefault();
    if (!motivoResolucion.trim()) return toast.error("El mensaje es obligatorio.");
    setSaving(true);
    try {
      const res = await apiClient.post(`/institucion/reclamos/${params.id}/resolver`, { mensaje: motivoResolucion });
      if (res.data?.ok) {
        toast.success("Reclamo resuelto exitosamente.");
        setModalResolver(false);
        fetchDetalle();
      } else {
        toast.error(res.data?.mensaje || "Error al resolver reclamo");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al resolver reclamo");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelar(e) {
    e.preventDefault();
    if (!motivoCancelacion.trim()) return toast.error("El motivo es obligatorio.");
    setSaving(true);
    try {
      const res = await apiClient.patch(`/institucion/reclamos/${params.id}/cancelar`, { motivo: motivoCancelacion });
      if (res.data?.ok) {
        toast.success("Reclamo cancelado exitosamente.");
        setModalCancelar(false);
        fetchDetalle();
      } else {
        toast.error(res.data?.mensaje || "Error al cancelar reclamo");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al cancelar reclamo");
    } finally {
      setSaving(false);
    }
  }

  async function handleAgregarActualizacion(e) {
    e.preventDefault();
    if (!nuevaActualizacion.trim()) return toast.error("El texto no puede estar vacío");
    setSaving(true);
    try {
      const res = await apiClient.post(`/reclamos/${params.id}/actualizaciones`, { texto: nuevaActualizacion });
      if (res.data?.ok) {
        toast.success("Actualización agregada");
        setNuevaActualizacion("");
        setMostrarFormActualizacion(false);
        fetchDetalle();
      } else {
        toast.error(res.data?.mensaje || "Error al agregar actualización");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al agregar actualización");
    } finally {
      setSaving(false);
    }
  }

  function handleCancelarActualizacion() {
    setNuevaActualizacion("");
    setMostrarFormActualizacion(false);
  }

  if (loading) return <div className="max-w-3xl mx-auto p-8 text-center text-text-muted text-sm">Cargando reclamo...</div>;
  if (error) return (
    <div className="max-w-lg mx-auto my-10 p-6 rounded-2xl bg-red-50 border border-red-200 text-center text-red-900">
      <AlertTriangle size={36} className="mx-auto mb-2 text-red-600" />
      <h3 className="text-base font-bold mb-1">Error</h3>
      <p className="text-xs text-red-700 mb-4">{error}</p>
      <button onClick={() => router.back()} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700">
        Volver
      </button>
    </div>
  );

  if (!reclamo) return null;

  const CategoryIcon = getCategoryIcon(reclamo.categoriaNombre, reclamo.categoriaNombre);
  const afectados = reclamo.afectadosCount || 0;
  
  const currentStepIdx = PASOS_SECUENCIA.findIndex(p => p.key === reclamo.estado);
  const isTerminal = ['Resuelto', 'Cancelado'].includes(reclamo.estado);

  const ultimoEventoCancelacion = [...historial].reverse().find(h => h.tipo_evento === 'CANCELACION');
  const canceladoPorTipo = reclamo.cancelado_por_tipo || (ultimoEventoCancelacion?.autorRol === 'ciudadano' ? 'ciudadano' : ultimoEventoCancelacion?.autorRol === 'institucion' ? 'institución' : ultimoEventoCancelacion?.autorRol || 'institución');
  const canceladoPorNombre = ultimoEventoCancelacion?.autorNombre;
  const motivoCancelacionActual = reclamo.motivo_cancelacion || (ultimoEventoCancelacion?.detalle?.includes('Motivo:') ? ultimoEventoCancelacion.detalle.split(/Motivo:\s*/i)[1]?.trim() : null);

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      {/* Botón Volver */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle text-text-secondary text-xs font-semibold hover:bg-surface-elevated transition-colors cursor-pointer mb-4"
      >
        <ArrowLeft size={15} /> Volver a la bandeja
      </button>

      {/* Grid Principal: 2 columnas en desktop / 1 en mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Columna Principal: Reclamo, Gestión, Seguimiento (Actualizaciones) */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. RECLAMO: INFORMACIÓN PRINCIPAL */}
          <div className="bg-surface rounded-2xl border border-border-subtle p-5 sm:p-6 shadow-xs">
            {/* Título del reclamo: primer elemento visible en la card */}
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 leading-snug">
              {reclamo.titulo}
            </h1>

            {/* Metadatos esenciales sin redundancia */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary mb-4 pb-4 border-b border-border-subtle">
              {reclamo.categoriaNombre && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-text-primary bg-primary-subtle/50 px-2.5 py-1 rounded-lg border border-primary/20">
                  <CategoryIcon size={14} className="text-primary" /> {reclamo.categoriaNombre}
                </span>
              )}
              <ClaimVisibilityBadge visibilidad={reclamo.visibilidad} />
              {reclamo.direccion && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} className="text-text-muted" /> {reclamo.direccion}
                </span>
              )}
              <span className="inline-flex items-center gap-1 font-medium">
                <User size={14} className="text-text-muted" /> {reclamo.autorNombre || "Ciudadano"}
              </span>
            </div>

            {/* Descripción del reporte */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                Descripción del reporte
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {reclamo.descripcion}
              </p>
            </div>

            {/* Evidencia fotográfica: acción discreta sin caja contenedora */}
            {reclamo.imagen && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setModalFoto(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary-subtle hover:bg-primary-subtle/80 border border-primary/20 transition-colors cursor-pointer shadow-2xs"
                >
                  <ImageIcon size={14} />
                  <span>Ver foto adjunta</span>
                </button>
              </div>
            )}

          </div>

          {/* 2. GESTIÓN: SECUENCIA DE ESTADOS CON LÍNEA DE PROGRESO */}
          <div className="bg-surface rounded-2xl border border-border-subtle p-5 sm:p-6 shadow-xs">
            <div className="mb-5 pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-text-primary tracking-tight">
                Gestión del reclamo
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Seguimiento del proceso operativo y avance secuencial de estados.
              </p>
            </div>

            {/* Caso terminal: Cancelado */}
            {reclamo.estado === 'Cancelado' ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
                <XCircle size={22} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1.5 flex-1">
                  <p className="font-bold text-rose-800 text-sm">Reclamo cancelado</p>
                  <p className="text-rose-700">
                    Cancelado por: <strong className="capitalize">{canceladoPorTipo}</strong>
                    {canceladoPorNombre && (
                      <span className="font-medium text-rose-900"> ({canceladoPorNombre})</span>
                    )}
                  </p>
                  {motivoCancelacionActual && (
                    <div className="bg-white/90 p-2.5 rounded-lg border border-rose-200 text-rose-900 mt-1 italic leading-relaxed">
                      <span className="font-semibold not-italic text-xs block text-rose-950 mb-0.5">Motivo:</span>
                      &ldquo;{motivoCancelacionActual}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <ClaimTimeline 
                  estadoActual={reclamo.estado}
                  variant="institution"
                  onStepClick={handlePasoClick}
                />

                {/* Banner de Resolución si aplica */}
                {reclamo.estado === 'Resuelto' && (
                  <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-emerald-800">Reclamo resuelto</p>
                      {reclamo.mensaje_resolucion && (
                        <p className="mt-0.5 text-emerald-800 italic leading-relaxed">&ldquo;{reclamo.mensaje_resolucion}&rdquo;</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Acción secundaria discreta: Cancelar reclamo con (?) a la derecha */}
                {!isTerminal && (
                  <div className="mt-6 pt-3 border-t border-border-subtle flex items-center justify-end gap-2 text-xs">
                    {/* Botón Cancelar Reclamo */}
                    <button
                      type="button"
                      onClick={() => setModalCancelar(true)}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-rose-600 transition-colors py-1 px-2.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer border border-transparent hover:border-rose-200"
                      title="Cancelar reclamo con motivo justificado"
                    >
                      <XCircle size={13} />
                      <span>Cancelar reclamo</span>
                    </button>

                    {/* Botón de ayuda (?) con Popover/Tooltip accesible a la derecha */}
                    <div className="relative inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => setMostrarTooltipCancelar(prev => !prev)}
                        onMouseEnter={() => setMostrarTooltipCancelar(true)}
                        onMouseLeave={() => setMostrarTooltipCancelar(false)}
                        onFocus={() => setMostrarTooltipCancelar(true)}
                        onBlur={() => setMostrarTooltipCancelar(false)}
                        aria-label="Ayuda sobre la cancelación de reclamos"
                        aria-expanded={mostrarTooltipCancelar}
                        className="w-5 h-5 rounded-full border border-border-subtle bg-surface-subtle text-text-muted hover:text-text-primary hover:border-border flex items-center justify-center text-[11px] font-bold cursor-pointer transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary/30"
                      >
                        ?
                      </button>

                      {/* Popover / Tooltip */}
                      {mostrarTooltipCancelar && (
                        <div
                          role="tooltip"
                          className="absolute bottom-full right-0 mb-2 w-72 p-3 rounded-xl bg-surface border border-border-subtle shadow-lg text-[11px] text-text-secondary leading-relaxed z-30 animate-in fade-in zoom-in-95 duration-150"
                        >
                          <p className="font-semibold text-text-primary mb-1">
                            Cancelación institucional
                          </p>
                          <p>
                            Permite a la institución cancelar el reclamo indicando un motivo obligatorio, aplicable ante reportes duplicados, fuera de jurisdicción o que no corresponden a gestión operativa.
                          </p>
                          <div className="absolute top-full right-2 w-2 h-2 bg-surface border-b border-r border-border-subtle rotate-45 -mt-1" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. SEGUIMIENTO: HISTORIAL DE ACTUALIZACIONES & FORMULARIO */}
          <div className="bg-surface rounded-2xl border border-border-subtle p-5 sm:p-6 shadow-xs">
            {/* Encabezado de la bitácora */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <MessageSquare size={16} className="text-primary" /> Historial de Actualizaciones
              </h3>
              {actualizaciones.length > 0 && (
                <span className="text-[11px] font-semibold text-text-muted">
                  {actualizaciones.length} novedad{actualizaciones.length === 1 ? '' : 'es'}
                </span>
              )}
            </div>
            
            {actualizaciones.length === 0 ? (
              <p className="text-xs text-text-muted py-2">
                No hay actualizaciones registradas aún. Podés mantener informados a los ciudadanos agregando una novedad técnica.
              </p>
            ) : (
              <div>
                {/* Entradas compactas: Autor · Rol · Fecha / Texto */}
                <div className="divide-y divide-border-subtle">
                  {(mostrarTodasActualizaciones ? actualizaciones : actualizaciones.slice(0, 3)).map(act => {
                    const autor = act.tipo_autor === 'institucion' 
                      ? (act.institucionNombre || 'Institución') 
                      : (act.autorNombre || 'Ciudadano');
                    const rol = act.tipo_autor === 'institucion' ? 'Institucional' : 'Ciudadano';

                    return (
                      <div key={act.id} className="py-2.5 first:pt-1 last:pb-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted mb-1 flex-wrap">
                          <span className="font-semibold text-text-primary">{autor}</span>
                          <span>·</span>
                          <span className={act.tipo_autor === 'institucion' ? 'text-primary font-medium' : 'text-text-muted'}>
                            {rol}
                          </span>
                          <span>·</span>
                          <span>{formatearFecha(act.fecha_creacion)}</span>
                        </div>
                        <p className="text-xs text-text-secondary whitespace-pre-line leading-relaxed">
                          {act.texto}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Botón Ver más si hay más de 3 actualizaciones */}
                {actualizaciones.length > 3 && (
                  <div className="flex justify-center pt-3 border-t border-border-subtle mt-2">
                    <button
                      type="button"
                      onClick={() => setMostrarTodasActualizaciones(prev => !prev)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary-subtle hover:bg-primary-subtle/80 transition-colors cursor-pointer"
                    >
                      {mostrarTodasActualizaciones ? (
                        <>
                          <ChevronUp size={13} />
                          <span>Ver menos actualizaciones</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={13} />
                          <span>Ver más actualizaciones ({actualizaciones.length - 3} restantes)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Sección de Agregar Actualización Institucional (Interacción Progresiva) */}
            {['En revisión', 'En proceso'].includes(reclamo.estado) ? (
              <div className="mt-4 pt-3 border-t border-border-subtle">
                {!mostrarFormActualizacion ? (
                  <button
                    type="button"
                    onClick={() => setMostrarFormActualizacion(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary-subtle hover:bg-primary-subtle/80 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Agregar actualización</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-surface-subtle/40 border border-border-subtle animate-in fade-in zoom-in-98 duration-150">
                    <h4 className="text-xs font-bold text-text-primary mb-2">
                      Agregar actualización institucional
                    </h4>
                    <form onSubmit={handleAgregarActualizacion}>
                      <textarea
                        value={nuevaActualizacion}
                        onChange={e => setNuevaActualizacion(e.target.value)}
                        placeholder="Informá sobre avances operativos (ej: cuadrilla asignada, inspección en curso)..."
                        rows={3}
                        className="w-full text-xs p-2.5 rounded-lg border border-border-subtle focus:outline-hidden focus:border-primary mb-3 resize-y leading-relaxed bg-surface transition-all"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleCancelarActualizacion}
                          disabled={saving}
                          className="px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-subtle rounded-lg cursor-pointer transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={saving || !nuevaActualizacion.trim()}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-primary hover:bg-[var(--color-brand-700)] rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          {saving ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              <span>Publicando...</span>
                            </>
                          ) : (
                            <span>Publicar actualización</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ) : reclamo.estado === 'Pendiente' ? (
              <div className="mt-4 pt-3 border-t border-border-subtle text-xs text-text-muted flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span>Para publicar actualizaciones, avanzá el reclamo a <strong>En revisión</strong>.</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Columna Secundaria: Resumen Operativo e Historial */}
        <div className="space-y-6">

          {/* Resumen Operativo: Datos sin redundancia */}
          <div className="bg-surface rounded-2xl border border-border-subtle p-5 shadow-xs">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
              Resumen Operativo
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Clock size={13} /> Tiempo en estado
                </span>
                <span className="font-semibold text-text-primary">
                  {reclamo.tiempo_en_estado || (reclamo.diasEnEstado === 0 ? "Menos de un día" : reclamo.diasEnEstado ? `${reclamo.diasEnEstado} días` : 'Menos de un día')}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Users size={13} /> Apoyo vecinal
                </span>
                <span className="font-semibold text-text-primary">
                  {afectados} vecino{afectados === 1 ? '' : 's'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Calendar size={13} /> Fecha de creación
                </span>
                <span className="font-semibold text-text-primary">
                  {formatearFecha(reclamo.fecha_creacion)}
                </span>
              </div>
            </div>
          </div>

          {/* Historial */}
          <div className="bg-surface rounded-2xl border border-border-subtle p-5 shadow-xs sticky top-24">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2 border-b border-border-subtle pb-3">
              <History size={16} className="text-primary" /> Historial
            </h3>
            {historial.length === 0 ? (
              <p className="text-xs text-text-muted">No hay registros de movimientos aún.</p>
            ) : (
              <div>
                <div className="space-y-0 max-h-[550px] overflow-y-auto pl-2.5 pr-1.5">
                  {(mostrarTodoHistorial ? historial : historial.slice(0, 3)).map((ev, index, arr) => {
                    const isLast = index === arr.length - 1;
                    const nodeStyle = getNodeStyle(ev.tipo_evento);
                    const nombreEvento = getNombreEvento(ev.tipo_evento);

                    return (
                      <div key={ev.id || index} className="flex gap-3">
                        {/* Columna del nodo y línea vertical continua */}
                        <div className="flex flex-col items-center w-5 shrink-0">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${nodeStyle.dot}`} />
                          {!isLast && (
                            <div className="w-0.5 grow bg-border-subtle my-1" />
                          )}
                        </div>

                        {/* Contenido del evento */}
                        <div className="pb-4 flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <span className={`text-xs font-bold uppercase tracking-wide ${nodeStyle.text}`}>
                              {nombreEvento}
                            </span>
                            <span className="text-[10px] text-text-muted shrink-0">
                              {formatearFecha(ev.fecha_creacion)}
                            </span>
                          </div>
                          {renderContenidoEvento(ev, reclamo.institucionNombre)}
                          {ev.autorNombre && (
                            <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
                              <UserCheck size={11} className="text-primary/70 shrink-0" />
                              <span>Por: <strong className="text-text-secondary">{ev.autorNombre}</strong></span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botón Ver historial para expandir si hay más de 3 */}
                {historial.length > 3 && (
                  <div className="flex justify-center pt-3 border-t border-border-subtle mt-1">
                    <button
                      type="button"
                      onClick={() => setMostrarTodoHistorial(prev => !prev)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-primary bg-primary-subtle hover:bg-primary-subtle/80 transition-colors cursor-pointer w-full justify-center"
                    >
                      {mostrarTodoHistorial ? (
                        <>
                          <ChevronUp size={14} />
                          <span>Ver menos</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          <span>Ver más ({historial.length - 3} restantes)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Confirmar Avance de Estado */}
      <ConfirmModal
        isOpen={!!modalConfirmarEstado}
        onClose={() => !saving && setModalConfirmarEstado(null)}
        onConfirm={() => ejecutarAvanzarEstado(modalConfirmarEstado.nuevoEstado)}
        title={modalConfirmarEstado?.titulo || "Avanzar estado"}
        description={
          modalConfirmarEstado?.nuevoEstado ? (
            <>
              Avanzar reclamo al estado <strong className="text-text-primary">&quot;{modalConfirmarEstado.nuevoEstado}&quot;</strong>
            </>
          ) : undefined
        }
        variant="primary"
        confirmText={`Confirmar avance a "${modalConfirmarEstado?.nuevoEstado || ''}"`}
        cancelText="Cancelar"
        loading={saving}
        loadingText="Actualizando..."
      >
        <p className="text-xs text-text-secondary leading-relaxed bg-surface-subtle p-3 rounded-xl border border-border-subtle">
          {modalConfirmarEstado?.descripcion}
        </p>
      </ConfirmModal>

      {/* Modal Resolver */}
      <ConfirmModal
        isOpen={modalResolver}
        onClose={() => !saving && setModalResolver(false)}
        onConfirm={handleResolver}
        title="Resolver Reclamo"
        description="Cierre oficial del caso ante la comunidad"
        variant="success"
        confirmText="Confirmar Resolución"
        cancelText="Cancelar"
        loading={saving}
        loadingText="Guardando..."
        confirmDisabled={!motivoResolucion.trim()}
      >
        <p className="text-xs text-text-muted">
          Agregá un mensaje de resolución que será público para los ciudadanos involucrados.
        </p>
        <textarea
          value={motivoResolucion}
          onChange={e => setMotivoResolucion(e.target.value)}
          placeholder="Detalles del trabajo realizado..."
          rows={4}
          required
          className="w-full text-sm p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800/60 focus:outline-hidden focus:border-emerald-500 transition-colors"
        />
      </ConfirmModal>

      {/* Modal Cancelar */}
      <ConfirmModal
        isOpen={modalCancelar}
        onClose={() => !saving && setModalCancelar(false)}
        onConfirm={handleCancelar}
        title="Cancelar Reclamo"
        description="Cierre justificado del reclamo"
        variant="danger"
        confirmText="Confirmar Cancelación"
        cancelText="Volver"
        loading={saving}
        loadingText="Cancelando..."
        confirmDisabled={!motivoCancelacion.trim()}
      >
        <p className="text-xs text-text-muted">
          Indicá el motivo por el cual la institución cancela este reporte:
        </p>
        <textarea
          value={motivoCancelacion}
          onChange={e => setMotivoCancelacion(e.target.value)}
          placeholder="Ej: Fuera de jurisdicción, reporte duplicado..."
          rows={4}
          required
          className="w-full text-sm p-3 rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-800/60 focus:outline-hidden focus:border-rose-500 transition-colors"
        />
      </ConfirmModal>

      {/* Visor de Foto Adjunta (Lightbox) */}
      <ImageViewer
        isOpen={modalFoto}
        onClose={() => setModalFoto(false)}
        src={reclamo.imagen}
        alt={reclamo.titulo || "Foto adjunta del reclamo"}
        titulo={reclamo.titulo ? `Evidencia fotográfica: ${reclamo.titulo}` : "Evidencia fotográfica"}
      />
    </div>
  );
}
