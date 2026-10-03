"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Maximize2 } from "lucide-react";
import ImageViewer from "@/components/ui/ImageViewer";

export default function BaseFeedCard({
  avatarSrc,
  avatarFallback,
  title,
  subtitle,
  headerBadge,
  headerActions,
  onClickBody,
  bodyTitle,
  bodyDescription,
  badges,
  imageSrc,
  priorityImage = false,
  extraContent,
  footer,
  expandedPanel,
  customSurfaceClass = "bg-surface border-border-subtle hover:border-primary shadow-xs hover:shadow-sm"
}) {
  const [expandido, setExpandido] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  return (
    <article className={`mb-3.5 rounded-xl border transition-all overflow-hidden ${customSurfaceClass}`}>
      {/* Header */}
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-2.5 border-b border-border-subtle flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-surface-subtle text-text-secondary text-[10px] font-bold flex items-center justify-center relative overflow-hidden border border-border-subtle shrink-0">
            {avatarSrc ? (
              <Image src={avatarSrc} alt={title || "Usuario"} fill unoptimized className="object-cover" />
            ) : (
              avatarFallback || "U"
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-text-primary leading-tight truncate">
                {title}
              </span>
              {headerBadge}
            </div>
            {subtitle && (
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted mt-0.5 truncate">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {headerActions && (
          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-3.5 py-3 sm:px-4 sm:py-3">
        {badges && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {badges}
          </div>
        )}

        {bodyTitle && (
          <h3
            onClick={onClickBody}
            className={`text-sm font-bold text-text-primary mb-1.5 leading-snug ${onClickBody ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
          >
            {bodyTitle}
          </h3>
        )}

        {bodyDescription && (
          <div className="mb-2">
            <p className={`text-xs text-text-secondary leading-relaxed ${!expandido && bodyDescription.length > 450 ? "line-clamp-4" : ""}`}>
              {bodyDescription}
            </p>
            {bodyDescription.length > 450 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandido(v => !v);
                }}
                className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                {expandido ? (
                  <><ChevronUp size={11} /> Leer menos</>
                ) : (
                  <><ChevronDown size={11} /> Leer más</>
                )}
              </button>
            )}
          </div>
        )}

        {/* Imagen adaptativa que respeta proporción original con visor modal */}
        {imageSrc && (
          <>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setViewerOpen(true);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewerOpen(true);
                }
              }}
              aria-label="Ampliar imagen de la publicación"
              className="group/img relative w-full my-2 rounded-xl overflow-hidden border border-border-subtle bg-surface-subtle/60 flex items-center justify-center cursor-zoom-in transition-all hover:border-primary/50 focus:outline-hidden focus:ring-2 focus:ring-primary/40 select-none"
              style={{ maxHeight: "380px" }}
            >
              {/* Imagen con proporción natural sin recortes agresivos ni deformación */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={bodyTitle || "Foto adjunta"}
                loading={priorityImage ? "eager" : "lazy"}
                className="w-full h-auto max-h-[380px] object-contain rounded-xl transition-transform duration-200 group-hover/img:scale-[1.01]"
              />

              {/* Indicador discreto para ampliar foto */}
              <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-md bg-black/65 hover:bg-black/80 text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs transition-opacity duration-200 pointer-events-none opacity-85 group-hover/img:opacity-100 shadow-xs">
                <Maximize2 size={11} />
                <span>Ampliar</span>
              </div>
            </div>

            {/* Modal Lightbox Reutilizable */}
            <ImageViewer
              isOpen={viewerOpen}
              onClose={() => setViewerOpen(false)}
              src={imageSrc}
              alt={bodyTitle || "Foto adjunta"}
              titulo={bodyTitle || "Foto adjunta"}
            />
          </>
        )}

        {extraContent}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-3.5 py-2 sm:px-4 sm:py-2 bg-surface-subtle border-t border-border-subtle flex items-center justify-between gap-2">
          {footer}
        </div>
      )}

      {/* Panel Desplegable (Actualizaciones en la misma pantalla) */}
      {expandedPanel && (
        <div className="border-t border-border-subtle bg-surface-subtle/50 px-3.5 py-3 sm:px-4 sm:py-3.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {expandedPanel}
        </div>
      )}
    </article>
  );
}
