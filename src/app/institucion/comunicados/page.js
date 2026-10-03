"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  PlusCircle, CheckCircle, Clock, Eye, EyeOff,
  Pencil, Trash2, AlertTriangle, Loader2, X, ImageIcon, Megaphone
} from "lucide-react";
import apiClient from "@/services/apiClient";
import { uploadImage } from "@/services/uploadService";
import useCategorias from "@/hooks/useCategorias";
import { toast } from "sonner";
import { tiempoRelativo } from "@/utils/dateFormatters";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { CategoryDropdown } from "@/components/ui";

const ESTADO_CONFIG = {
  recibido: { label: "Publicado", cls: "inst-com-badge-publicado", icon: Eye },
  en_proceso: { label: "Publicado", cls: "inst-com-badge-publicado", icon: Eye },
  resuelto: { label: "Publicado", cls: "inst-com-badge-publicado", icon: Eye },
  rechazado: { label: "Borrador", cls: "inst-com-badge-borrador", icon: EyeOff },
  publicado: { label: "Publicado", cls: "inst-com-badge-publicado", icon: Eye },
  Publicado: { label: "Publicado", cls: "inst-com-badge-publicado", icon: Eye },
};

export default function ComunicadosInstitucionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [comunicados, setComunicados] = useState([]);
  const { categorias } = useCategorias("comunicado");
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState("todas");

  // Estado para Edición de Comunicado
  const [comunicadoEditando, setComunicadoEditando] = useState(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editCategoriaId, setEditCategoriaId] = useState("");
  const [editImagenPreview, setEditImagenPreview] = useState(null);
  const [editImagenFile, setEditImagenFile] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Estado para Eliminación de Comunicado
  const [comunicadoAEliminar, setComunicadoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) return;

    apiClient.get(`/comunicados/mis-comunicados?usuario=${session.user.id}`)
      .then(r => r.data)
      .then(comData => {
        if (comData.ok) setComunicados(comData.data);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [session?.user?.id, status]);

  function abrirModalEdicion(com) {
    setComunicadoEditando(com);
    setEditTitulo(com.titulo || "");
    setEditDescripcion(com.descripcion || "");
    setEditCategoriaId(com.categoriaId ? Number(com.categoriaId) : "");
    setEditImagenPreview(com.imagen || null);
    setEditImagenFile(null);
  }

  function cerrarModalEdicion() {
    if (guardando) return;
    if (editImagenPreview && editImagenFile) {
      URL.revokeObjectURL(editImagenPreview);
    }
    setComunicadoEditando(null);
    setEditTitulo("");
    setEditDescripcion("");
    setEditCategoriaId("");
    setEditImagenPreview(null);
    setEditImagenFile(null);
  }

  function handleImagenEdicion(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImagenFile(file);
    setEditImagenPreview(URL.createObjectURL(file));
  }

  function quitarImagenEdicion() {
    if (editImagenPreview && editImagenFile) {
      URL.revokeObjectURL(editImagenPreview);
    }
    setEditImagenFile(null);
    setEditImagenPreview(null);
  }

  async function handleGuardarEdicion(e) {
    e.preventDefault();
    if (!editTitulo.trim()) {
      return toast.error("El título es obligatorio");
    }
    if (!editCategoriaId) {
      return toast.error("Debes seleccionar una categoría");
    }

    setGuardando(true);
    try {
      let finalImagen = editImagenPreview;

      // Si seleccionó un nuevo archivo local, lo subimos
      if (editImagenFile) {
        const upRes = await uploadImage(editImagenFile);
        if (upRes.ok) {
          finalImagen = upRes.url;
        } else {
          toast.error("Error al subir la imagen adjunta");
          setGuardando(false);
          return;
        }
      }

      const payload = {
        titulo: editTitulo.trim(),
        descripcion: editDescripcion.trim() || null,
        id_categoria: Number(editCategoriaId),
        imagen: finalImagen || null,
      };

      const res = await apiClient.put(`/comunicados/${comunicadoEditando.id}`, payload);
      if (res.data?.ok) {
        const catSeleccionada = categorias.find(c => Number(c.id) === Number(editCategoriaId));
        setComunicados(prev => prev.map(c => {
          if (c.id === comunicadoEditando.id) {
            return {
              ...c,
              titulo: payload.titulo,
              descripcion: payload.descripcion,
              categoriaId: payload.id_categoria,
              categoriaNombre: catSeleccionada ? catSeleccionada.nombre : c.categoriaNombre,
              imagen: payload.imagen,
            };
          }
          return c;
        }));
        toast.success("Comunicado actualizado exitosamente");
        cerrarModalEdicion();
      } else {
        toast.error(res.data?.mensaje || "Error al actualizar comunicado");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al actualizar el comunicado");
    } finally {
      setGuardando(false);
    }
  }

  async function handleConfirmarEliminar() {
    if (!comunicadoAEliminar) return;
    setEliminando(true);
    try {
      const res = await apiClient.delete(`/comunicados/${comunicadoAEliminar.id}`);
      if (res.data?.ok) {
        setComunicados(prev => prev.filter(c => c.id !== comunicadoAEliminar.id));
        toast.success("Comunicado eliminado exitosamente");
        setComunicadoAEliminar(null);
      } else {
        toast.error(res.data?.mensaje || "Error al eliminar comunicado");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al eliminar comunicado");
    } finally {
      setEliminando(false);
    }
  }

  const filtrados = filtroCategoria === "todas"
    ? comunicados
    : comunicados.filter(c => String(c.categoriaId) === filtroCategoria);

  return (
    <div className="inst-comunicados-page">
      {/* Header Unificado Comunicados */}
      <PageHeader
        title="Comunicados"
        description="Información oficial emitida por la institución."
        action={
          <button
            className="btn-primary-report shrink-0 cursor-pointer"
            onClick={() => router.push("/institucion/comunicados/nuevo")}
          >
            <PlusCircle size={16} />
            <span>Nuevo comunicado</span>
          </button>
        }
      />

      {/* Barra de Filtros Unificada */}
      <div className="mb-5 rounded-2xl border border-border-subtle bg-surface p-3 sm:px-4 sm:py-3 shadow-2xs">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3 flex-1">
            {/* Filtro por Categoría */}
            <div className="w-full sm:w-auto min-w-[200px]">
              <label className="block text-[11px] font-semibold text-text-muted mb-1">
                Categoría
              </label>
              <CategoryDropdown
                categorias={categorias}
                value={filtroCategoria === "todas" ? null : Number(filtroCategoria)}
                onChange={(catId) => setFiltroCategoria(catId ? String(catId) : "todas")}
                showAllOption={true}
                allOptionLabel="Todas las categorías"
                placeholder="Todas las categorías"
                triggerClassName="w-full sm:w-[220px]"
                menuClassName="left-0 w-full sm:w-[240px]"
              />
            </div>

            {/* Botón Limpiar filtro */}
            {filtroCategoria !== "todas" && (
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => setFiltroCategoria("todas")}
                  className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors bg-surface-subtle text-text-primary hover:bg-border-subtle cursor-pointer border border-border-subtle"
                >
                  <X size={12} className="shrink-0" />
                  <span>Limpiar filtro</span>
                </button>
              </div>
            )}
          </div>

          {/* Contador de resultados */}
          <div className="text-xs text-text-muted shrink-0 pb-1.5 font-medium">
            {filtrados.length === 1
              ? "1 comunicado oficial"
              : `${filtrados.length} comunicados oficiales`}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="inst-loading">Cargando comunicados...</div>
      ) : filtrados.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={filtroCategoria !== "todas" ? "Sin comunicados en esta categoría" : "No hay comunicados publicados"}
          description={filtroCategoria !== "todas" ? "Probá seleccionando otra categoría o emití un nuevo comunicado oficial." : "Tu institución todavía no publicó avisos o comunicados para la comunidad."}
          actionLabel={filtroCategoria !== "todas" ? "Limpiar filtro" : "Crear comunicado"}
          onAction={filtroCategoria !== "todas" ? () => setFiltroCategoria("todas") : () => router.push("/institucion/comunicados/nuevo")}
        />
      ) : (
        <div className="inst-comunicados-list">
          {filtrados.map(com => {
            const estadoConf = ESTADO_CONFIG[com.estado] ?? ESTADO_CONFIG.publicado;
            const Icon = estadoConf.icon;
            return (
              <article key={com.id} className="inst-com-card flex flex-col justify-between">
                <div>
                  <div className="inst-com-card-top flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inst-com-badge ${estadoConf.cls}`}>
                        <Icon size={12} /> {estadoConf.label}
                      </span>
                      {com.categoriaNombre && (
                        <span className="inst-com-categoria">{com.categoriaNombre}</span>
                      )}
                    </div>

                    {/* Botonera de Gestión Institucional */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => abrirModalEdicion(com)}
                        className="p-1.5 text-text-muted hover:text-primary hover:bg-surface-subtle rounded-lg transition-colors cursor-pointer"
                        title="Editar comunicado"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setComunicadoAEliminar(com)}
                        className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar comunicado"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 className="inst-com-title text-base font-bold text-text-primary mb-1.5">{com.titulo}</h3>

                  {com.imagen && (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border-subtle my-2.5 bg-surface-subtle">
                      <Image src={com.imagen} alt={com.titulo} fill unoptimized className="object-cover" />
                    </div>
                  )}

                  {com.descripcion && (
                    <p className="inst-com-desc text-xs text-text-secondary line-clamp-3 leading-relaxed mb-3">
                      {com.descripcion}
                    </p>
                  )}
                </div>

                <div className="inst-com-footer pt-2.5 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted mt-2">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>{tiempoRelativo(com.fecha_creacion)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => abrirModalEdicion(com)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal para Editar Comunicado */}
      {comunicadoEditando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={cerrarModalEdicion}
        >
          <div
            className="w-full max-w-lg bg-surface rounded-2xl p-6 shadow-xl border border-border-subtle animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Pencil size={18} className="text-primary" />
                <h3 className="text-base font-bold text-text-primary">Editar Comunicado</h3>
              </div>
              <button
                type="button"
                onClick={cerrarModalEdicion}
                disabled={guardando}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Título del comunicado <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitulo}
                  onChange={e => setEditTitulo(e.target.value)}
                  maxLength={200}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border-subtle focus:outline-hidden focus:border-primary bg-surface"
                  placeholder="Título oficial del comunicado..."
                  required
                />
                <div className="flex justify-end text-[10px] text-text-muted mt-1">
                  {editTitulo.length}/200
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Categoría <span className="text-rose-500">*</span>
                </label>
                <CategoryDropdown
                  categorias={categorias}
                  value={editCategoriaId ? Number(editCategoriaId) : null}
                  onChange={(catId) => setEditCategoriaId(catId ? Number(catId) : "")}
                  placeholder="Seleccioná una categoría..."
                  triggerClassName="w-full"
                  menuClassName="left-0 w-full"
                />
              </div>

              {/* Contenido / Descripción */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Contenido o Detalle
                </label>
                <textarea
                  value={editDescripcion}
                  onChange={e => setEditDescripcion(e.target.value)}
                  rows={4}
                  className="w-full text-sm p-3.5 rounded-xl border border-border-subtle focus:outline-hidden focus:border-primary bg-surface resize-none leading-relaxed"
                  placeholder="Informá con claridad a los vecinos..."
                />
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Imagen o Banner <span className="text-text-muted font-normal">(Opcional)</span>
                </label>
                {editImagenPreview ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border-subtle bg-surface-subtle group">
                    <Image src={editImagenPreview} alt="Preview" fill unoptimized className="object-cover" />
                    <button
                      type="button"
                      onClick={quitarImagenEdicion}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Quitar imagen"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border border-dashed border-border-subtle hover:border-primary/50 bg-surface-subtle/50 cursor-pointer transition-colors">
                    <ImageIcon size={24} className="text-text-muted" />
                    <span className="text-xs text-text-secondary font-medium">Hacé clic para adjuntar imagen</span>
                    <span className="text-[10px] text-text-muted">JPG, PNG o WebP hasta 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImagenEdicion}
                    />
                  </label>
                )}
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={cerrarModalEdicion}
                  disabled={guardando}
                  className="px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-subtle rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando || !editTitulo.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-[var(--color-brand-700)] rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {guardando ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar cambios</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar Comunicado */}
      {comunicadoAEliminar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => !eliminando && setComunicadoAEliminar(null)}
        >
          <div
            className="w-full max-w-sm bg-surface rounded-2xl p-5 shadow-xl border border-border-subtle animate-in fade-in zoom-in duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-rose-600 mb-2">
              <AlertTriangle size={20} />
              <h3 className="text-sm font-bold">¿Eliminar comunicado?</h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              Estás a punto de eliminar <strong className="text-text-primary">&ldquo;{comunicadoAEliminar.titulo}&rdquo;</strong>.
              Esta publicación desaparecerá inmediatamente del feed público y de tu panel. Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setComunicadoAEliminar(null)}
                disabled={eliminando}
                className="px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-subtle rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                disabled={eliminando}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {eliminando ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Sí, eliminar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
