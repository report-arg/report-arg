"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, MapPin, Building2, Calendar, History, MessageSquare,
  AlertTriangle, UserCheck, Edit3, XCircle, Check, Loader2, RefreshCw,
  ThumbsUp, Users, CheckCircle2, Image as ImageIcon, Plus, Eye, ShieldAlert
} from "lucide-react";
import apiClient from "@/services/apiClient";
import {
  Button,
  Input,
  Textarea,
  Modal,
  ConfirmModal,
  Badge,
  StatusBadge,
  ImageViewer,
} from "@/components/ui";
import { getCategoryIcon } from "@/components/brand/icons";
import { formatearFecha, formatearFechaCorta, tiempoRelativo } from "@/utils/dateFormatters";
import { toast } from "sonner";

import { 
  getNombreEvento, 
  getNodeStyle, 
  renderContenidoEvento 
} from "@/utils/claimTimelineUtils";
import ClaimTimeline from "@/components/reclamos/ClaimTimeline";

function getExplicacionEstado(estado) {
  switch (estado) {
    case 'Pendiente':
      return "Tu reclamo fue recibido y está esperando revisión inicial.";
    case 'En revisión':
      return "La institución responsable está evaluando tu reclamo y analizando los pasos a seguir.";
    case 'En proceso':
      return "La institución está trabajando en la resolución del reclamo.";
    case 'Resuelto':
      return "El reclamo fue marcado como resuelto por la institución.";
    case 'Cancelado':
      return "El reclamo fue cancelado.";
    default:
      return "El reclamo se encuentra en seguimiento según las etapas correspondientes.";
  }
}

