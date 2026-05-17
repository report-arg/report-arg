import { CheckCircle, MapPin, ThumbsUp, MessageCircle, Share2 } from "lucide-react";

const ESTADO_LABELS = {
  recibido:   { label: "Recibido",   cls: "pendiente"   },
  en_proceso: { label: "En proceso", cls: "en_proceso"  },
  resuelto:   { label: "Resuelto",   cls: "resuelto"    },
};

function tiempoRelativo(fechaStr) {
  const diff = Date.now() - new Date(fechaStr).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 60)   return `Hace ${min} min`;
  const hs = Math.floor(min / 60);
  if (hs  < 24)   return `Hace ${hs} h`;
  const dias = Math.floor(hs / 24);
  if (dias < 7)   return `Hace ${dias} d`;
  return new Date(fechaStr).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function iniciales(nombre) {
  if (!nombre) return "?";
  return nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

export default function FeedCard({ item }) {
  const estado  = ESTADO_LABELS[item.estado] ?? { label: item.estado, cls: "pendiente" };
  const tiempo  = tiempoRelativo(item.fecha_creacion);

  if (item.esInstitucion) {
    return <ComunicadoCard item={item} tiempo={tiempo} />;
  }

  return (
    <article className="feed-card">
      <div className="feed-card-header">
        <div className="feed-card-author">
          <div className="feed-card-avatar">
            {item.autorFoto
              ? <img src={item.autorFoto} alt={item.autorNombre} />
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
        <span className={`feed-card-badge ${estado.cls}`}>{estado.label}</span>
      </div>

      <div className="feed-card-body">
        <h3 className="feed-card-title">{item.titulo}</h3>
        {item.categoriaNombre && (
          <span className="feed-card-category">{item.categoriaNombre}</span>
        )}
        {item.descripcion && (
          <p className="feed-card-desc">{item.descripcion}</p>
        )}
      </div>

      <div className="feed-card-footer">
        <button className="feed-card-action">
          <ThumbsUp size={15} /> Apoyar
        </button>
        <button className="feed-card-action">
          <MessageCircle size={15} /> Comentar
        </button>
        <button className="feed-card-action">
          <Share2 size={15} /> Compartir
        </button>
      </div>
    </article>
  );
}

function ComunicadoCard({ item, tiempo }) {
  return (
    <article className="feed-card">
      <div className="feed-card-header">
        <div className="feed-card-author">
          <div className="feed-card-avatar" style={{ background: "#1e40af" }}>
            {iniciales(item.autorNombre)}
          </div>
          <div>
            <div className="feed-card-author-name">
              {item.autorNombre}
              {item.verificada === 1 && (
                <CheckCircle size={14} color="#2D3A8C" fill="#dbeafe" />
              )}
            </div>
            <div className="feed-card-author-meta">{tiempo}</div>
          </div>
        </div>
        <span className="feed-card-badge oficial">Oficial</span>
      </div>

      <div className="feed-card-body">
        <h3 className="feed-card-title">{item.titulo}</h3>
        {item.categoriaNombre && (
          <span className="feed-card-category">{item.categoriaNombre}</span>
        )}
        {item.descripcion && (
          <p className="feed-card-desc">{item.descripcion}</p>
        )}
      </div>

      <div className="feed-card-footer">
        <button className="feed-card-action" style={{ fontWeight: 600, color: "#1e40af" }}>
          Leer más
        </button>
        <button className="feed-card-action">
          <Share2 size={15} /> Compartir
        </button>
      </div>
    </article>
  );
}
