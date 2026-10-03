"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, MapPin, Camera, X, Check,
  Loader2, Globe, Lock
} from "lucide-react";
import apiClient from "@/services/apiClient";
import { uploadImage } from "@/services/uploadService";
import { getCategoryIcon } from "@/components/brand/icons";
import { toast } from "sonner";
import useCategorias from "@/hooks/useCategorias";
import { CategoryDropdown } from "@/components/ui";

export default function NuevoReclamoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const fileInputRef = useRef(null);
  const tituloRef = useRef(null);
  const descRef = useRef(null);
  const catContainerRef = useRef(null);
  const dirRef = useRef(null);

  // Obtener categorías directamente desde el backend en tiempo real (con resolución de institución dinámica)
  const { categorias, loading: loadingCats } = useCategorias("reclamo", true);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    id_categoria: null,
    direccion: "",
    visibilidad: "publico"
  });
  const [coords, setCoords] = useState({ latitud: null, longitud: null });
  const [fotos, setFotos] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Derivación dinámica de la institución responsable provista por el backend según la categoría seleccionada
  const categoriaSeleccionada = categorias.find(c => c.id === form.id_categoria);
  const institucionResponsable = categoriaSeleccionada?.institucion_responsable || null;

  async function subirFotos(files) {
    if (fotos.length >= 1) {
      toast.info("Actualmente se admite 1 imagen principal de evidencia.");
      return;
    }
    const file = files[0];
    if (!file) return;

    // Validación de tipo y tamaño (máx 5MB)
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo seleccionado no es una imagen válida.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5 MB.");
      return;
    }

    const preview = URL.createObjectURL(file);
    const nuevaFoto = { preview, url: null, uploading: true, file };
    setFotos([nuevaFoto]);

    try {
      const data = await uploadImage(file);
      if (data.ok) {
        setFotos([{ preview, url: data.url, uploading: false, file }]);
      } else {
        toast.error("Error al subir la imagen.");
        setFotos([]);
      }
    } catch {
      toast.error("No se pudo subir la imagen.");
      setFotos([]);
    }
  }

  function eliminarFoto() {
    setFotos([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleGeo() {
    if (!navigator.geolocation) {
      toast.error("La geolocalización no está soportada en tu navegador.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "es" } }
          );
          const data = await res.json();
          const addr = data.display_name || `${latitude}, ${longitude}`;
          setForm(p => ({ ...p, direccion: addr }));
          setCoords({ latitud: latitude, longitud: longitude });
          setFieldErrors(p => ({ ...p, direccion: "" }));
        } catch {
          setForm(p => ({ ...p, direccion: `${latitude}, ${longitude}` }));
          setCoords({ latitud: latitude, longitud: longitude });
          setFieldErrors(p => ({ ...p, direccion: "" }));
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        toast.error("No se pudo obtener la ubicación automáticamente.");
        setGeoLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  function validar() {
    const errs = {};
    if (!form.titulo.trim()) {
      errs.titulo = "El título es obligatorio.";
    } else if (form.titulo.trim().length < 5) {
      errs.titulo = "El título debe tener al menos 5 caracteres.";
    }

    if (!form.descripcion.trim()) {
      errs.descripcion = "La descripción es obligatoria.";
    } else if (form.descripcion.trim().length < 10) {
      errs.descripcion = "Describí el problema con más detalle (mínimo 10 caracteres).";
    }

    if (!form.id_categoria) {
      errs.categoria = "Seleccioná una categoría.";
    }

    if (!form.direccion.trim()) {
      errs.direccion = "Ingresá la ubicación del problema.";
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const errs = validar();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      // Foco automático en el primer campo inválido
      if (errs.titulo) {
        tituloRef.current?.focus();
      } else if (errs.descripcion) {
        descRef.current?.focus();
      } else if (errs.categoria) {
        catContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        const firstCatBtn = catContainerRef.current?.querySelector("button");
        firstCatBtn?.focus();
      } else if (errs.direccion) {
        dirRef.current?.focus();
      }
      return;
    }
    setFieldErrors({});

    if (!session?.user?.id) {
      return setError("Tu sesión expiró, volvé a iniciar sesión.");
    }

    setSubmitting(true);
    try {
      const urlImagen = fotos[0]?.url || null;
      const res = await apiClient.post(`/reclamos`, {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        id_categoria: form.id_categoria,
        direccion: form.direccion.trim(),
        latitud: coords.latitud,
        longitud: coords.longitud,
        visibilidad: form.visibilidad,
        imagen_url: urlImagen,
      });
      const data = res.data;
      if (data.ok) {
        toast.success("¡Reclamo creado exitosamente!");
        router.push("/ciudadano/reclamos");
      } else {
        setError(data.mensaje || "Error al crear el reclamo.");
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al enviar el reclamo. Intentá de nuevo.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return null;

  return (
    <div className="w-full max-w-4xl mx-auto py-2 sm:py-4 pb-20 sm:pb-8">
      {/* Contenedor principal del formulario integrado */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs p-5 sm:p-7 md:p-8">
        
        {/* 1. Encabezado integrado dentro de la card */}
        <div className="mb-5 pb-4 border-b border-border-subtle">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer mb-3"
            aria-label="Volver a la pantalla anterior"
          >
            <ArrowLeft size={14} />
            <span>Volver</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Reportar un problema
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
            Contanos qué pasó para poder derivarlo a la institución correspondiente.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          
          {/* 2. Título */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="campo-titulo" className="text-xs font-semibold text-text-primary">
                Título <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-text-muted">
                {form.titulo.length}/120
              </span>
            </div>
            <input
              id="campo-titulo"
              ref={tituloRef}
              className={`w-full text-xs sm:text-sm p-3 rounded-xl border bg-surface transition-colors text-text-primary placeholder:text-slate-400 placeholder:font-normal dark:placeholder:text-slate-500 font-medium focus:outline-hidden ${
                fieldErrors.titulo
                  ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100"
                  : "border-border-subtle hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
              placeholder="Ej. Luminaria rota en San Martín y Belgrano"
              value={form.titulo}
              onChange={e => {
                setForm(p => ({ ...p, titulo: e.target.value }));
                if (fieldErrors.titulo) setFieldErrors(p => ({ ...p, titulo: "" }));
              }}
              maxLength={120}
              aria-invalid={Boolean(fieldErrors.titulo)}
            />
            {fieldErrors.titulo && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                {fieldErrors.titulo}
              </p>
            )}
          </div>

          {/* 2. Descripción */}
          <div>
            <label htmlFor="campo-descripcion" className="block text-xs font-semibold text-text-primary mb-1.5">
              Descripción <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="campo-descripcion"
              ref={descRef}
              rows={3}
              className={`w-full text-xs sm:text-sm p-3 rounded-xl border bg-surface transition-colors resize-y leading-relaxed text-text-primary placeholder:text-slate-400 placeholder:font-normal dark:placeholder:text-slate-500 font-medium focus:outline-hidden ${
                fieldErrors.descripcion
                  ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100"
                  : "border-border-subtle hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
              placeholder="Detallá qué ocurre, puntos de referencia u horarios..."
              value={form.descripcion}
              onChange={e => {
                setForm(p => ({ ...p, descripcion: e.target.value }));
                if (fieldErrors.descripcion) setFieldErrors(p => ({ ...p, descripcion: "" }));
              }}
              aria-invalid={Boolean(fieldErrors.descripcion)}
            />
            {fieldErrors.descripcion && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                {fieldErrors.descripcion}
              </p>
            )}
          </div>

          {/* 3. Visibilidad (Público / Privado compactos) */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Visibilidad <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Visibilidad del reclamo">
              {/* Opción Público */}
              <div
                role="radio"
                aria-checked={form.visibilidad === "publico"}
                tabIndex={0}
                onClick={() => setForm(p => ({ ...p, visibilidad: "publico" }))}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setForm(p => ({ ...p, visibilidad: "publico" }));
                  }
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left flex items-start gap-3 select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                  form.visibilidad === "publico"
                    ? "bg-primary-subtle/50 border-primary shadow-2xs"
                    : "bg-surface border-border-subtle hover:border-border-strong hover:bg-surface-subtle/40"
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${
                  form.visibilidad === "publico" ? "bg-primary text-white" : "bg-surface-subtle text-text-muted"
                }`}>
                  <Globe size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      form.visibilidad === "publico" ? "text-primary" : "text-text-primary"
                    }`}>
                      Público
                    </span>
                    {form.visibilidad === "publico" && (
                      <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check size={10} />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary leading-snug mt-1">
                    Visible para otros vecinos.
                  </p>
                </div>
              </div>

              {/* Opción Privado */}
              <div
                role="radio"
                aria-checked={form.visibilidad === "privado"}
                tabIndex={0}
                onClick={() => setForm(p => ({ ...p, visibilidad: "privado" }))}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setForm(p => ({ ...p, visibilidad: "privado" }));
                  }
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left flex items-start gap-3 select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                  form.visibilidad === "privado"
                    ? "bg-surface-subtle border-text-primary shadow-2xs dark:border-slate-400"
                    : "bg-surface border-border-subtle hover:border-border-strong hover:bg-surface-subtle/40"
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${
                  form.visibilidad === "privado" ? "bg-text-primary text-surface dark:bg-slate-200 dark:text-slate-900" : "bg-surface-subtle text-text-muted"
                }`}>
                  <Lock size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">
                      Privado
                    </span>
                    {form.visibilidad === "privado" && (
                      <span className="w-4 h-4 rounded-full bg-text-primary text-surface flex items-center justify-center dark:bg-slate-200 dark:text-slate-900">
                        <Check size={10} />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary leading-snug mt-1">
                    Solo visible para vos y la institución responsable.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Categoría (Componente modular y reutilizable CategoryDropdown) */}
          <div ref={catContainerRef}>
            <label htmlFor="campo-categoria" className="block text-xs font-semibold text-text-primary mb-1.5">
              Categoría <span className="text-rose-500">*</span>
            </label>

            <CategoryDropdown
              id="campo-categoria"
              categorias={categorias}
              value={form.id_categoria}
              onChange={(id) => {
                setForm(p => ({ ...p, id_categoria: id }));
                if (fieldErrors.categoria) setFieldErrors(p => ({ ...p, categoria: "" }));
              }}
              error={fieldErrors.categoria}
              loading={loadingCats}
              placeholder="Seleccioná una categoría..."
            />

            {fieldErrors.categoria && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 font-medium">
                {fieldErrors.categoria}
              </p>
            )}
          </div>

          {/* 5. Ubicación */}
          <div>
            <label htmlFor="campo-ubicacion" className="block text-xs font-semibold text-text-primary mb-1.5">
              Ubicación exacta <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin size={15} className="absolute left-3 top-3 text-text-muted pointer-events-none" />
                <input
                  id="campo-ubicacion"
                  ref={dirRef}
                  className={`w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border bg-surface transition-colors text-text-primary placeholder:text-slate-400 placeholder:font-normal dark:placeholder:text-slate-500 font-medium focus:outline-hidden ${
                    fieldErrors.direccion
                      ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100"
                      : "border-border-subtle hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                  placeholder="Calle y número o intersección"
                  value={form.direccion}
                  onChange={e => {
                    setForm(p => ({ ...p, direccion: e.target.value }));
                    if (fieldErrors.direccion) setFieldErrors(p => ({ ...p, direccion: "" }));
                  }}
                  aria-invalid={Boolean(fieldErrors.direccion)}
                />
              </div>
              <button
                type="button"
                onClick={handleGeo}
                disabled={geoLoading}
                className="p-2.5 rounded-xl bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-border-subtle transition-colors cursor-pointer shrink-0"
                title="Detectar mi ubicación actual"
                aria-label="Detectar mi ubicación actual con GPS"
              >
                {geoLoading ? <Loader2 size={16} className="animate-spin text-primary" /> : <MapPin size={16} />}
              </button>
            </div>
            {fieldErrors.direccion && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                {fieldErrors.direccion}
              </p>
            )}
          </div>

          {/* 6. Foto (Opcional y Compacta) */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Foto <span className="text-text-muted font-normal">(opcional)</span>
            </label>

            {fotos.length === 0 ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className="flex items-center justify-between p-3 rounded-xl border border-dashed border-border-strong hover:border-primary hover:bg-primary-subtle/20 bg-surface-subtle/30 cursor-pointer transition-all group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Agregar foto de evidencia"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-muted group-hover:text-primary border border-border-subtle transition-colors">
                    <Camera size={15} />
                  </div>
                  <span className="text-xs font-semibold text-text-primary group-hover:text-primary transition-colors">
                    Agregar foto
                  </span>
                </div>
                <span className="text-[11px] text-text-muted font-medium">
                  JPG/PNG · Máx. 5 MB
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-border-subtle bg-surface-subtle/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border-subtle shrink-0 bg-surface">
                    <Image
                      src={fotos[0].preview}
                      alt="Vista previa de evidencia"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    {fotos[0].uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                        <Loader2 size={16} className="animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">
                      {fotos[0].file?.name || "Foto de evidencia adjunta"}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {fotos[0].uploading ? "Subiendo foto..." : "Foto lista para adjuntar"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={fotos[0].uploading}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-border-subtle transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={eliminarFoto}
                    disabled={fotos[0].uploading}
                    className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                    title="Eliminar foto"
                    aria-label="Eliminar foto adjunta"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => subirFotos(e.target.files)}
            />
          </div>

          {/* Mensaje de error general de la API */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* 7. Resumen sutil antes de enviar con institución dinámica */}
          <div className="pt-2 border-t border-border-subtle/70">
            <div className="flex items-start gap-2.5 text-text-muted mb-4 transition-all">
              {form.visibilidad === "publico" ? (
                <>
                  <Globe size={14} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] sm:text-xs leading-relaxed">
                    {institucionResponsable ? (
                      <>
                        Este reclamo será <span className="font-semibold text-text-primary">público</span> y será gestionado por{" "}
                        <span className="font-semibold text-text-primary">{institucionResponsable}</span>.
                        <span className="hidden sm:inline text-text-muted"> Visible para otros vecinos.</span>
                      </>
                    ) : (
                      <>
                        Este reclamo será <span className="font-semibold text-text-primary">público</span> y será asignado automáticamente a la institución responsable.
                      </>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <Lock size={14} className="text-text-muted shrink-0 mt-0.5" />
                  <p className="text-[11px] sm:text-xs leading-relaxed">
                    {institucionResponsable ? (
                      <>
                        Este reclamo será <span className="font-semibold text-text-primary">privado</span> y será gestionado por{" "}
                        <span className="font-semibold text-text-primary">{institucionResponsable}</span>. Solo podrán verlo vos y la institución responsable.
                      </>
                    ) : (
                      <>
                        Este reclamo será <span className="font-semibold text-text-primary">privado</span> y será asignado automáticamente a la institución responsable. Solo podrán verlo vos y la institución responsable.
                      </>
                    )}
                  </p>
                </>
              )}
            </div>

            {/* 8. Botón final Enviar reclamo */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-[var(--color-brand-700)] active:bg-[var(--color-brand-800)] transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Enviando reclamo...</span>
                  </>
                ) : (
                  <span>Enviar reclamo</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
