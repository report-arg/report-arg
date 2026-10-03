"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Share2, Building2, Eye, Users, MessageSquare, ChevronDown, ChevronUp, Loader2, X, User } from "lucide-react";
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

  const esCiudadano = session?.user?.role === "ciudadano";
  const esInstitucion = session?.user?.role === "institucion";
  const esAutor = session?.user?.id && Number(session.user.id) === Number(item.id_usuario);
  const esTerminal = ["Resuelto", "Cancelado"].includes(item.estado);

  // Determinar si el reclamo está asignado a la institución autenticada
  const esAsignadoInstitucion = esInstitucion && (
    (session?.user?.id_institucion && item.id_institucion && Number(session.user.id_institucion) === Number(item.id_institucion)) ||
    (item.id_usuario_institucion && Number(session.user.id) === Number(item.id_usuario_institucion))
  );

  const detalleUrl = esInstitucion ? `/institucion/reclamos/${item.id}` : `/ciudadano/reclamos/${item.id}`;

  const tiempo = tiempoRelativo(item.fecha_creacion);
  const fechaLarga = fechaExacta(item.fecha_creacion);
  const CategoryIcon = getCategoryIcon(item.categoriaCodigo || item.categoriaNombre, item.categoriaNombre);

  const [isAfectado, setIsAfectado] = useState(item.isAfectado || false);
  const [afectados, setAfectados] = useState(item.afectadosCount || item.cantidad_afectados || 0);
  const [loadingAfectado, setLoadingAfectado] = useState(false);

  // Estado para desplegar actualizaciones directamente en la card del feed
  const [mostrarActualizaciones, setMostrarActualizaciones] = useState(false);
  const [actualizacionesList, setActualizacionesList] = useState([]);
  const [cargandoActualizaciones, setCargandoActualizaciones] = useState(false);
  const [errorActualizaciones, setErrorActualizaciones] = useState(false);

  async function handleToggleAfectado(e) {
    e.preventDefault();
    e.stopPropagation();

    if (loadingAfectado) return;
    setLoadingAfectado(true);

    const previousIsAfectado = isAfectado;
    const previousAfectados = afectados;

    const newValue = !isAfectado;
    setIsAfectado(newValue);
    setAfectados(prev => prev + (newValue ? 1 : -1));

    try {
      const res = await apiClient.post(`/reclamos/${item.id}/afectado`);
      const data = res.data;

      if (data.ok) {
        if (data.afectado !== newValue) {
          setIsAfectado(data.afectado);
          setAfectados(previousAfectados + (data.afectado ? 1 : -1));
        }
        toast.success(data.mensaje);
      } else {
        setIsAfectado(previousIsAfectado);
        setAfectados(previousAfectados);
        toast.error(data.mensaje || "Error al actualizar");
      }
    } catch (error) {
      setIsAfectado(previousIsAfectado);
      setAfectados(previousAfectados);
      console.error("Error en toggle afectado:", error);
      toast.error(error.response?.data?.mensaje || "Ocurrió un error");
    } finally {
      setLoadingAfectado(false);
    }
  }

  function handleToggleActualizaciones(e) {
    e.preventDefault();
    e.stopPropagation();

    const proximo = !mostrarActualizaciones;
    setMostrarActualizaciones(proximo);

    if (proximo && actualizacionesList.length === 0) {
      setCargandoActualizaciones(true);
      setErrorActualizaciones(false);
      apiClient.get(`/reclamos/${item.id}/actualizaciones`)
        .then(res => {
          if (res.data?.ok) {
            setActualizacionesList(res.data.data || []);
          } else {
            setErrorActualizaciones(true);
          }
        })
        .catch(() => setErrorActualizaciones(true))
        .finally(() => setCargandoActualizaciones(false));
    }
  }

  // Título del autor con indicador "(Vos)" si es propio, sin badges invasivos
  const authorDisplay = item.autorNombre
    ? (esAutor ? `${item.autorNombre} (Vos)` : item.autorNombre)
    : (esAutor ? "Vos" : "Ciudadano");

  const Subtitle = (
    <>
      <span title={fechaLarga}>{tiempo}</span>
      {item.direccion && (
        <>
          <span>·</span>
          <span className="inline-flex items-center gap-0.5 text-text-secondary truncate max-w-[220px]" title={item.direccion}>
            <MapPin size={10} className="text-text-muted shrink-0" />
            <span className="truncate">{item.direccion}</span>
          </span>
        </>
      )}
      {esAsignadoInstitucion && (
        <>
          <span>·</span>
          <span className="text-primary font-semibold">Asignado a tu institución</span>
        </>
      )}
    </>
  );

  // Categoría limpia
  const Badges = item.categoriaNombre && (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-subtle text-text-secondary text-[10px] font-semibold border border-border-subtle">
      <CategoryIcon size={11} className="text-primary shrink-0" />
      <span>{item.categoriaNombre}</span>
    </span>
  );

  // Cantidad de vecinos afectados en la jerarquía
  const ExtraContent = afectados > 0 && (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400/90 mt-1 mb-0.5">
      <Users size={12} className="shrink-0" />
      <span>
        {afectados} vecino{afectados !== 1 ? "s" : ""} afectado{afectados !== 1 ? "s" : ""}
      </span>
    </div>
  );

  const actualizacionesCount = Number(item.actualizacionesCount || item.cantidad_actualizaciones || 0);

  // Texto de la acción principal según rol
  let actionLabel = "Ver reclamo";
  if (esInstitucion) {
    actionLabel = esAsignadoInstitucion ? "Gestionar reclamo" : "Ver detalle";
  }

  const Footer = (
    <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => router.push(detalleUrl)}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary-subtle transition-colors cursor-pointer"
        >
          <Eye size={14} />
          <span>{actionLabel}</span>
        </button>

        {/* Botón de actualizaciones: abre en la misma pantalla tipo comentarios */}
        {actualizacionesCount > 0 && (
          <button
            type="button"
            onClick={handleToggleActualizaciones}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
              mostrarActualizaciones
                ? "bg-primary-subtle text-primary border-primary/40 shadow-xs"
                : "text-text-secondary hover:text-primary hover:bg-surface-subtle border-border-subtle bg-surface"
            }`}
            title={mostrarActualizaciones ? "Ocultar actualizaciones" : "Ver actualizaciones del reclamo"}
          >
            <MessageSquare size={13} className="shrink-0" />
            <span>Actualizaciones ({actualizacionesCount})</span>
            {mostrarActualizaciones ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            compartirReclamo({ titulo: item.titulo, descripcion: item.descripcion, id: item.id });
          }}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
          title="Compartir publicación"
        >
          <Share2 size={13} />
          <span className="hidden sm:inline">Compartir</span>
        </button>
      </div>

      {/* Acción "A mí también me pasa" únicamente para ciudadanos que no son autores */}
      {esCiudadano && !esAutor && item.visibilidad !== "privado" && !esTerminal && (
        <button
          type="button"
          onClick={handleToggleAfectado}
          disabled={loadingAfectado}
          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
            isAfectado
              ? "bg-primary text-white border-primary shadow-xs hover:bg-[var(--color-brand-600)]"
              : "bg-surface border-border-subtle text-text-secondary hover:bg-surface-subtle hover:border-border"
          }`}
          title={isAfectado ? "Ya indicaste que te afecta" : "Indicar que a mí también me pasa"}
        >
          <Users size={13} className={isAfectado ? "text-white" : "text-text-muted"} />
          <span>A mí también me pasa</span>
          {afectados > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                isAfectado ? "bg-white/20 text-white" : "bg-surface-subtle text-text-muted"
              }`}
            >
              {afectados}
            </span>
          )}
        </button>
      )}
    </div>
  );

  // Panel desplegable de actualizaciones en la misma pantalla
  const ExpandedPanel = mostrarActualizaciones && (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle/80">
        <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
          <MessageSquare size={13} className="text-primary shrink-0" />
          <span>Actualizaciones del reclamo</span>
          <span className="text-[10px] font-normal text-text-muted">({actualizacionesCount})</span>
        </span>
        <button
          type="button"
          onClick={() => setMostrarActualizaciones(false)}
          className="text-text-muted hover:text-text-primary p-0.5 rounded-md hover:bg-surface transition-colors cursor-pointer"
          aria-label="Cerrar panel de actualizaciones"
        >
          <X size={13} />
        </button>
      </div>

      {cargandoActualizaciones ? (
        <div className="py-3.5 flex items-center justify-center gap-2 text-xs text-text-muted">
          <Loader2 size={14} className="animate-spin text-primary" />
          <span>Cargando actualizaciones…</span>
        </div>
      ) : errorActualizaciones ? (
        <p className="text-xs text-rose-500 py-2 text-center">
          No se pudieron cargar las actualizaciones.
        </p>
      ) : actualizacionesList.length === 0 ? (
        <p className="text-xs text-text-muted py-2 text-center">
          Aún no hay actualizaciones registradas para este reporte.
        </p>
      ) : (
        <div className="space-y-2">
          {actualizacionesList.map(act => {
            const esInst = act.tipo_autor === "institucion" || Boolean(act.institucionNombre);
            return (
              <div
                key={act.id}
                className="p-2.5 rounded-xl bg-surface border border-border-subtle shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {esInst ? (
                      <Building2 size={12} className="text-primary shrink-0" />
                    ) : (
                      <User size={12} className="text-text-muted shrink-0" />
                    )}
                    <span className="text-xs font-bold text-text-primary truncate">
                      {act.institucionNombre || act.autorNombre || (esInst ? "Institución" : "Ciudadano")}
                    </span>
                    {esInst && (
                      <span className="text-[10px] font-semibold text-primary">
                        · Oficial
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-text-muted shrink-0">
                    {tiempoRelativo(act.fecha_creacion)}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                  {act.texto}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <BaseFeedCard
      avatarSrc={item.autorFoto}
      avatarFallback={iniciales(item.autorNombre)}
      title={authorDisplay}
      subtitle={Subtitle}
      headerActions={<ClaimStatusBadge estado={item.estado} />}
      onClickBody={() => router.push(detalleUrl)}
      bodyTitle={item.titulo}
      bodyDescription={item.descripcion}
      badges={Badges}
      imageSrc={item.imagen}
      priorityImage={priorityImage}
      extraContent={ExtraContent}
      footer={Footer}
      expandedPanel={ExpandedPanel}
    />
  );
}
