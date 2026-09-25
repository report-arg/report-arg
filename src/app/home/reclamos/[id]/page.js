"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, MapPin, Clock, Tag, Building2, Eye, ShieldAlert,
  Calendar, CheckCircle2, History, AlertTriangle, UserCheck, AlertCircle, FileText
} from "lucide-react";
import apiClient from "@/services/apiClient";

const ESTADO_BADGES = {
  "Pendiente": { bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" },
  "En revisión": { bg: "#e0e7ff", text: "#3730a3", border: "#a5b4fc" },
  "En proceso": { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  "Resuelto": { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  "Cancelado": { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
};

function formatearFecha(fechaStr) {
  if (!fechaStr) return "";
  const f = new Date(fechaStr);
  return f.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function tiempoRelativo(fechaStr) {
  if (!fechaStr) return "";
  const diff = Date.now() - new Date(fechaStr).getTime();
  const min = Math.floor(diff / 60000);
  const hs = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  if (hs < 24) return `Hace ${hs}h`;
  return `Hace ${dias} día${dias > 1 ? "s" : ""}`;
}

export default function ReclamoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [reclamo, setReclamo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    apiClient.get(`/reclamos/${params.id}`)
      .then(r => r.data)
      .then(d => {
        if (d.ok) {
          setReclamo(d.data);
          setHistorial(d.data.historial || []);
        } else {
          setError(d.mensaje || "Error al obtener reclamo.");
        }
      })
      .catch(err => {
        const msg = err.response?.data?.mensaje || "No se pudo cargar el reclamo.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
        Cargando detalle del reclamo...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
        <button
          onClick={() => router.back()}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#2563eb", marginBottom: "16px", fontWeight: 600 }}
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "12px", padding: "20px", textAlign: "center", color: "#991b1b" }}>
          <AlertTriangle size={32} style={{ margin: "0 auto 10px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>Acceso Restringido</h3>
          <p style={{ fontSize: "14px" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!reclamo) return null;

  const badgeEst = ESTADO_BADGES[reclamo.estado] || ESTADO_BADGES["Pendiente"];

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "20px 16px" }}>

      {/* Botón Volver */}
      <button
        onClick={() => router.back()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: "#f1f5f9",
          border: "none",
          padding: "6px 12px",
          borderRadius: "8px",
          color: "#334155",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: "16px"
        }}
      >
        <ArrowLeft size={16} /> Volver a reclamos
      </button>

      {/* Tarjeta Principal de Detalle */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

        {/* Encabezado con Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <span style={{
            fontSize: "11px",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "12px",
            backgroundColor: badgeEst.bg,
            color: badgeEst.text,
            border: `1px solid ${badgeEst.border}`
          }}>
            {reclamo.estado}
          </span>

          <span style={{
            fontSize: "11px",
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: "12px",
            backgroundColor: reclamo.visibilidad === "privado" ? "#fee2e2" : "#e0f2fe",
            color: reclamo.visibilidad === "privado" ? "#991b1b" : "#0369a1",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}>
            {reclamo.visibilidad === "privado" ? <ShieldAlert size={12} /> : <Eye size={12} />}
            {reclamo.visibilidad === "privado" ? "Reclamo Privado" : "Reclamo Público"}
          </span>

          {reclamo.editado === 1 && (
            <span style={{ fontSize: "11px", fontWeight: 600, backgroundColor: "#f1f5f9", color: "#475569", padding: "4px 8px", borderRadius: "6px" }}>
              Editado
            </span>
          )}
        </div>

        {/* Título */}
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "10px", lineHeight: 1.3 }}>
          {reclamo.titulo}
        </h1>

        {/* Metadatos */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "13px", color: "#64748b", marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid #f1f5f9" }}>
          {reclamo.categoriaNombre && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <Tag size={14} color="#2563eb" /> {reclamo.categoriaNombre}
            </span>
          )}
          {reclamo.direccion && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <MapPin size={14} color="#059669" /> {reclamo.direccion}
            </span>
          )}
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <Calendar size={14} /> Creado el {formatearFecha(reclamo.fecha_creacion)}
          </span>
        </div>

        {/* Institución Asignada (HU-04) */}
        <div style={{ backgroundColor: "#f8fafc", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px" }}>
          <Building2 size={20} color="#2563eb" />
          <div>
            <p style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "#64748b", letterSpacing: "0.5px" }}>Institución Asignada</p>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
              {reclamo.institucionNombre || "Institución Principal de la Ciudad"}
            </p>
          </div>
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>Descripción</h3>
          <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, whiteSpace: "pre-line" }}>
            {reclamo.descripcion}
          </p>
        </div>

        {/* Mensaje de Cancelación o Resolución si aplica */}
        {reclamo.motivo_cancelacion && (
          <div style={{ backgroundColor: "#fee2e2", borderRadius: "10px", padding: "14px", marginBottom: "16px", border: "1px solid #fca5a5" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#991b1b", marginBottom: "4px" }}>
              Motivo de Cancelación ({reclamo.cancelado_por_tipo === 'ciudadano' ? 'por el Ciudadano' : 'por la Institución'}):
            </p>
            <p style={{ fontSize: "13px", color: "#7f1d1d" }}>{reclamo.motivo_cancelacion}</p>
          </div>
        )}

        {reclamo.mensaje_resolucion && (
          <div style={{ backgroundColor: "#dcfce7", borderRadius: "10px", padding: "14px", marginBottom: "16px", border: "1px solid #86efac" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#166534", marginBottom: "4px" }}>
              Mensaje de Resolución Institucional:
            </p>
            <p style={{ fontSize: "13px", color: "#14532d" }}>{reclamo.mensaje_resolucion}</p>
          </div>
        )}
      </div>

      {/* Timeline de Historial Inmutable (HU-18) */}
      <div style={{ marginTop: "24px", backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <History size={18} color="#2563eb" /> Historial y Auditoría de Gestión
        </h3>

        {historial.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#64748b" }}>No hay registros en el historial todavía.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderLeft: "2px solid #e2e8f0", paddingLeft: "16px", marginLeft: "8px" }}>
            {historial.map((ev, index) => (
              <div key={ev.id || index} style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "-23px",
                  top: "2px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  border: "2px solid #ffffff"
                }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    {ev.tipo_evento}
                  </span>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    {formatearFecha(ev.fecha_creacion)}
                  </span>
                </div>

                <p style={{ fontSize: "13px", color: "#475569", marginTop: "2px" }}>
                  {ev.detalle || `Evento ${ev.tipo_evento} registrado`}
                </p>

                {ev.autorNombre && (
                  <p style={{ fontSize: "11px", color: "#64748b", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <UserCheck size={11} /> Por: {ev.autorNombre} ({ev.autorRol || "Usuario"})
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
