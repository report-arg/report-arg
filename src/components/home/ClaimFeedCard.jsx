"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Share2, Building2, Eye, Users } from "lucide-react";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import { getCategoryIcon } from "@/components/brand/icons";
import { tiempoRelativo, fechaExacta } from "@/utils/dateFormatters";

function iniciales(nombre) {
  if (!nombre) return "C";
  return nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

async function compartirReclamo({ titulo, descripcion, id }) {
  const url = `${window.location.origin}/home/reclamos/${id}`;
  const text = descripcion ? descripcion.slice(0, 100) : titulo;

  if (navigator.share) {
    try { await navigator.share({ title: titulo, text, url }); } catch { /* cancelado */ }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    alert("¡Enlace al reclamo copiado!");
  } catch {
    prompt("Copiá el enlace:", url);
  }
}

export default function ClaimFeedCard({ item }) {
  const router = useRouter();
  const tiempo = tiempoRelativo(item.fecha_creacion);
  const fechaLarga = fechaExacta(item.fecha_creacion);

  const CategoryIcon = getCategoryIcon(item.categoriaCodigo || item.categoriaNombre, item.categoriaNombre);
  const afectados = item.afectadosCount || item.cantidad_afectados || 0;

  return (
    <article className="mb-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow overflow-hidden">
      {/* Header del Reclamo */}
      <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center relative overflow-hidden border border-slate-200 shrink-0">
            {item.autorFoto ? (
              <Image src={item.autorFoto} alt={item.autorNombre || "Ciudadano"} fill unoptimized className="object-cover" />
            ) : (
              iniciales(item.autorNombre)
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900 leading-tight">
              {item.autorNombre || "Ciudadano"}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span title={fechaLarga}>{tiempo}</span>
              {item.direccion && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-slate-600 truncate max-w-[200px]" title={item.direccion}>
                    <MapPin size={11} className="text-slate-400 shrink-0" />
                    {item.direccion}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ClaimStatusBadge estado={item.estado} />
        </div>
      </div>

      {/* Cuerpo del Reclamo */}
      <div className="p-4">
        {/* Chips de Categoría e Institución */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {item.categoriaNombre && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
              <CategoryIcon size={13} className="text-[var(--color-brand-600)] shrink-0" />
              <span>{item.categoriaNombre}</span>
            </span>
          )}

          {item.institucionNombre && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-brand-50)] text-[var(--color-brand-700)] text-[11px] font-medium border border-[var(--color-brand-100)]">
              <Building2 size={12} className="shrink-0" />
              <span>Gestionado por {item.institucionNombre}</span>
            </span>
          )}
        </div>

        {/* Título y Descripción */}
        <h3
          onClick={() => router.push(`/home/reclamos/${item.id}`)}
          className="text-base font-bold text-slate-900 mb-1.5 leading-snug cursor-pointer hover:text-[var(--color-brand-600)] transition-colors"
        >
          {item.titulo}
        </h3>

        {item.descripcion && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
            {item.descripcion}
          </p>
        )}

        {/* Imagen solo si existe real */}
        {item.imagen && (
          <div
            onClick={() => router.push(`/home/reclamos/${item.id}`)}
            className="relative w-full h-48 sm:h-56 rounded-lg overflow-hidden border border-slate-200 cursor-pointer bg-slate-100 mb-3"
          >
            <Image
              src={item.imagen}
              alt={item.titulo}
              fill
              unoptimized
              className="object-cover hover:scale-102 transition-transform duration-200"
            />
          </div>
        )}

        {/* Indicador de afectados si existe en DTO */}
        {afectados > 0 && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200/60 mb-2">
            <Users size={12} className="text-amber-600" />
            <span>A {afectados} vecino{afectados !== 1 ? "s" : ""} también le{afectados !== 1 ? "s" : ""} afecta esto</span>
          </div>
        )}
      </div>

      {/* Footer de Acciones */}
      <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => router.push(`/home/reclamos/${item.id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] transition-colors cursor-pointer"
        >
          <Eye size={14} />
          <span>Ver seguimiento</span>
        </button>

        <button
          onClick={() => compartirReclamo({ titulo: item.titulo, descripcion: item.descripcion, id: item.id })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <Share2 size={14} />
          <span>Compartir</span>
        </button>
      </div>
    </article>
  );
}
