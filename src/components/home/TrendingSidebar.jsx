"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const MAP_DOTS = [
  { top: "35%", left: "45%", color: "#ef4444" },
  { top: "55%", left: "30%", color: "#2D3A8C" },
  { top: "45%", left: "65%", color: "#ef4444" },
];

export default function TrendingSidebar() {
  const [tendencias, setTendencias] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/feed/tendencias`)
      .then(r => r.json())
      .then(d => { if (d.ok) setTendencias(d.data); })
      .catch(() => {});
  }, []);

  return (
    <aside className="home-right-sidebar">

      <div>
        <p className="home-sidebar-section-title">Tendencias en tu zona</p>
        {tendencias.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--home-muted)" }}>Sin datos aún.</p>
        )}
        {tendencias.map((t, i) => (
          <div key={t.id} className="trending-item">
            <div>
              <div className="trending-tag">#{t.nombre.replace(/\s+/g, "")}</div>
              <div className="trending-count">{t.cantidad} reportes hoy</div>
            </div>
            <span style={{ fontSize: 13, color: "var(--home-muted)", fontWeight: 700 }}>
              {i + 1}
            </span>
          </div>
        ))}
      </div>

      <div>
        <p className="home-sidebar-section-title">Actividad en vivo</p>
        <div className="live-map-placeholder">
          {MAP_DOTS.map((dot, i) => (
            <span
              key={i}
              className="live-map-dot"
              style={{ top: dot.top, left: dot.left, background: dot.color }}
            />
          ))}
          <span style={{ fontSize: 11, marginTop: 110, position: "absolute" }}>
            Mostrando reportes recientes en un radio de 5 km
          </span>
        </div>
      </div>

    </aside>
  );
}
