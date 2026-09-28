"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { CheckCircle, Share2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { OfficialCommIcon, getCategoryIcon } from "@/components/brand/icons";
import { fechaExacta } from "@/utils/dateFormatters";
import apiClient from "@/services/apiClient";

function iniciales(nombre) {
  if (!nombre) return "I";
  return nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

async function compartirComunicado({ titulo, descripcion, id }) {
  const url = `${window.location.origin}/home?post=${id}`;
  const text = descripcion ? descripcion.slice(0, 100) : titulo;

  if (navigator.share) {
    try { await navigator.share({ title: titulo, text, url }); } catch { /* cancelado */ }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    alert("¡Enlace al comunicado copiado!");
  } catch {
    prompt("Copiá el enlace:", url);
  }
}

export default function CommunicationFeedCard({ item, onEliminado }) {
  const { data: session } = useSession();
  const [expandido, setExpandido] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const esPropietario = session?.user?.id && Number(session.user.id) === Number(item.id_usuario);
  const fechaCompleta = fechaExacta(item.fecha_creacion);
  const CategoryIcon = getCategoryIcon(item.categoriaCodigo || item.categoriaNombre, item.categoriaNombre);

  async function eliminarComunicado() {
    if (!confirm("¿Deseás eliminar este comunicado oficial? Esta acción no se puede deshacer.")) return;
    setEliminando(true);
    try {
      const res = await apiClient.delete(`/comunicados/${item.id}`);
      if (res.data?.ok) onEliminado?.(item.id);
    } finally {
      setEliminando(false);
    }
  }

  return (
    <article className="mb-4 rounded-xl bg-gradient-to-b from-[#f4f8ff] to-[#eaf2ff] border border-[#bde0ff] shadow-xs hover:shadow-sm transition-shadow overflow-hidden">
      {/* Header Oficial */}
      <div className="p-4 border-b border-[#d0e4ff] flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-brand-800)] text-white text-xs font-bold flex items-center justify-center relative overflow-hidden shrink-0 shadow-xs">
            {item.autorFoto ? (
              <Image src={item.autorFoto} alt={item.autorNombre} fill unoptimized className="object-cover" />
            ) : (
              iniciales(item.autorNombre)
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {item.autorNombre || "Institución Oficial"}
              </span>
              {item.verificada === 1 && (
                <CheckCircle size={13} className="text-[var(--color-brand-600)] shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5" title={fechaCompleta}>
              {fechaCompleta}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-brand-600)] text-white text-[11px] font-bold shadow-xs">
            <OfficialCommIcon size={12} />
            <span>Oficial</span>
          </span>

          {esPropietario && (
            <button
              onClick={eliminarComunicado}
              disabled={eliminando}
              className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
              title="Eliminar comunicado"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Cuerpo del Comunicado */}
      <div className="p-4">
        {item.categoriaNombre && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-[var(--color-brand-800)] text-[11px] font-semibold border border-[#bde0ff]">
              <CategoryIcon size={13} className="text-[var(--color-brand-600)] shrink-0" />
              <span>{item.categoriaNombre}</span>
            </span>
          </div>
        )}

        <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
          {item.titulo}
        </h3>

        {item.descripcion && (
          <div className="mb-3">
            <p className={`text-xs text-slate-700 leading-relaxed ${!expandido && item.descripcion.length > 220 ? "line-clamp-4" : ""}`}>
              {item.descripcion}
            </p>
            {item.descripcion.length > 220 && (
              <button
                onClick={() => setExpandido(v => !v)}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-brand-600)] hover:underline cursor-pointer"
              >
                {expandido ? (
                  <><ChevronUp size={13} /> Leer menos</>
                ) : (
                  <><ChevronDown size={13} /> Leer más</>
                )}
              </button>
            )}
          </div>
        )}

        {/* Imagen si existe */}
        {item.imagen && (
          <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden border border-[#bde0ff] bg-slate-100 mb-2">
            <Image
              src={item.imagen}
              alt={item.titulo}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Footer de Acciones (Comentarios deshabilitados para Comunicados) */}
      <div className="px-4 py-2 bg-[#e3efff]/80 border-t border-[#bde0ff] flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-medium">
          Información oficial verificada
        </span>

        <button
          onClick={() => compartirComunicado({ titulo: item.titulo, descripcion: item.descripcion, id: item.id })}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)] transition-colors cursor-pointer"
        >
          <Share2 size={14} />
          <span>Compartir</span>
        </button>
      </div>
    </article>
  );
}
