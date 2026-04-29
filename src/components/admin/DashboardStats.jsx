"use client";

import { useEffect, useRef } from "react";

const stats = [
  { label: "TOTAL REPORTES",   value: "3.842", sub: "+12% este mes",  subColor: "var(--color-success)" },
  { label: "ABIERTOS",         value: "1.204", sub: "En espera",      subColor: "var(--color-primary)" },
  { label: "EN PROCESO",       value: "638",   sub: "Asignados",      subColor: "var(--color-warning)" },
  { label: "RESUELTOS",        value: "2.000", sub: "52% del total",  subColor: "var(--color-success)" },
  { label: "USUARIOS ACTIVOS", value: "10.105",sub: "+4.2% este mes", subColor: "var(--color-success)" },
  { label: "TIEMPO PROMEDIO",  value: "3.2d",  sub: "Resolución",     subColor: "var(--color-warning)" },
];

const categorias = [
  { nombre: "Baches y pavimento",   cantidad: 982, pct: 82 },
  { nombre: "Iluminación pública",  cantidad: 768, pct: 64 },
  { nombre: "Residuos / basura",    cantidad: 624, pct: 52 },
  { nombre: "Árboles / espacios",   cantidad: 451, pct: 38 },
  { nombre: "Denuncias varias",     cantidad: 297, pct: 25 },
  { nombre: "Otros",                cantidad: 218, pct: 18 },
];

const ultimosReportes = [
  { titulo: "Bache en Av. Corrientes 1240",    meta: "Hace 12 min · San Martín",     estado: "Abierto",     color: "#E6F1FB", textColor: "#0C447C" },
  { titulo: "Luminaria apagada — Belgrano 450",meta: "Hace 1h · Centro",              estado: "En proceso",  color: "#FAEEDA", textColor: "#633806" },
  { titulo: "Contenedor de basura desbordado", meta: "Hace 3h · Palermo",            estado: "Abierto",     color: "#E6F1FB", textColor: "#0C447C" },
  { titulo: "Árbol caído sobre vereda",        meta: "Ayer, 18:40 · Villa del Parque",estado: "Resuelto",   color: "#EAF3DE", textColor: "#27500A" },
  { titulo: "Pérdida de agua en calzada",      meta: "Ayer, 14:15 · Caballito",      estado: "En proceso",  color: "#FAEEDA", textColor: "#633806" },
];

export default function DashboardStats() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = () => {
      if (!window.Chart || !chartRef.current) return;
      if (chartInstance.current) chartInstance.current.destroy();

      chartInstance.current = new window.Chart(chartRef.current, {
        type: "line",
        data: {
          labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
          datasets: [{
            label: "Reportes",
            data: [280, 320, 410, 390, 460, 520],
            borderColor: "#378ADD",
            backgroundColor: "rgba(55,138,221,0.08)",
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: "#378ADD",
            fill: true,
            tension: 0.35,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { size: 11 } } },
          },
        },
      });
    };

    if (window.Chart) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
      script.onload = init;
      document.head.appendChild(script);
    }

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, []);

  return (
    <div>

      {/* Stats grid */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: 10,
            border: "1px solid var(--color-border)", padding: "16px 20px",
          }}>
            <p style={{ margin: 0, fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>{s.label}</p>
            <p style={{ margin: "6px 0 2px", fontSize: 26, fontWeight: "bold", color: "var(--color-primary)" }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 12, color: s.subColor, fontWeight: "bold" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Dos columnas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>

        {/* Categorías */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid var(--color-border)", padding: "20px 24px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>REPORTES POR CATEGORÍA</p>
          {categorias.map((c) => (
            <div key={c.nombre} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "#444", width: 150, flexShrink: 0 }}>{c.nombre}</span>
              <div style={{ flex: 1, height: 8, background: "var(--color-border)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${c.pct}%`, height: "100%", background: "#378ADD", borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 12, color: "#aaa", width: 36, textAlign: "right", flexShrink: 0 }}>{c.cantidad}</span>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid var(--color-border)", padding: "20px 24px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>ACTIVIDAD MENSUAL</p>
          <div style={{ position: "relative", width: "100%", height: 200 }}>
            <canvas ref={chartRef} role="img" aria-label="Gráfico de reportes por mes" />
          </div>
        </div>

      </div>

      {/* Últimos reportes */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid var(--color-border)", padding: "20px 24px" }}>
        <p style={{ margin: "0 0 14px", fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>ÚLTIMOS REPORTES</p>
        {ultimosReportes.map((r, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 0", borderBottom: i < ultimosReportes.length - 1 ? "1px solid var(--color-border)" : "none",
            gap: 8,
          }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 13, color: "#333" }}>{r.titulo}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{r.meta}</p>
            </div>
            <span style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
              background: r.color, color: r.textColor, whiteSpace: "nowrap",
            }}>{r.estado}</span>
          </div>
        ))}
      </div>

    </div>
  );
}