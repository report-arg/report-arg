"use client";

import { useEffect, useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

/**
 * Visor modal / lightbox reutilizable para imágenes completas.
 * Preserva proporción original, restringe al viewport, maneja errores de carga y soporta Escape/click afuera.
 */
export default function ImageViewer({
  isOpen,
  onClose,
  src,
  alt = "Imagen adjunta",
  titulo = "Foto adjunta"
}) {
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);

  // Cerrar al pulsar Escape y prevenir scroll de fondo
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Resetear estados al cambiar la URL o abrir
  useEffect(() => {
    if (isOpen) {
      setCargando(true);
      setErrorCarga(false);
    }
  }, [isOpen, src]);

  if (!isOpen || !src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-150"
      >
        {/* Barra superior con título y botón de cierre */}
        <div className="w-full flex items-center justify-between pb-2.5 px-1 text-white">
          <span className="text-xs font-semibold tracking-wide drop-shadow-xs">
            {titulo}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar visor de imagen"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-white/50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenedor de la imagen */}
        <div className="relative w-full flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-white/10 p-2 sm:p-4 min-h-[220px]">
          {/* Spinner mientras carga */}
          {cargando && !errorCarga && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80">
              <Loader2 size={28} className="animate-spin text-primary" />
              <span className="text-xs">Cargando imagen...</span>
            </div>
          )}

          {/* Estado de error controlado */}
          {errorCarga ? (
            <div className="py-12 px-6 text-center text-white/90 max-w-sm">
              <AlertTriangle size={36} className="mx-auto mb-2 text-amber-400" />
              <p className="text-sm font-bold">No se pudo cargar la imagen</p>
              <p className="text-xs text-white/70 mt-1 mb-4 leading-relaxed">
                El archivo no está disponible, fue eliminado o el enlace no es accesible.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Cerrar visor
              </button>
            </div>
          ) : (
            /* Imagen en proporción original sin deformar ni recortar */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={src}
              alt={alt}
              onLoad={() => setCargando(false)}
              onError={() => {
                setCargando(false);
                setErrorCarga(true);
              }}
              className={`max-w-full max-h-[78vh] object-contain rounded-lg shadow-2xl transition-opacity duration-200 ${
                cargando ? "opacity-0" : "opacity-100"
              }`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
