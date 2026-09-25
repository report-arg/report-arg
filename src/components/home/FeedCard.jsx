"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  CheckCircle, MapPin, Share2, Trash2,
  ChevronDown, ChevronUp,
} from "lucide-react";
import apiClient from "@/services/apiClient";
import Image from "next/image";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import { tiempoRelativo, fechaExacta } from "@/utils/dateFormatters";

function iniciales(nombre) {
  if (!nombre) return "?";
  return nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

async function compartir({ titulo, descripcion, id }) {
  const url  = `${window.location.origin}/home?post=${id}`;
  const text = descripcion ? descripcion.slice(0, 100) : titulo;

  if (navigator.share) {
    try { await navigator.share({ title: titulo, text, url }); } catch { /* cancelado */ }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    alert("¡Enlace copiado al portapapeles!");
  } catch {
    prompt("Copiá el enlace:", url);
  }
}

function ConfirmModal({ mensaje, onConfirmar, onCancelar, cargando }) {
  return (
    <div className="fc-modal-overlay" onClick={onCancelar}>
      <div className="fc-modal" onClick={e => e.stopPropagation()}>
        <p className="fc-modal-mensaje">{mensaje}</p>
        <div className="fc-modal-acciones">
          <button className="fc-modal-btn cancel" onClick={onCancelar} disabled={cargando}>
            Cancelar
          </button>
          <button className="fc-modal-btn confirm" onClick={onConfirmar} disabled={cargando}>
            {cargando ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ComunicadoCard({ item, onEliminado }) {
  const { data: session } = useSession();
  const [expandido,    setExpandido]    = useState(false);
  const [eliminando,   setEliminando]   = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  const esPropietario = session?.user?.id && Number(session.user.id) === Number(item.id_usuario);
  const fechaCompleta = fechaExacta(item.fecha_creacion);

  async function eliminarComunicado() {
    setEliminando(true);
    try {
      const res  = await apiClient.delete(`/comunicados/${item.id}`);
      const data = res.data;
      if (data.ok) onEliminado?.(item.id);
    } finally {
      setEliminando(false);
      setModalAbierto(false);
    }
  }

  return (
    <article className="feed-card feed-card--inst">
      <div className="feed-card-header">
        <div className="feed-card-author">
          <div className="feed-card-avatar" style={{ background: "#1e40af" }}>
            {iniciales(item.autorNombre)}
          </div>
          <div>
            <div className="feed-card-author-name">
              {item.autorNombre}
              {item.verificada === 1 && (
                <CheckCircle size={14} color="#2D3A8C" fill="#dbeafe" style={{ marginLeft: 4 }} />
              )}
            </div>
            <div className="feed-card-author-meta" title={fechaCompleta}>{fechaCompleta}</div>
          </div>
        </div>
        <span className="feed-card-badge oficial">Oficial</span>
        {esPropietario && (
          <button
            className="feed-card-action-delete"
            title="Eliminar comunicado"
            disabled={eliminando}
            onClick={() => setModalAbierto(true)}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {modalAbierto && (
        <ConfirmModal
          mensaje="¿Deseás eliminar este comunicado? Esta acción no se puede deshacer."
          onConfirmar={eliminarComunicado}
          onCancelar={() => setModalAbierto(false)}
          cargando={eliminando}
        />
      )}

      <div className="feed-card-body">
        <h3 className="feed-card-title">{item.titulo}</h3>

        {item.categoriaNombre && (
          <span className="feed-card-category">{item.categoriaNombre}</span>
        )}

        {item.descripcion && (
          <>
            <p className={`feed-card-desc${expandido ? " feed-card-desc--full" : ""}`}>
              {item.descripcion}
            </p>
            {item.descripcion.length > 200 && (
              <button
                className="feed-card-leer-mas"
                onClick={() => setExpandido(v => !v)}
              >
                {expandido
                  ? <><ChevronUp size={14} /> Leer menos</>
                  : <><ChevronDown size={14} /> Leer más</>}
              </button>
            )}
          </>
        )}

        {item.imagen && (
          <div className="feed-card-img-wrap" style={{ position: "relative" }}>
            <Image
              className="feed-card-img"
              src={item.imagen}
              alt={item.titulo}
              fill
              unoptimized
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
      </div>

      <div className="feed-card-footer">
        <button
          className="feed-card-action"
          onClick={() => compartir({ titulo: item.titulo, descripcion: item.descripcion, id: item.id })}
        >
          <Share2 size={15} /> Compartir
        </button>
      </div>
    </article>
  );
}


export default function FeedCard({ item, onEliminado }) {
  const tiempo = tiempoRelativo(item.fecha_creacion);

  // Discriminación conceptual explícita por tipo de publicación
  if (item.tipo === "comunicado") {
    return <ComunicadoCard item={item} onEliminado={onEliminado} />;
  }

  return (
    <article className="feed-card">
      <div className="feed-card-header">
        <div className="feed-card-author">
          <div className="feed-card-avatar" style={{ position: "relative" }}>
            {item.autorFoto
              ? <Image src={item.autorFoto} alt={item.autorNombre} fill unoptimized style={{ objectFit: "cover" }} />
              : iniciales(item.autorNombre)}
          </div>
          <div>
            <div className="feed-card-author-name">{item.autorNombre || "Ciudadano"}</div>
            <div className="feed-card-author-meta">
              {item.direccion && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <MapPin size={11} /> {item.direccion} ·{" "}
                </span>
              )}
              {tiempo}
            </div>
          </div>
        </div>
        <ClaimStatusBadge estado={item.estado} />
      </div>

      <div className="feed-card-body">
        <h3 className="feed-card-title">{item.titulo}</h3>
        {item.categoriaNombre && (
          <span className="feed-card-category">{item.categoriaNombre}</span>
        )}
        {item.descripcion && (
          <p className="feed-card-desc">{item.descripcion}</p>
        )}
        {item.imagen && (
          <div className="feed-card-img-wrap" style={{ position: "relative" }}>
            <Image
              className="feed-card-img"
              src={item.imagen}
              alt={item.titulo}
              fill
              unoptimized
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
      </div>

      {/* Regla de Negocio: Reclamos NO tienen comentarios públicos. Solo Compartir. */}
      <div className="feed-card-footer">
        <button
          className="feed-card-action"
          onClick={() => compartir({ titulo: item.titulo, descripcion: item.descripcion, id: item.id })}
        >
          <Share2 size={15} /> Compartir
        </button>
      </div>
    </article>
  );
}