export default function ReclamoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [reclamo, setReclamo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [actualizaciones, setActualizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState(null);

  // Modales
  const [editModal, setEditModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [reopenModal, setReopenModal] = useState(false);
  const [modalFoto, setModalFoto] = useState(false);
  const [saving, setSaving] = useState(false);

  // Formularios
  const [editForm, setEditForm] = useState({ titulo: "", descripcion: "", direccion: "" });
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [motivoReapertura, setMotivoReapertura] = useState("");
  const [nuevaActualizacion, setNuevaActualizacion] = useState("");
  const [mostrarFormActualizacion, setMostrarFormActualizacion] = useState(false);
  const [submittingActualizacion, setSubmittingActualizacion] = useState(false);
  const [mostrarTodoHistorial, setMostrarTodoHistorial] = useState(false);

  const fetchDetalle = useCallback(() => {
    if (!params.id) return;
    setLoading(true);
    apiClient.get(`/reclamos/${params.id}`)
      .then(r => r.data)
      .then(d => {
        if (d.ok) {
          setReclamo(d.data);
          setHistorial(d.data.historial || []);
          setActualizaciones(d.data.actualizaciones || []);
          setEditForm({
            titulo: d.data.titulo || "",
            descripcion: d.data.descripcion || "",
            direccion: d.data.direccion || "",
          });
        } else {
          setError(d.mensaje || "Error al obtener reclamo.");
          setErrorStatus(500);
        }
      })
      .catch(err => {
        const msg = err.response?.data?.mensaje || "No se pudo cargar el reclamo.";
        setError(msg);
        setErrorStatus(err.response?.status || 500);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    fetchDetalle();
  }, [fetchDetalle]);

  const esAutor = session?.user?.id && Number(session.user.id) === Number(reclamo?.id_usuario);
  const esPendiente = reclamo?.estado === "Pendiente";
  const esCiudadano = session?.user?.role === "ciudadano";
  const esTerminal = reclamo && ["Resuelto", "Cancelado"].includes(reclamo.estado);

  async function handleToggleAfectado() {
    if (!reclamo || esAutor || !esCiudadano || esTerminal) return;
    const previoAfectado = Boolean(reclamo.isAfectado);
    const previoCount = Number(reclamo.afectadosCount || 0);

    // Optimistic UI
    setReclamo(prev => ({
      ...prev,
      isAfectado: !previoAfectado,
      afectadosCount: previoCount + (!previoAfectado ? 1 : -1),
    }));

    try {
      const res = await apiClient.post(`/reclamos/${params.id}/afectado`);
      if (res.data?.ok) {
        toast.success(res.data.mensaje);
      } else {
        setReclamo(prev => ({ ...prev, isAfectado: previoAfectado, afectadosCount: previoCount }));
        toast.error(res.data?.mensaje || "Error al actualizar");
      }
    } catch (err) {
      setReclamo(prev => ({ ...prev, isAfectado: previoAfectado, afectadosCount: previoCount }));
      toast.error(err.response?.data?.mensaje || "Ocurrió un error");
    }
  }

  async function handleAgregarActualizacion(e) {
    e.preventDefault();
    if (!nuevaActualizacion.trim()) {
      return toast.error("El texto de la actualización no puede estar vacío");
    }
    setSubmittingActualizacion(true);
    try {
      const res = await apiClient.post(`/reclamos/${params.id}/actualizaciones`, { texto: nuevaActualizacion.trim() });
      if (res.data?.ok) {
        toast.success("Actualización agregada exitosamente");
        setNuevaActualizacion("");
        setMostrarFormActualizacion(false);
        fetchDetalle();
      } else {
        toast.error(res.data?.mensaje || "Error al agregar actualización");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al agregar actualización");
    } finally {
      setSubmittingActualizacion(false);
    }
  }

  async function handleGuardarEdicion(e) {
    e.preventDefault();
    if (!editForm.titulo.trim() || !editForm.descripcion.trim()) {
      return toast.error("El título y la descripción son obligatorios.");
    }
    setSaving(true);
    try {
      const res = await apiClient.put(`/reclamos/${params.id}`, editForm);
      if (res.data?.ok) {
        toast.success("Reclamo editado correctamente.");
        setEditModal(false);
        fetchDetalle();
      } else {
        toast.error(res.data?.mensaje || "No se pudo editar el reclamo.");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al actualizar reclamo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelarReclamo() {
    setSaving(true);
    try {
      const res = await apiClient.patch(`/reclamos/${params.id}/cancelar`, { motivo: motivoCancelacion });
      if (res.data?.ok) {
        toast.success("Reclamo cancelado exitosamente.");
        setCancelModal(false);
        setMotivoCancelacion("");
        fetchDetalle();
      } else {
        toast.error(res.data?.mensaje || "No se pudo cancelar el reclamo.");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al cancelar reclamo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReabrirReclamo() {
    if (!motivoReapertura.trim()) {
      return toast.error("Por favor ingresá un motivo para la reapertura.");
    }
    setSaving(true);
    try {
      const res = await apiClient.patch(`/reclamos/${params.id}/reabrir`, { motivo: motivoReapertura });
      if (res.data?.ok) {
        toast.success("Reclamo reabierto exitosamente.");
        setReopenModal(false);
        setMotivoReapertura("");
        fetchDetalle();
      } else {
        toast.error(res.data?.mensaje || "No se pudo reabrir el reclamo.");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al reabrir reclamo.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-text-muted text-sm">
        <Loader2 size={24} className="animate-spin mx-auto mb-3 text-primary" />
        <p>Cargando información del reclamo...</p>
      </div>
    );
  }

  if (error) {
    let tituloError = "No pudimos cargar el reclamo";
    let descError = error;

    if (errorStatus === 403) {
      tituloError = "Acceso restringido";
      descError = "No tenés permiso para ver este reclamo.";
    } else if (errorStatus === 404) {
      tituloError = "Reclamo no encontrado";
      descError = "El reclamo no existe o fue eliminado.";
    } else if (errorStatus === 500) {
      tituloError = "Error interno";
      descError = "Ocurrió un error inesperado al intentar obtener el reclamo.";
    }

    return (
      <div className="max-w-lg mx-auto my-10 p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center text-rose-900 dark:text-rose-200">
        <AlertTriangle size={36} className="mx-auto mb-2 text-rose-600 dark:text-rose-400" />
        <h3 className="text-base font-bold mb-1">{tituloError}</h3>
        <p className="text-xs text-rose-700 dark:text-rose-300 mb-4">{descError}</p>
        <Button
          variant="danger"
          size="sm"
          leftIcon={<ArrowLeft size={14} />}
          onClick={() => router.back()}
        >
          Volver a mis reclamos
        </Button>
      </div>
    );
  }

  if (!reclamo) return null;

  const CategoryIcon = getCategoryIcon(reclamo.categoriaCodigo || reclamo.categoriaNombre, reclamo.categoriaNombre);
  const currentStepIdx = ["Pendiente", "En revisión", "En proceso", "Resuelto", "Cancelado"].findIndex(p => p === reclamo.estado);
  const tiempoEnEstado = tiempoRelativo(reclamo.fecha_ultimo_cambio_estado || reclamo.fecha_creacion);

  return (
    <div className="w-full max-w-4xl mx-auto pb-8">

      {/* Botón Volver */}
      <div className="mb-3">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={15} />}
          onClick={() => router.back()}
        >
          Volver a mis reclamos
        </Button>
      </div>

      {/* Contenedor Principal Continuo y Compacto */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs divide-y divide-border-subtle overflow-hidden">

        {/* 1. INFORMACIÓN PRINCIPAL */}
        <div className="p-4 sm:px-5 sm:py-4">

          {/* Fila superior: Título del reclamo primero + acciones contextuales a la derecha */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight leading-snug">
              {reclamo.titulo}
            </h1>

            {/* Acciones contextuales del ciudadano creador */}
            <div className="flex items-center gap-2 shrink-0">
              {esAutor && esPendiente && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit3 size={13} />}
                    onClick={() => setEditModal(true)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger-soft"
                    size="sm"
                    leftIcon={<XCircle size={13} />}
                    onClick={() => setCancelModal(true)}
                  >
                    Cancelar
                  </Button>
                </>
              )}

              {esAutor && (reclamo.estado === "Resuelto" || reclamo.estado === "Cancelado") && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RefreshCw size={13} />}
                  onClick={() => setReopenModal(true)}
                >
                  Reabrir reclamo
                </Button>
              )}
            </div>
          </div>

          {/* Metadata limpia debajo del título: Estado como único badge + elementos discretos */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-text-secondary mb-3 pb-3 border-b border-border-subtle">
            {/* Estado como único badge principal */}
            <StatusBadge status={reclamo.estado} size="sm" />

            {/* Categoría: icono + texto sin pill */}
            {reclamo.categoriaNombre && (
              <>
                <span className="text-border-subtle select-none hidden sm:inline">·</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
                  <CategoryIcon size={13} className="text-primary shrink-0" />
                  <span>{reclamo.categoriaNombre}</span>
                </span>
              </>
            )}

            {/* Visibilidad: icono + texto discreto */}
            <span className="text-border-subtle select-none hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1 text-text-muted">
              {reclamo.visibilidad === "privado" ? (
                <>
                  <ShieldAlert size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Privado</span>
                </>
              ) : (
                <>
                  <Eye size={13} className="shrink-0" />
                  <span>Público</span>
                </>
              )}
            </span>

            {/* Ubicación: icono + texto */}
            {reclamo.direccion && (
              <>
                <span className="text-border-subtle select-none hidden sm:inline">·</span>
                <span className="inline-flex items-center gap-1 text-text-muted">
                  <MapPin size={13} className="shrink-0" />
                  <span>{reclamo.direccion}</span>
                </span>
              </>
            )}

            {/* Fecha: icono + fecha corta */}
            <span className="text-border-subtle select-none hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1 text-text-muted">
              <Calendar size={13} className="shrink-0" />
              <span>{formatearFechaCorta(reclamo.fecha_creacion)}</span>
            </span>

            {/* Editado: texto secundario sutil, sin badge */}
            {reclamo.editado === 1 && (
              <span className="text-[11px] text-text-muted italic">
                (editado)
              </span>
            )}
          </div>

          {/* Descripción */}
          <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {reclamo.descripcion}
          </div>

          {/* Foto adjunta: acción discreta sin imagen estirada fija */}
          {reclamo.imagen && (
            <div className="mt-3">
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

        {/* 2. INSTITUCIÓN RESPONSABLE (Sección compacta) */}
        <div className="px-4 py-2 sm:px-5 sm:py-2.5 bg-surface-subtle/30">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 size={14} className="text-primary shrink-0" />
              <span className="text-xs font-semibold text-text-primary">
                {reclamo.institucionNombre || "Pendiente de asignación"}
              </span>
              {Boolean(reclamo.institucionEsPrincipal) && (
                <Badge variant="primary" size="sm">
                  Institución principal
                </Badge>
              )}
            </div>
            {!reclamo.institucionNombre && (
              <span className="text-[11px] text-text-muted">
                Se derivará automáticamente según categoría y localidad
              </span>
            )}
          </div>
        </div>

        {/* 3. SEGUIMIENTO DEL RECLAMO (Stepper informativo sin cajas ni controles administrativos) */}
        <div className="p-4 sm:px-5 sm:py-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
            Seguimiento
          </h2>

          <ClaimTimeline 
            estadoActual={reclamo.estado}
            tiempoEnEstado={tiempoEnEstado}
            variant="citizen"
          />

          {/* Explicación del estado actual (liviana, con bullet y tiempo asociado sin contenedor pesado) */}
          <div className="mt-2.5 text-xs flex items-start gap-2">
            {reclamo.estado === 'Cancelado' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <p className="text-text-secondary leading-relaxed">
                  <span className="font-semibold text-rose-700 dark:text-rose-400">
                    Reclamo cancelado {reclamo.cancelado_por_tipo === 'ciudadano' ? 'por vos (Ciudadano)' : 'por la institución'}.
                  </span>
                  {reclamo.motivo_cancelacion && (
                    <span className="ml-1 text-text-secondary">Motivo: {reclamo.motivo_cancelacion}</span>
                  )}
                  {tiempoEnEstado && (
                    <span className="text-text-muted ml-1.5">· {tiempoEnEstado}</span>
                  )}
                </p>
              </>
            ) : reclamo.estado === 'Resuelto' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <p className="text-text-secondary leading-relaxed">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    El reclamo fue marcado como resuelto por la institución.
                  </span>
                  {reclamo.mensaje_resolucion && (
                    <span className="italic ml-1 text-text-secondary">&ldquo;{reclamo.mensaje_resolucion}&rdquo;</span>
                  )}
                  {tiempoEnEstado && (
                    <span className="text-text-muted ml-1.5">· {tiempoEnEstado}</span>
                  )}
                </p>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-text-secondary leading-relaxed">
                  <span className="text-text-primary font-medium">{getExplicacionEstado(reclamo.estado)}</span>
                  {tiempoEnEstado && (
                    <span className="text-text-muted ml-1.5">· {tiempoEnEstado}</span>
                  )}
                </p>
              </>
            )}
          </div>
        </div>

        {/* 4. ACTUALIZACIONES (Novedades y notas) */}
        <div id="actualizaciones" className="p-4 sm:px-5 sm:py-4 scroll-mt-6">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <MessageSquare size={15} className="text-primary" />
              <h2 className="text-sm font-bold text-text-primary">
                Actualizaciones
              </h2>
              {actualizaciones.length > 0 && (
                <span className="text-xs font-semibold text-text-muted">
                  ({actualizaciones.length})
                </span>
              )}
            </div>

            {esAutor && esPendiente && !mostrarFormActualizacion && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={() => setMostrarFormActualizacion(true)}
              >
                Agregar actualización
              </Button>
            )}
          </div>

          {/* Estado vacío unificado y discreto */}
          {actualizaciones.length === 0 ? (
            <p className="text-xs text-text-muted italic py-1">
              No hay novedades todavía. Cuando la institución publique una actualización, la vas a ver acá.
            </p>
          ) : (
            <div className="space-y-2.5">
              {actualizaciones.map((act) => {
                const esInst = act.tipo_autor === 'institucion';
                const autorTitulo = esInst
                  ? (act.institucionNombre || 'Institución asignada')
                  : (act.autorNombre || 'Ciudadano');

                return (
                  <div
                    key={act.id || act.id_actualizacion}
                    className={`p-3 rounded-xl border text-xs ${
                      esInst
                        ? 'bg-primary-subtle/25 border-primary/25 border-l-4 border-l-primary'
                        : 'bg-surface-subtle/60 border-border-subtle'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">
                          {autorTitulo}
                        </span>
                        <Badge variant={esInst ? "primary" : "neutral"} size="sm">
                          {esInst ? "Institución" : "Ciudadano"}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-text-muted">
                        {formatearFecha(act.fecha_creacion)}
                      </span>
                    </div>
                    <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                      {act.texto}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Formulario desplegable para nueva actualización */}
          {esAutor && esPendiente && mostrarFormActualizacion && (
            <form onSubmit={handleAgregarActualizacion} className="mt-3 p-3.5 rounded-xl bg-surface-subtle/80 border border-border-subtle space-y-3">
              <Textarea
                label="Nueva actualización"
                value={nuevaActualizacion}
                onChange={(e) => setNuevaActualizacion(e.target.value)}
                placeholder="Escribí aquí nuevos detalles o novedades sobre tu reclamo..."
                rows={3}
                required
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMostrarFormActualizacion(false);
                    setNuevaActualizacion("");
                  }}
                  disabled={submittingActualizacion}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submittingActualizacion}
                  disabled={!nuevaActualizacion.trim()}
                >
                  Publicar actualización
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* 5. HISTORIAL (Resumen compacto con opción de ver completo) */}
        <div className="p-4 sm:px-5 sm:py-3.5 bg-surface-subtle/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <History size={15} className="text-primary" />
              <h2 className="text-sm font-bold text-text-primary">Historial</h2>
            </div>
            {historial.length > 2 && (
              <button
                type="button"
                onClick={() => setMostrarTodoHistorial(prev => !prev)}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                {mostrarTodoHistorial ? "Ver menos" : `Ver historial completo (${historial.length})`}
              </button>
            )}
          </div>

          {historial.length === 0 ? (
            <p className="text-xs text-text-muted italic py-1">
              No hay registros en el historial todavía.
            </p>
          ) : (
            <div className="relative pl-4 space-y-2 border-l-2 border-border-subtle ml-1.5 mt-2">
              {(mostrarTodoHistorial ? historial : historial.slice(0, 2)).map((ev, index) => {
                const nodeStyle = getNodeStyle(ev.tipo_evento);
                return (
                  <div key={ev.id || index} className="relative">
                    <div className={`absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full ${nodeStyle.dot} border-2 border-surface`} />
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className={`text-xs font-bold ${nodeStyle.text}`}>
                        {getNombreEvento(ev.tipo_evento)}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {formatearFecha(ev.fecha_creacion)}
                      </span>
                    </div>
                    {renderContenidoEvento(ev, reclamo.institucionNombre)}
                    {ev.autorNombre && (
                      <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                        <UserCheck size={11} />
                        <span>Por: {ev.autorNombre}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. PARTICIPACIÓN CIUDADANA ("A mí también me pasa" - HU-16) */}
        {reclamo.visibilidad === 'publico' && !esAutor && esCiudadano && (
          <div className="p-4 sm:px-5 sm:py-3.5 bg-surface-subtle/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary">
                  {esTerminal ? "Problemática comunitaria" : "¿A vos también te pasa?"}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {esTerminal
                    ? `Reclamo finalizado. Registró un total de ${reclamo.afectadosCount || 0} vecino${reclamo.afectadosCount !== 1 ? 's' : ''} afectado${reclamo.afectadosCount !== 1 ? 's' : ''}.`
                    : `Sumá tu apoyo para darle más visibilidad a este reclamo. Hay ${reclamo.afectadosCount || 0} afectado${reclamo.afectadosCount !== 1 ? 's' : ''}.`}
                </p>
              </div>

              {!esTerminal ? (
                <Button
                  variant={reclamo.isAfectado ? "primary" : "outline"}
                  size="sm"
                  leftIcon={<ThumbsUp size={14} />}
                  onClick={handleToggleAfectado}
                  className="shrink-0"
                >
                  {reclamo.isAfectado ? "Ya marqué mi apoyo" : "A mí también me pasa"}
                </Button>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle text-text-muted text-xs font-semibold border border-border-subtle">
                  <Users size={14} />
                  <span>{reclamo.afectadosCount || 0} afectados</span>
                </span>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Visor de Imagen Reutilizable */}
      <ImageViewer
        isOpen={modalFoto}
        onClose={() => setModalFoto(false)}
        src={reclamo.imagen}
        alt={`Evidencia del reclamo: ${reclamo.titulo}`}
      />

      {/* Modal Editar Reclamo */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Editar reclamo"
        description="Podés actualizar los datos únicamente mientras el reclamo se encuentre en estado Pendiente."
        maxWidth="md"
      >
        <form onSubmit={handleGuardarEdicion} className="space-y-4 mt-3">
          <Input
            label="Título"
            value={editForm.titulo}
            onChange={e => setEditForm(p => ({ ...p, titulo: e.target.value }))}
            required
          />
          <Textarea
            label="Descripción"
            value={editForm.descripcion}
            onChange={e => setEditForm(p => ({ ...p, descripcion: e.target.value }))}
            rows={4}
            required
          />
          <Input
            label="Ubicación (opcional)"
            value={editForm.direccion}
            onChange={e => setEditForm(p => ({ ...p, direccion: e.target.value }))}
            placeholder="Ej. Av. San Martín 450"
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditModal(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={saving}
              leftIcon={<Check size={14} />}
            >
              Guardar cambios
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Cancelar Reclamo */}
      <ConfirmModal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        onConfirm={handleCancelarReclamo}
        title="Cancelar reclamo"
        description="¿Estás seguro de cancelar este reporte? El reclamo pasará al estado Cancelado."
        confirmText="Confirmar cancelación"
        cancelText="Volver"
        variant="danger"
        loading={saving}
      >
        <div className="mt-3">
          <Textarea
            label="Motivo de cancelación (opcional)"
            value={motivoCancelacion}
            onChange={e => setMotivoCancelacion(e.target.value)}
            placeholder="Ej. El problema ya fue solucionado por los vecinos"
            rows={3}
          />
        </div>
      </ConfirmModal>

      {/* Modal Reabrir Reclamo */}
      <ConfirmModal
        isOpen={reopenModal}
        onClose={() => setReopenModal(false)}
        onConfirm={handleReabrirReclamo}
        title="Reabrir reclamo"
        description="¿El problema persiste? Podés reabrir este reclamo para que la institución responsable vuelva a evaluarlo."
        confirmText="Confirmar reapertura"
        cancelText="Cancelar"
        variant="warning"
        loading={saving}
        confirmDisabled={!motivoReapertura.trim()}
      >
        <div className="mt-3">
          <Textarea
            label="Motivo de la reapertura (Obligatorio)"
            value={motivoReapertura}
            onChange={e => setMotivoReapertura(e.target.value)}
            placeholder="Ej. El inconveniente volvió a presentarse tras las últimas lluvias"
            rows={3}
            required
          />
        </div>
      </ConfirmModal>

    </div>
  );
}
