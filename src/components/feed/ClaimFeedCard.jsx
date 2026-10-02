"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Share2, Building2, Eye, Users, MessageSquare } from "lucide-react";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import { getCategoryIcon } from "@/components/brand/icons";
import { tiempoRelativo, fechaExacta } from "@/utils/dateFormatters";
import BaseFeedCard from "./BaseFeedCard";

import { useSession } from "next-auth/react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";

function iniciales(nombre) {
  if (!nombre) return "C";
  return nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

async function compartirReclamo({ titulo, descripcion, id }) {
  const url = `${window.location.origin}/ciudadano/reclamos/${id}`;
  const text = descripcion ? descripcion.slice(0, 100) : titulo;

  if (navigator.share) {
    try { await navigator.share({ title: titulo, text, url }); } catch { /* cancelado */ }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    toast.success("¡Enlace al reclamo copiado!");
  } catch {
    prompt("Copiá el enlace:", url);
  }
}

export default function ClaimFeedCard({ item, priorityImage }) {
  const router = useRouter();
  const { data: session } = useSession();
  const esAutor = session?.user?.id && Number(session.user.id) === Number(item.id_usuario);
  const esCiudadano = session?.user?.role === "ciudadano";
  const esTerminal = ["Resuelto", "Cancelado"].includes(item.estado);

  const tiempo = tiempoRelativo(item.fecha_creacion);
  const fechaLarga = fechaExacta(item.fecha_creacion);
  const CategoryIcon = getCategoryIcon(item.categoriaCodigo || item.categoriaNombre, item.categoriaNombre);

  const [isAfectado, setIsAfectado] = React.useState(item.isAfectado || false);
  const [afectados, setAfectados] = React.useState(item.afectadosCount || item.cantidad_afectados || 0);
  const [loadingAfectado, setLoadingAfectado] = React.useState(false);

  async function handleToggleAfectado(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (loadingAfectado) return;
    setLoadingAfectado(true);
    
    const previousIsAfectado = isAfectado;
    const previousAfectados = afectados;
    
    // Optimistic UI update
    const newValue = !isAfectado;
    setIsAfectado(newValue);
    setAfectados(prev => prev + (newValue ? 1 : -1));
    
    try {
      const res = await apiClient.post(`/reclamos/${item.id}/afectado`);
      const data = res.data;
      
      if (data.ok) {
        // En caso de desincronización, usamos el valor real del backend
        if (data.afectado !== newValue) {
          setIsAfectado(data.afectado);
          setAfectados(previousAfectados + (data.afectado ? 1 : -1));
        }
        toast.success(data.mensaje);
      } else {
        // Revertir
        setIsAfectado(previousIsAfectado);
        setAfectados(previousAfectados);
        toast.error(data.mensaje || "Error al actualizar");
      }
    } catch (error) {
      // Revertir
      setIsAfectado(previousIsAfectado);
      setAfectados(previousAfectados);
      console.error("Error en toggle afectado:", error);
      toast.error(error.response?.data?.mensaje || "Ocurrió un error");
    } finally {
      setLoadingAfectado(false);
    }
  }

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

  const ExtraContent = (
    <div className="flex flex-col gap-2 mb-1.5">
      {afectados > 0 && (
        <div className="inline-flex items-center self-start gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200/60">
          <Users size={10} className="text-amber-600" />
          <span>A {afectados} vecino{afectados !== 1 ? "s" : ""} también le{afectados !== 1 ? "s" : ""} afecta esto</span>
        </div>
      )}
    </div>
  );

  const actualizacionesCount = Number(item.actualizacionesCount || item.cantidad_actualizaciones || 0);

  const Footer = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push(`/ciudadano/reclamos/${item.id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary-subtle transition-colors cursor-pointer"
        >
          <Eye size={14} />
          <span className="hidden sm:inline">Seguimiento</span>
        </button>

        {actualizacionesCount > 0 && (
          <button
            onClick={() => router.push(`/ciudadano/reclamos/${item.id}#actualizaciones`)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50/90 hover:bg-blue-100 border border-blue-200/90 transition-colors cursor-pointer"
            title="Ver actualizaciones del reclamo"
          >
            <MessageSquare size={13} className="text-blue-600 shrink-0" />
            <span>Actualizaciones {actualizacionesCount}</span>
          </button>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); compartirReclamo({ titulo: item.titulo, descripcion: item.descripcion, id: item.id }); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-border-subtle transition-colors cursor-pointer"
        >
          <Share2 size={14} />
          <span className="hidden sm:inline">Compartir</span>
        </button>
      </div>

      {(esCiudadano && !esAutor && item.visibilidad !== 'privado' && !esTerminal) && (
        <button
          onClick={handleToggleAfectado}
          disabled={loadingAfectado}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
            isAfectado 
              ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20 hover:bg-[var(--color-brand-600)]' 
              : 'bg-surface border-border-subtle text-text-secondary hover:bg-surface-subtle hover:border-border'
          }`}
        >
          <Users size={14} className={isAfectado ? 'text-white' : 'text-text-muted'} />
          <span>{isAfectado ? 'Afectado' : 'A mí también'}</span>
        </button>
      )}
    </div>
  );

  return (
    <BaseFeedCard
      avatarSrc={item.autorFoto}
      avatarFallback={iniciales(item.autorNombre)}
      title={item.autorNombre || "Ciudadano"}
      subtitle={Subtitle}
      headerActions={<ClaimStatusBadge estado={item.estado} />}
      onClickBody={() => router.push(`/ciudadano/reclamos/${item.id}`)}
      bodyTitle={item.titulo}
      bodyDescription={item.descripcion}
      badges={Badges}
      imageSrc={item.imagen}
      priorityImage={priorityImage}
      extraContent={ExtraContent}
      footer={Footer}
    />
  );
}
