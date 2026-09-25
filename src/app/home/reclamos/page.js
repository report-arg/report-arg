"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FilePlus2, MapPin, Clock, Tag, ChevronRight, Building2 } from "lucide-react";
import apiClient from "@/services/apiClient";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import ClaimVisibilityBadge from "@/components/reclamos/ClaimVisibilityBadge";
import ClaimProgress from "@/components/reclamos/ClaimProgress";
import { tiempoRelativo } from "@/utils/dateFormatters";

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
        <div className="feed-empty" style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
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

      {!loading && reclamos.map(r => (
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
                <ClaimVisibilityBadge visibilidad={r.visibilidad} />

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
              <ClaimStatusBadge estado={r.estado} />
              <ChevronRight size={16} color="#94a3b8" />
            </div>
          </div>

          <ClaimProgress estado={r.estado} />
        </div>
      ))}
    </div>
  );
}
