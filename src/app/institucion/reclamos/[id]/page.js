"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, MapPin, Building2, Calendar, History, MessageSquare,
  AlertTriangle, UserCheck, Check, Loader2, XCircle, Users, RefreshCw
} from "lucide-react";
import apiClient from "@/services/apiClient";
import ClaimTracking from "@/components/reclamos/ClaimTracking";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import ClaimVisibilityBadge from "@/components/reclamos/ClaimVisibilityBadge";
import ClaimProgress from "@/components/reclamos/ClaimProgress";
import { getCategoryIcon } from "@/components/brand/icons";
import { formatearFecha } from "@/utils/dateFormatters";
import { toast } from "sonner";

export default function InstitucionReclamoDetallePage() {
  const params = useParams();
  const router = useRouter();

  const [reclamo, setReclamo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [actualizaciones, setActualizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalResolver, setModalResolver] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [saving, setSaving] = useState(false);

  const [motivoResolucion, setMotivoResolucion] = useState("");
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [nuevaActualizacion, setNuevaActualizacion] = useState("");

  const fetchDetalle = () => {
    if (!params.id) return;
    setLoading(true);
    apiClient.get(`/reclamos/${params.id}`)
      .then(r => r.data)
      .then(d => {
        if (d.ok) {
          setReclamo(d.data);
          setHistorial(d.data.historial || []);
          setActualizaciones(d.data.actualizaciones || []);
        } else {
          setError(d.mensaje || "Error al obtener reclamo.");
        }
      })
      .catch(err => {
        setError(err.response?.data?.mensaje || "No se pudo cargar el reclamo.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetalle();
  }, [params.id]);

  async function handleAvanzarEstado(nuevoEstado) {
    if (!confirm(`¿Seguro que deseas avanzar el estado a ${nuevoEstado}?`)) return;
    setSaving(true);
    try {
      const res = await apiClient.patch(`/institucion/reclamos/${params.id}/estado`, { nuevoEstado });
      if (res.data?.ok) {
        toast.success(`Estado actualizado a ${nuevoEstado}`);
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
  
  return (
    <div className="w-full">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle text-text-secondary text-xs font-semibold hover:bg-surface-elevated transition-colors cursor-pointer mb-4"
      >
        <ArrowLeft size={15} /> Volver a la bandeja
      </button>

      {/* Contenedor Principal dividido en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda (Detalles del reclamo y Acciones) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-2xl border border-border-subtle p-5 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-border-subtle">
              <ClaimStatusBadge estado={reclamo.estado} />
              <ClaimTracking reclamo={reclamo} advertir />
              <ClaimVisibilityBadge visibilidad={reclamo.visibilidad} />
            </div>

            <h1 className="text-xl font-bold text-text-primary mb-3">{reclamo.titulo}</h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary mb-4 pb-3 border-b border-border-subtle">
              {reclamo.categoriaNombre && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-text-primary">
                  <CategoryIcon size={14} className="text-primary" /> {reclamo.categoriaNombre}
                </span>
              )}
              {reclamo.direccion && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} className="text-text-muted" /> {reclamo.direccion}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar size={14} className="text-text-muted" /> {formatearFecha(reclamo.fecha_creacion)}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Users size={14} /> {afectados} afectados
              </span>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-surface-subtle border border-border-subtle">
              <p className="text-xs font-bold text-text-secondary mb-2">Avance del reclamo</p>
              <ClaimProgress estado={reclamo.estado} />
            </div>

            <div className="mb-5">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">Descripción</h3>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{reclamo.descripcion}</p>
            </div>

            {reclamo.imagen && (
              <div className="mb-5">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">Evidencia fotográfica</h3>
                <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-border-subtle bg-surface-subtle">
                  <Image src={reclamo.imagen} alt={reclamo.titulo} fill unoptimized className="object-cover" />
                </div>
              </div>
            )}
            
            {reclamo.motivo_cancelacion && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 mb-4">
                <p className="text-xs font-bold mb-1">Motivo de Cancelación ({reclamo.cancelado_por_tipo}):</p>
                <p className="text-sm">{reclamo.motivo_cancelacion}</p>
              </div>
            )}
            
            {reclamo.mensaje_resolucion && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 mb-4">
                <p className="text-xs font-bold mb-1">Mensaje de Resolución Institucional:</p>
                <p className="text-sm">{reclamo.mensaje_resolucion}</p>
              </div>
            )}
          </div>

          {/* Actualizaciones */}
          <div className="bg-surface rounded-2xl border border-border-subtle p-5 shadow-xs">
            <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" /> Actualizaciones del Reclamo
            </h3>
            
            {actualizaciones.length === 0 ? (
              <p className="text-sm text-text-muted mb-4">No hay actualizaciones aún. Podés mantener informados a los ciudadanos agregando una.</p>
            ) : (
              <div className="space-y-4 mb-6">
                {actualizaciones.map(act => (
                  <div key={act.id} className={`p-4 rounded-xl border ${act.tipo_autor === 'institucion' ? 'bg-primary-subtle/30 border-primary/20' : 'bg-surface-subtle border-border-subtle'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-text-primary">
                        {act.tipo_autor === 'institucion' ? act.institucionNombre : act.autorNombre}
                      </span>
                      <span className="text-[10px] text-text-muted">{formatearFecha(act.fecha_creacion)}</span>
                    </div>
                    <p className="text-sm text-text-secondary whitespace-pre-line">{act.texto}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Formulario de Nueva Actualización */}
            {['Pendiente', 'En revisión', 'En proceso'].includes(reclamo.estado) && (
              <form onSubmit={handleAgregarActualizacion} className="mt-4 pt-4 border-t border-border-subtle">
                <label className="block text-xs font-bold text-text-secondary mb-2">Agregar Actualización</label>
                <textarea
                  value={nuevaActualizacion}
                  onChange={e => setNuevaActualizacion(e.target.value)}
                  placeholder="Informá sobre avances (Ej: 'La cuadrilla ya fue asignada al barrio...')"
                  rows={3}
                  className="w-full text-sm p-3 rounded-xl border border-border-subtle focus:outline-hidden focus:border-primary mb-2"
                />
                <div className="flex justify-end">
                  <button type="submit" disabled={saving || !nuevaActualizacion.trim()} className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-[var(--color-brand-700)] rounded-xl transition-colors disabled:opacity-50">
                    Publicar actualización
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Columna Derecha (Acciones y Auditoría) */}
        <div className="space-y-6">
          {/* Tarjeta de Acciones Institucionales */}
          <div className="bg-surface rounded-2xl border border-border-subtle p-5 shadow-xs sticky top-24">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">Gestión del Reclamo</h3>
            
            {['Resuelto', 'Cancelado'].includes(reclamo.estado) ? (
              <div className="text-center p-4 bg-surface-subtle rounded-xl text-sm text-text-muted">
                Este reclamo ya finalizó su gestión.
              </div>
            ) : (
              <div className="space-y-3">
                {reclamo.estado === 'Pendiente' && (
                  <button onClick={() => handleAvanzarEstado('En revisión')} disabled={saving} className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors">
                    Marcar como &quot;En revisión&quot;
                  </button>
                )}
                {reclamo.estado === 'En revisión' && (
                  <button onClick={() => handleAvanzarEstado('En proceso')} disabled={saving} className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                    Comenzar a trabajar (&quot;En proceso&quot;)
                  </button>
                )}
                {reclamo.estado === 'En proceso' && (
                  <button onClick={() => setModalResolver(true)} disabled={saving} className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                    Resolver Reclamo
                  </button>
                )}
                <div className="pt-3 mt-3 border-t border-border-subtle">
                  <button onClick={() => setModalCancelar(true)} disabled={saving} className="w-full py-2 px-4 text-xs font-semibold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
                    Cancelar Reclamo
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Historial e Hitos de Auditoría */}
          <div className="bg-surface rounded-2xl border border-border-subtle p-5 shadow-xs">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <History size={16} className="text-primary" /> Historial de Auditoría
            </h3>
            {historial.length === 0 ? (
              <p className="text-xs text-text-muted">No hay registros.</p>
            ) : (
              <div className="relative pl-4 space-y-4 border-l-2 border-border-subtle ml-2">
                {historial.map((ev, index) => (
                  <div key={ev.id || index} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white" />
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wide">{ev.tipo_evento}</span>
                      <span className="text-[10px] text-text-muted">{formatearFecha(ev.fecha_creacion)}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{ev.detalle}</p>
                    {ev.autorNombre && (
                      <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                        <UserCheck size={10} /> Por: {ev.autorNombre}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Resolver */}
      {modalResolver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface rounded-2xl p-5 shadow-xl border border-border-subtle">
            <h3 className="text-base font-bold text-emerald-700 mb-1">Resolver Reclamo</h3>
            <p className="text-xs text-text-muted mb-4">Agregá un mensaje de resolución que será público para los ciudadanos involucrados.</p>
            <form onSubmit={handleResolver} className="space-y-3">
              <textarea
                value={motivoResolucion}
                onChange={e => setMotivoResolucion(e.target.value)}
                placeholder="Detalles del trabajo realizado..."
                rows={4}
                required
                className="w-full text-sm p-3 rounded-xl border border-emerald-200 bg-emerald-50 focus:outline-hidden focus:border-emerald-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalResolver(false)} disabled={saving} className="px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-subtle rounded-xl">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl">Confirmar Resolución</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cancelar */}
      {modalCancelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface rounded-2xl p-5 shadow-xl border border-border-subtle">
            <h3 className="text-base font-bold text-rose-700 mb-1">Cancelar Reclamo</h3>
            <p className="text-xs text-text-muted mb-4">Indicá el motivo por el cual la institución cancela este reporte.</p>
            <form onSubmit={handleCancelar} className="space-y-3">
              <textarea
                value={motivoCancelacion}
                onChange={e => setMotivoCancelacion(e.target.value)}
                placeholder="Ej: Fuera de jurisdicción, reporte duplicado..."
                rows={4}
                required
                className="w-full text-sm p-3 rounded-xl border border-rose-200 bg-rose-50 focus:outline-hidden focus:border-rose-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalCancelar(false)} disabled={saving} className="px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-subtle rounded-xl">Volver</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl">Confirmar Cancelación</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
