"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  ArrowLeft, MapPin, Building2, Calendar, History,
  AlertTriangle, UserCheck, Edit3, XCircle, Check, Loader2
} from "lucide-react";
import apiClient from "@/services/apiClient";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import ClaimVisibilityBadge from "@/components/reclamos/ClaimVisibilityBadge";
import ClaimProgress from "@/components/reclamos/ClaimProgress";
import { getCategoryIcon } from "@/components/brand/icons";
import { formatearFecha } from "@/utils/dateFormatters";
import { toast } from "sonner";

export default function ReclamoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [reclamo, setReclamo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modales de Edición y Cancelación
  const [editModal, setEditModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({ titulo: "", descripcion: "", direccion: "" });
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  const fetchDetalle = () => {
    if (!params.id) return;
    setLoading(true);
    apiClient.get(`/reclamos/${params.id}`)
      .then(r => r.data)
      .then(d => {
        if (d.ok) {
          setReclamo(d.data);
          setHistorial(d.data.historial || []);
          setEditForm({
            titulo: d.data.titulo || "",
            descripcion: d.data.descripcion || "",
            direccion: d.data.direccion || "",
          });
        } else {
          setError(d.mensaje || "Error al obtener reclamo.");
        }
      })
      .catch(err => {
        const msg = err.response?.data?.mensaje || "No se pudo cargar el reclamo.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetalle();
  }, [params.id]);

  const esAutor = session?.user?.id && Number(session.user.id) === Number(reclamo?.id_usuario);
  const esPendiente = reclamo?.estado === "Pendiente";

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

  async function handleCancelarReclamo(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.patch(`/reclamos/${params.id}/cancelar`, { motivo: motivoCancelacion });
      if (res.data?.ok) {
        toast.success("Reclamo cancelado exitosamente.");
        setCancelModal(false);
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center text-slate-500 text-sm">
        Cargando seguimiento del reclamo...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto my-10 p-6 rounded-2xl bg-red-50 border border-red-200 text-center text-red-900">
        <AlertTriangle size={36} className="mx-auto mb-2 text-red-600" />
        <h3 className="text-base font-bold mb-1">Acceso restringido</h3>
        <p className="text-xs text-red-700 mb-4">{error}</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a reclamos
        </button>
      </div>
    );
  }

  if (!reclamo) return null;

  const CategoryIcon = getCategoryIcon(reclamo.categoriaCodigo || reclamo.categoriaNombre, reclamo.categoriaNombre);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* Botón Volver */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer mb-4"
      >
        <ArrowLeft size={15} /> Volver a mis reclamos
      </button>

      {/* Tarjeta Principal de Seguimiento */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs mb-6">

        {/* Header con Badges y Acciones de Autor */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <ClaimStatusBadge estado={reclamo.estado} />
            <ClaimVisibilityBadge visibilidad={reclamo.visibilidad} />

            {reclamo.editado === 1 && (
              <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Editado
              </span>
            )}
          </div>

          {/* Acciones de Edición/Cancelación solo si es autor y el estado es Pendiente */}
          {esAutor && esPendiente && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-brand-600)] bg-[var(--color-brand-50)] hover:bg-[var(--color-brand-100)] transition-colors cursor-pointer"
              >
                <Edit3 size={13} />
                <span>Editar</span>
              </button>

              <button
                onClick={() => setCancelModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <XCircle size={13} />
                <span>Cancelar</span>
              </button>
            </div>
          )}
        </div>

        {/* Título */}
        <h1 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
          {reclamo.titulo}
        </h1>

        {/* Metadatos */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 mb-4 pb-3 border-b border-slate-100">
          {reclamo.categoriaNombre && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
              <CategoryIcon size={14} className="text-[var(--color-brand-600)]" />
              <span>{reclamo.categoriaNombre}</span>
            </span>
          )}

          {reclamo.direccion && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} className="text-slate-400" />
              <span>{reclamo.direccion}</span>
            </span>
          )}

          <span className="inline-flex items-center gap-1">
            <Calendar size={14} className="text-slate-400" />
            <span>Creado el {formatearFecha(reclamo.fecha_creacion)}</span>
          </span>
        </div>

        {/* Institución Asignada */}
        <div className="p-3.5 rounded-xl bg-[var(--color-brand-50)]/70 border border-[var(--color-brand-100)] flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-brand-600)] text-white flex items-center justify-center shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--color-brand-800)] uppercase tracking-wider">
              Institución Responsable
            </p>
            <p className="text-xs font-bold text-slate-900">
              {reclamo.institucionNombre || "Institución Principal de la Ciudad"}
            </p>
          </div>
        </div>

        {/* Barra de Progreso del Reclamo */}
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <p className="text-xs font-bold text-slate-700 mb-2">Avance del reclamo</p>
          <ClaimProgress estado={reclamo.estado} />
        </div>

        {/* Descripción */}
        <div className="mb-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
            Descripción detallada
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {reclamo.descripcion}
          </p>
        </div>

        {/* Imagen si existe */}
        {reclamo.imagen && (
          <div className="mb-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Evidencia fotográfica
            </h3>
            <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <Image
                src={reclamo.imagen}
                alt={reclamo.titulo}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Mensaje de Cancelación o Resolución si aplica */}
        {reclamo.motivo_cancelacion && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 mb-4">
            <p className="text-xs font-bold mb-1">
              Motivo de Cancelación ({reclamo.cancelado_por_tipo === 'ciudadano' ? 'por el Ciudadano' : 'por la Institución'}):
            </p>
            <p className="text-xs text-rose-800 leading-relaxed">{reclamo.motivo_cancelacion}</p>
          </div>
        )}

        {reclamo.mensaje_resolucion && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 mb-4">
            <p className="text-xs font-bold mb-1">
              Mensaje de Resolución Institucional:
            </p>
            <p className="text-xs text-emerald-800 leading-relaxed">{reclamo.mensaje_resolucion}</p>
          </div>
        )}
      </div>

      {/* Historial e Hitos de Auditoría */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <History size={16} className="text-[var(--color-brand-600)]" />
          <span>Historial de seguimiento y auditoría</span>
        </h3>

        {historial.length === 0 ? (
          <p className="text-xs text-slate-500">No hay registros en el historial todavía.</p>
        ) : (
          <div className="relative pl-4 space-y-4 border-l-2 border-slate-200 ml-2">
            {historial.map((ev, index) => (
              <div key={ev.id || index} className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--color-brand-600)] border-2 border-white" />

                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    {ev.tipo_evento}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatearFecha(ev.fecha_creacion)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {ev.detalle || `Evento ${ev.tipo_evento} registrado`}
                </p>

                {ev.autorNombre && (
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <UserCheck size={11} />
                    <span>Por: {ev.autorNombre} ({ev.autorRol || "Usuario"})</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Editar */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Editar Reclamo</h3>
            <p className="text-xs text-slate-500 mb-4">
              Podés actualizar el título y la descripción únicamente mientras el reclamo está en estado Pendiente.
            </p>
            <form onSubmit={handleGuardarEdicion} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título</label>
                <input
                  type="text"
                  value={editForm.titulo}
                  onChange={e => setEditForm(p => ({ ...p, titulo: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--color-brand-600)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                <textarea
                  value={editForm.descripcion}
                  onChange={e => setEditForm(p => ({ ...p, descripcion: e.target.value }))}
                  rows={4}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--color-brand-600)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ubicación</label>
                <input
                  type="text"
                  value={editForm.direccion}
                  onChange={e => setEditForm(p => ({ ...p, direccion: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--color-brand-600)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  disabled={saving}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] rounded-xl transition-colors shadow-xs"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
                  <span>Guardar cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cancelar */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Cancelar Reclamo</h3>
            <p className="text-xs text-slate-500 mb-4">
              ¿Estás seguro de cancelar este reporte? Esta acción marcará el reclamo como cancelado.
            </p>
            <form onSubmit={handleCancelarReclamo} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motivo (opcional)</label>
                <textarea
                  value={motivoCancelacion}
                  onChange={e => setMotivoCancelacion(e.target.value)}
                  placeholder="Ej. El problema ya fue resuelto por los vecinos"
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModal(false)}
                  disabled={saving}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={14} />}
                  <span>Confirmar cancelación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
