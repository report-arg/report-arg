"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, MapPin, Camera, X, Check,
  Loader2, Globe, Lock
} from "lucide-react";
import apiClient from "@/services/apiClient";
import { uploadImage } from "@/services/uploadService";
import { getCategoryIcon, REAL_CATEGORIES, ReportProblemIcon } from "@/components/brand/icons";
import { toast } from "sonner";

export default function NuevoReclamoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const inputRef = useRef(null);

  const [categorias, setCategorias] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
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

  useEffect(() => {
    apiClient.get(`/reclamos/categorias`)
      .then(r => r.data)
      .then(d => { if (d.ok) setCategorias(d.data || []); })
      .catch(() => {})
      .finally(() => setLoadingCats(false));
  }, []);

  async function subirFotos(files) {
    if (fotos.length >= 1) {
      toast.info("Actualmente se admite 1 imagen principal de evidencia.");
      return;
    }
    const file = files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    const nuevaFoto = { preview, url: null, uploading: true, file };
    setFotos([nuevaFoto]);

    try {
      const data = await uploadImage(file);
      if (data.ok) {
        setFotos([{ preview, url: data.url, uploading: false }]);
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
  }

  function handleGeo() {
    if (!navigator.geolocation) return;
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
        } catch {
          setForm(p => ({ ...p, direccion: `${latitude}, ${longitude}` }));
          setCoords({ latitud: latitude, longitud: longitude });
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        toast.error("No se pudo obtener la ubicación automáticamente.");
        setGeoLoading(false);
      }
    );
  }

  function validar() {
    const errs = {};
    if (!form.titulo.trim()) errs.titulo = "El título es obligatorio.";
    else if (form.titulo.trim().length < 5) errs.titulo = "El título debe tener al menos 5 caracteres.";

    if (!form.descripcion.trim()) errs.descripcion = "La descripción es obligatoria.";
    else if (form.descripcion.trim().length < 10) errs.descripcion = "Describí el problema con más detalle (mínimo 10 caracteres).";

    if (!form.id_categoria) errs.categoria = "Seleccioná una categoría.";

    if (!form.direccion.trim()) errs.direccion = "Ingresá la ubicación del problema.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const errs = validar();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    if (!session?.user?.id) return setError("Tu sesión expiró, volvé a iniciar sesión.");

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
        toast.success("¡Problema reportado exitosamente!");
        router.push("/home/reclamos");
      } else {
        setError(data.mensaje || "Error al publicar el reporte.");
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al enviar el reporte. Intentá de nuevo.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/80">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          title="Volver"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Reportar un problema
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingresá los datos del problema detectado para informar a las instituciones
          </p>
        </div>
      </div>

      {/* Formulario principal */}
      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-5">

        {/* Título */}
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1">
            Título del problema <span className="text-rose-500">*</span>
          </label>
          <input
            className={`w-full text-xs p-3 rounded-xl border transition-all text-slate-900 placeholder:text-slate-500 font-medium ${
              fieldErrors.titulo ? "border-rose-400 bg-rose-50/30" : "border-slate-300 focus:border-[var(--color-brand-600)]"
            }`}
            placeholder="Ej. Luminaria sin funcionar en esquina San Martín y Belgrano"
            value={form.titulo}
            onChange={e => { setForm(p => ({ ...p, titulo: e.target.value })); setFieldErrors(p => ({ ...p, titulo: "" })); }}
            maxLength={120}
          />
          {fieldErrors.titulo && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.titulo}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1">
            Descripción detallada <span className="text-rose-500">*</span>
          </label>
          <textarea
            className={`w-full text-xs p-3 rounded-xl border transition-all text-slate-900 placeholder:text-slate-500 font-medium ${
              fieldErrors.descripcion ? "border-rose-400 bg-rose-50/30" : "border-slate-300 focus:border-[var(--color-brand-600)]"
            }`}
            placeholder="Explicá lo que ocurre con precisión (referencias, horarios, afectación)..."
            value={form.descripcion}
            onChange={e => { setForm(p => ({ ...p, descripcion: e.target.value })); setFieldErrors(p => ({ ...p, descripcion: "" })); }}
            rows={4}
          />
          {fieldErrors.descripcion && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.descripcion}</p>}
        </div>

        {/* Selector de Visibilidad (Público vs Privado) */}
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1.5">
            Tipo de visibilidad <span className="text-rose-500">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setForm(p => ({ ...p, visibilidad: "publico" }))}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                form.visibilidad === "publico"
                  ? "bg-[var(--color-brand-50)]/60 border-[var(--color-brand-600)] shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand-800)]">
                  <Globe size={15} className="text-[var(--color-brand-600)]" />
                  <span>Reporte Público</span>
                </span>
                {form.visibilidad === "publico" && (
                  <span className="w-4 h-4 rounded-full bg-[var(--color-brand-600)] text-white flex items-center justify-center text-[10px]">
                    <Check size={10} />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Visible en el feed de la ciudad para que otros vecinos puedan ver el problema.
              </p>
            </div>

            <div
              onClick={() => setForm(p => ({ ...p, visibilidad: "privado" }))}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                form.visibilidad === "privado"
                  ? "bg-slate-100 border-slate-800 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Lock size={15} className="text-slate-700" />
                  <span>Reporte Privado</span>
                </span>
                {form.visibilidad === "privado" && (
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                    <Check size={10} />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Información sensible. Su ubicación y datos se resguardan y solo los gestiona la institución.
              </p>
            </div>
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1.5">
            Categoría <span className="text-rose-500">*</span>
          </label>

          {loadingCats ? (
            <p className="text-xs text-slate-500 py-2">Cargando categorías...</p>
          ) : (
            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2.5 ${fieldErrors.categoria ? "p-1 border border-rose-400 rounded-xl bg-rose-50/20" : ""}`}>
              {categorias.map(cat => {
                const CategoryIcon = getCategoryIcon(cat.codigo || cat.nombre, cat.nombre);
                const isSelected = form.id_categoria === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setForm(p => ({ ...p, id_categoria: cat.id })); setFieldErrors(p => ({ ...p, categoria: "" })); }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[var(--color-brand-50)] border-[var(--color-brand-600)] text-[var(--color-brand-900)] shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-[var(--color-brand-600)] text-white" : "bg-slate-100 text-slate-600"}`}>
                        <CategoryIcon size={16} />
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[var(--color-brand-600)] text-white flex items-center justify-center text-[10px]">
                          <Check size={10} />
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold leading-tight truncate">
                      {cat.nombre}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {fieldErrors.categoria && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.categoria}</p>}
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1">
            Ubicación exacta <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <MapPin size={15} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                className={`w-full text-xs pl-9 pr-3 py-3 rounded-xl border transition-all text-slate-900 placeholder:text-slate-500 font-medium ${
                  fieldErrors.direccion ? "border-rose-400 bg-rose-50/30" : "border-slate-300 focus:border-[var(--color-brand-600)]"
                }`}
                placeholder="Calle y número o intersección"
                value={form.direccion}
                onChange={e => { setForm(p => ({ ...p, direccion: e.target.value })); setFieldErrors(p => ({ ...p, direccion: "" })); }}
              />
            </div>
            <button
              type="button"
              onClick={handleGeo}
              disabled={geoLoading}
              className="p-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              title="Usar geolocalización"
            >
              {geoLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
            </button>
          </div>
          {fieldErrors.direccion && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.direccion}</p>}
        </div>

        {/* Evidencia Fotográfica */}
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1">
            Foto de evidencia <span className="text-slate-400 font-normal">(opcional)</span>
          </label>

          {fotos.length === 0 ? (
            <div
              onClick={() => inputRef.current?.click()}
              className="p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-[var(--color-brand-400)] bg-slate-50/50 hover:bg-[var(--color-brand-50)]/30 text-center cursor-pointer transition-all"
            >
              <Camera size={26} className="mx-auto mb-1.5 text-slate-400" />
              <p className="text-xs font-bold text-slate-700">Subir foto de la situación</p>
              <p className="text-[11px] text-slate-400 mt-0.5">JPG o PNG. Máximo 5MB.</p>
            </div>
          ) : (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
              <Image src={fotos[0].preview} alt="evidencia" fill unoptimized className="object-cover" />
              {fotos[0].uploading && (
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={eliminarFoto}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
                title="Eliminar foto"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => subirFotos(e.target.files)}
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> Publicando reporte...</>
            ) : (
              <><ReportProblemIcon size={16} /> Publicar reporte ciudadano</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
