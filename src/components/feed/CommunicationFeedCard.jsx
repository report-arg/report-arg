"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, Share2, X, Building2 } from "lucide-react";
import { OfficialCommIcon, getCategoryIcon } from "@/components/brand/icons";
import { fechaExacta } from "@/utils/dateFormatters";
import { toast } from "sonner";
import BaseFeedCard from "./BaseFeedCard";
import ImageViewer from "@/components/ui/ImageViewer";

function iniciales(nombre) {
  if (!nombre) return "I";
  return nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

async function compartirComunicado({ titulo, descripcion, id }) {
  const url = `${window.location.origin}${window.location.pathname}?comunicado=${id}`;
  const text = descripcion ? descripcion.slice(0, 100) : titulo;

  if (navigator.share) {
    try {
      await navigator.share({ title: titulo, text, url });
    } catch {
      /* cancelado por el usuario */
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    toast.success("¡Enlace al comunicado copiado!");
  } catch {
    prompt("Copiá el enlace:", url);
  }
}

export default function CommunicationFeedCard({ item, priorityImage }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [lightboxAbierto, setLightboxAbierto] = useState(false);

  const fechaCompleta = fechaExacta(item.fecha_creacion);
  const CategoryIcon = getCategoryIcon(item.categoriaCodigo || item.categoriaNombre, item.categoriaNombre);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    if (!modalAbierto) return;
    function onKeyDown(e) {
      if (e.key === "Escape") setModalAbierto(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalAbierto]);

  const Subtitle = (
    <span title={fechaCompleta}>{fechaCompleta}</span>
  );

  // Identificación única y clara de Comunicado oficial en cabecera
  const HeaderActions = (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-subtle text-primary border border-primary/20 text-[10px] font-semibold shrink-0">
      <OfficialCommIcon size={10} />
      <span>Comunicado oficial</span>
    </span>
  );

  const Badges = item.categoriaNombre && (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface text-text-secondary text-[10px] font-semibold border border-border-subtle">
      <CategoryIcon size={11} className="text-primary shrink-0" />
      <span>{item.categoriaNombre}</span>
    </span>
  );

  const Footer = (
    <div className="flex items-center justify-between w-full">
      <button
        type="button"
        onClick={() => setModalAbierto(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary-subtle transition-colors cursor-pointer"
      >
        <Eye size={14} />
        <span>Ver comunicado</span>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          compartirComunicado({ titulo: item.titulo, descripcion: item.descripcion, id: item.id });
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface transition-colors cursor-pointer"
        title="Compartir comunicado"
      >
        <Share2 size={13} />
        <span>Compartir</span>
      </button>
    </div>
  );

  return (
    <>
      <BaseFeedCard
        customSurfaceClass="bg-official-surface/60 border-official-border shadow-xs hover:shadow-sm"
        avatarSrc={item.autorFoto}
        avatarFallback={iniciales(item.autorNombre)}
        title={item.autorNombre || "Institución Oficial"}
        subtitle={Subtitle}
        headerActions={HeaderActions}
        onClickBody={() => setModalAbierto(true)}
        bodyTitle={item.titulo}
        bodyDescription={item.descripcion}
        badges={Badges}
        imageSrc={item.imagen}
        priorityImage={priorityImage}
        footer={Footer}
      />

      {/* Modal accesible para leer el comunicado completo */}
      {modalAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={item.titulo}
          onClick={() => setModalAbierto(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[90vh] bg-surface rounded-2xl border border-border-subtle shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
          >
            {/* Header del modal */}
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-subtle text-text-secondary text-xs font-bold flex items-center justify-center relative overflow-hidden border border-border-subtle shrink-0">
                  {item.autorFoto ? (
                    <Image src={item.autorFoto} alt={item.autorNombre || "Institución"} fill unoptimized className="object-cover" />
                  ) : (
                    iniciales(item.autorNombre)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-text-primary">
                      {item.autorNombre || "Institución Oficial"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-subtle text-primary border border-primary/20 text-[10px] font-semibold">
                      <OfficialCommIcon size={10} />
                      <span>Oficial</span>
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{fechaCompleta}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
                aria-label="Cerrar comunicado"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {item.categoriaNombre && (
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-subtle text-text-secondary text-xs font-semibold border border-border-subtle">
                    <CategoryIcon size={12} className="text-primary shrink-0" />
                    <span>{item.categoriaNombre}</span>
                  </span>
                </div>
              )}

              <h2 className="text-lg sm:text-xl font-bold text-text-primary leading-snug">
                {item.titulo}
              </h2>

              {/* Imagen con opción de ampliar */}
              {item.imagen && (
                <div
                  onClick={() => setLightboxAbierto(true)}
                  role="button"
                  tabIndex={0}
                  className="relative w-full rounded-xl overflow-hidden border border-border-subtle bg-surface-subtle/60 flex items-center justify-center cursor-zoom-in group"
                  style={{ maxHeight: "360px" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    className="w-full h-auto max-h-[360px] object-contain rounded-xl group-hover:scale-[1.01] transition-transform"
                  />
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-md bg-black/65 text-white text-[10px] font-semibold flex items-center gap-1 pointer-events-none">
                    <span>Ampliar foto</span>
                  </div>
                </div>
              )}

              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {item.descripcion}
              </div>
            </div>

            {/* Footer del modal */}
            <div className="p-3.5 sm:p-4 bg-surface-subtle border-t border-border-subtle flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => compartirComunicado({ titulo: item.titulo, descripcion: item.descripcion, id: item.id })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-primary hover:bg-surface transition-colors cursor-pointer border border-border-subtle shadow-xs"
              >
                <Share2 size={13} />
                <span>Compartir</span>
              </button>

              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox para imagen del modal */}
      {lightboxAbierto && item.imagen && (
        <ImageViewer
          isOpen={lightboxAbierto}
          onClose={() => setLightboxAbierto(false)}
          src={item.imagen}
          alt={item.titulo}
          titulo={item.titulo}
        />
      )}
    </>
  );
}
