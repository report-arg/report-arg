"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Share2, Building2, Eye, Users } from "lucide-react";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import { getCategoryIcon } from "@/components/brand/icons";
import { tiempoRelativo, fechaExacta } from "@/utils/dateFormatters";
import BaseFeedCard from "./BaseFeedCard";

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

  const Subtitle = (
    <>
      <span title={fechaLarga}>{tiempo}</span>
      {item.direccion && (
        <>
          <span>·</span>
          <span className="inline-flex items-center gap-0.5 text-text-secondary truncate max-w-[200px]" title={item.direccion}>
            <MapPin size={10} className="text-text-muted shrink-0" />
            {item.direccion}
          </span>
        </>
      )}
    </>
  );

  const Badges = (
    <>
      {item.categoriaNombre && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-subtle text-text-secondary text-[10px] font-semibold border border-border-subtle">
          <CategoryIcon size={11} className="text-primary shrink-0" />
          <span>{item.categoriaNombre}</span>
        </span>
      )}

      {item.institucionNombre && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-subtle text-primary text-[10px] font-medium border border-border-subtle">
          <Building2 size={11} className="shrink-0" />
          <span>Gestionado por {item.institucionNombre}</span>
        </span>
      )}
    </>
  );

  const ExtraContent = afectados > 0 && (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200/60 mb-1.5">
      <Users size={10} className="text-amber-600" />
      <span>A {afectados} vecino{afectados !== 1 ? "s" : ""} también le{afectados !== 1 ? "s" : ""} afecta esto</span>
    </div>
  );

  const Footer = (
    <>
      <button
        onClick={() => router.push(`/home/reclamos/${item.id}`)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary-subtle transition-colors cursor-pointer"
      >
        <Eye size={14} />
        <span>Ver seguimiento</span>
      </button>

      <button
        onClick={() => compartirReclamo({ titulo: item.titulo, descripcion: item.descripcion, id: item.id })}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-border-subtle transition-colors cursor-pointer"
      >
        <Share2 size={14} />
        <span>Compartir</span>
      </button>
    </>
  );

  return (
    <BaseFeedCard
      avatarSrc={item.autorFoto}
      avatarFallback={iniciales(item.autorNombre)}
      title={item.autorNombre || "Ciudadano"}
      subtitle={Subtitle}
      headerActions={<ClaimStatusBadge estado={item.estado} />}
      onClickBody={() => router.push(`/home/reclamos/${item.id}`)}
      bodyTitle={item.titulo}
      bodyDescription={item.descripcion}
      badges={Badges}
      imageSrc={item.imagen}
      extraContent={ExtraContent}
      footer={Footer}
    />
  );
}
