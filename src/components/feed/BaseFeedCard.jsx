"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  customSurfaceClass = "bg-surface border-border-subtle hover:border-primary shadow-xs hover:shadow-sm"
}) {
  const [expandido, setExpandido] = useState(false);

  return (
    <article className={`mb-4 rounded-xl border transition-all overflow-hidden ${customSurfaceClass}`}>
      {/* Header */}
      <div className="p-3.5 border-b border-border-subtle flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-surface-subtle text-text-secondary text-[10px] font-bold flex items-center justify-center relative overflow-hidden border border-border-subtle shrink-0">
            {avatarSrc ? (
              <Image src={avatarSrc} alt={title || "Usuario"} fill unoptimized className="object-cover" />
            ) : (
              avatarFallback || "U"
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-text-primary leading-tight">
                {title}
              </span>
              {headerBadge}
            </div>
            {subtitle && (
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {headerActions && (
          <div className="flex items-center gap-2">
            {headerActions}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5">
        {badges && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
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
          <div className="mb-2.5">
            <p className={`text-xs text-text-secondary leading-relaxed ${!expandido && bodyDescription.length > 220 ? "line-clamp-3" : ""}`}>
              {bodyDescription}
            </p>
            {bodyDescription.length > 220 && (
              <button
                onClick={() => setExpandido(v => !v)}
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

        {imageSrc && (
          <div
            onClick={onClickBody}
            className={`relative w-full h-40 sm:h-56 rounded-md overflow-hidden border border-border-subtle bg-surface-subtle mt-2 mb-2 ${onClickBody ? "cursor-pointer" : ""}`}
          >
            <Image
              src={imageSrc}
              alt="Adjunto"
              fill
              unoptimized
              priority={priorityImage}
              className={`object-cover ${onClickBody ? "hover:scale-102 transition-transform duration-200" : ""}`}
            />
          </div>
        )}

        {extraContent}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-3.5 py-2 bg-surface-subtle border-t border-border-subtle flex items-center justify-between gap-2">
          {footer}
        </div>
      )}
    </article>
  );
}
