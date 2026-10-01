"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle, Share2, Trash2 } from "lucide-react";
import { OfficialCommIcon, getCategoryIcon } from "@/components/brand/icons";
import { fechaExacta } from "@/utils/dateFormatters";
import apiClient from "@/services/apiClient";
import BaseFeedCard from "./BaseFeedCard";

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

export default function CommunicationFeedCard({ item, onEliminado, priorityImage }) {
  const { data: session } = useSession();
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

  const Subtitle = (
    <span title={fechaCompleta}>{fechaCompleta}</span>
  );

  const HeaderBadge = item.verificada === 1 && (
    <CheckCircle size={12} className="text-primary shrink-0" />
  );

  const HeaderActions = (
    <>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-official-border text-primary text-[10px] font-bold shadow-xs">
        <OfficialCommIcon size={10} />
        <span>Oficial</span>
      </span>

      {esPropietario && (
        <button
          onClick={eliminarComunicado}
          disabled={eliminando}
          className="p-1 text-text-muted hover:text-red-600 rounded transition-colors cursor-pointer disabled:opacity-50"
          title="Eliminar comunicado"
        >
          <Trash2 size={13} />
        </button>
      )}
    </>
  );

  const Badges = item.categoriaNombre && (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-primary text-[10px] font-semibold bg-surface border border-official-border">
      <CategoryIcon size={11} className="text-primary shrink-0" />
      <span>{item.categoriaNombre}</span>
    </span>
  );

  const Footer = (
    <>
      <span className="text-[10px] text-text-muted font-medium">
        Información oficial verificada
      </span>

      <button
        onClick={() => compartirComunicado({ titulo: item.titulo, descripcion: item.descripcion, id: item.id })}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary-subtle transition-colors cursor-pointer"
      >
        <Share2 size={14} />
        <span>Compartir</span>
      </button>
    </>
  );

  return (
    <BaseFeedCard
      customSurfaceClass="bg-official-surface border-official-border shadow-xs hover:shadow-sm"
      avatarSrc={item.autorFoto}
      avatarFallback={iniciales(item.autorNombre)}
      title={item.autorNombre || "Institución Oficial"}
      subtitle={Subtitle}
      headerBadge={HeaderBadge}
      headerActions={HeaderActions}
      bodyTitle={item.titulo}
      bodyDescription={item.descripcion}
      badges={Badges}
      imageSrc={item.imagen}
      priorityImage={priorityImage}
      footer={Footer}
    />
  );
}
