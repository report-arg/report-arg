"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FilePlus2, MapPin, Clock, Tag, ChevronRight, Building2, Eye, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import apiClient from "@/services/apiClient";

const ESTADO_LABELS = {
  "Pendiente": "Pendiente",
  "En revisión": "En revisión",
  "En proceso": "En proceso",
  "Resuelto": "Resuelto",
  "Cancelado": "Cancelado",
  // compatibilidad legacy
  "recibido": "Pendiente",
  "en_proceso": "En proceso",
  "resuelto": "Resuelto",
  "rechazado": "Cancelado",
};

const PASOS = ["Pendiente", "En revisión", "En proceso", "Resuelto"];

function tiempoRelativo(fecha) {
  if (!fecha) return "";
  const diff = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diff / 60000);
  const hs = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  if (hs < 24) return `Hace ${hs}h`;
  return `Hace ${dias} día${dias > 1 ? "s" : ""}`;
}

function ProgressBar({ estado }) {
  const estadoNormalizado = ESTADO_LABELS[estado] || estado;

  if (estadoNormalizado === "Cancelado") {
    return (
      <div className="reclamo-progress-row" style={{ marginTop: '12px' }}>
        <span className="mis-reclamos-badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
          ❌ Reclamo cancelado
        </span>
      </div>
    );
  }

  const idx = PASOS.indexOf(estadoNormalizado);
  return (
    <div className="reclamo-progress-track" style={{ marginTop: '14px' }}>
      {PASOS.map((paso, i) => (
        <div
          key={paso}
          className={[
            "reclamo-step-item",
            i <= idx ? "done" : "",
            i === idx ? "current" : "",
          ].filter(Boolean).join(" ")}
        >
          <div className="reclamo-step-dot" />
          <span className="reclamo-step-label">{paso}</span>
        </div>
      ))}
    </div>
  );
}

export default function MisReclamosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading" || !session?.user?.id) return;
    apiClient.get(`/reclamos/mis-reclamos`)
      .then(r => r.data)
      .then(d => { if (d.ok) setReclamos(d.data); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [session, status]);

  return (
    <div className="home-feed-wrapper" style={{ padding: '20px 16px' }}>

      <div className="mr-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="mr-header-text">
          <h2 className="mr-title" style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Mis Reclamos</h2>
          <p className="mr-sub" style={{ fontSize: '13px', color: '#64748b' }}>Seguí el estado de los reclamos que enviaste</p>
        </div>
        <button
          className="mr-nuevo-btn"
          onClick={() => router.push("/home/reclamos/nuevo")}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '13px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <FilePlus2 size={16} />
          Nuevo reclamo
        </button>
      </div>

      {loading && <p className="feed-loading">Cargando tus reclamos...</p>}

      {!loading && reclamos.length === 0 && (
        <div className="feed-empty" style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px border #e2e8f0' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>Todavía no registraste ningún reclamo.</p>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
            Reportá problemas de tu ciudad para informar a las instituciones y darle seguimiento.
          </p>
          <button
            onClick={() => router.push("/home/reclamos/nuevo")}
            style={{ marginTop: '16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            Crear mi primer reclamo
          </button>
        </div>
      )}

      {!loading && reclamos.map(r => {
        const estadoNorm = ESTADO_LABELS[r.estado] || r.estado;
        return (
          <div
            key={r.id}
            className="mis-reclamos-card"
            onClick={() => router.push(`/home/reclamos/${r.id}`)}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease'
            }}
          >
            <div className="mis-reclamos-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: r.visibilidad === 'privado' ? '#fee2e2' : '#e0f2fe',
                      color: r.visibilidad === 'privado' ? '#991b1b' : '#0369a1',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {r.visibilidad === 'privado' ? <ShieldAlert size={10} /> : <Eye size={10} />}
                    {r.visibilidad === 'privado' ? 'Privado' : 'Público'}
                  </span>

                  {r.editado === 1 && (
                    <span style={{ fontSize: '10px', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                      Editado
                    </span>
                  )}
                </div>

                <p className="mis-reclamos-card-title" style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '4px 0' }}>
                  {r.titulo}
                </p>

                <div className="mis-reclamos-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  {r.categoriaNombre && (
                    <span className="mis-reclamos-meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={12} /> {r.categoriaNombre}
                    </span>
                  )}
                  {r.institucionNombre && (
                    <span className="mis-reclamos-meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb' }}>
                      <Building2 size={12} /> {r.institucionNombre}
                    </span>
                  )}
                  {r.direccion && (
                    <span className="mis-reclamos-meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {r.direccion}
                    </span>
                  )}
                  <span className="mis-reclamos-meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {tiempoRelativo(r.fecha_creacion)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span
                  className="mis-reclamos-badge"
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: estadoNorm === 'Resuelto' ? '#dcfce7' : estadoNorm === 'En proceso' ? '#fef3c7' : estadoNorm === 'En revisión' ? '#e0e7ff' : estadoNorm === 'Cancelado' ? '#fee2e2' : '#f1f5f9',
                    color: estadoNorm === 'Resuelto' ? '#166534' : estadoNorm === 'En proceso' ? '#92400e' : estadoNorm === 'En revisión' ? '#3730a3' : estadoNorm === 'Cancelado' ? '#991b1b' : '#334155'
                  }}
                >
                  {estadoNorm}
                </span>
                <ChevronRight size={16} color="#94a3b8" />
              </div>
            </div>

            <ProgressBar estado={r.estado} />
          </div>
        );
      })}
    </div>
  );
}
