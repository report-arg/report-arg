"use client";

import { useState, useId } from "react";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Algoritmo para obtener escala de enteros estricta en el eje Y
function calcularEscalaEntera(valorMaximo) {
  if (valorMaximo <= 0) {
    return { max: 4, ticks: [0, 1, 2, 3, 4] };
  }
  if (valorMaximo <= 5) {
    const ticks = [];
    for (let i = 0; i <= valorMaximo; i++) ticks.push(i);
    return { max: valorMaximo, ticks };
  }
  let paso = 1;
  if (valorMaximo <= 12) paso = 2;
  else if (valorMaximo <= 25) paso = 5;
  else if (valorMaximo <= 50) paso = 10;
  else if (valorMaximo <= 100) paso = 20;
  else paso = Math.ceil(valorMaximo / 50) * 10;

  const max = Math.ceil(valorMaximo / paso) * paso;
  const ticks = [];
  for (let t = 0; t <= max; t += paso) {
    ticks.push(t);
  }
  return { max, ticks };
}

export default function DashboardActivityChart({ actividad = [] }) {
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const chartId = useId();

  const datosActividad12Meses = MESES.map((nombreMes, index) => {
    const numMes = index + 1;
    const encontrado = actividad.find((a) => Number(a.mes) === numMes);
    return {
      mesIndex: index,
      mesNombre: nombreMes,
      total: encontrado ? Number(encontrado.total) : 0,
    };
  });

  const maxTotalActividad = Math.max(...datosActividad12Meses.map((d) => d.total), 0);
  const escalaY = calcularEscalaEntera(maxTotalActividad);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-subtle shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
            Actividad Mensual
          </h3>
          <p className="text-xs text-text-secondary m-0 mt-0.5">
            Volumen de reclamos ingresados por mes (escala entera)
          </p>
        </div>
        <span className="text-[11px] font-semibold text-text-muted">
          Año {new Date().getFullYear()}
        </span>
      </div>

      {/* Gráfico SVG nativo liviano y responsivo */}
      <div className="relative w-full pt-2">
        <svg
          viewBox="0 0 540 200"
          className="w-full h-48 sm:h-56 select-none overflow-visible"
          aria-label="Gráfico de barras de actividad mensual de reclamos"
        >
          <defs>
            <linearGradient id={`${chartId}-barGradient`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Líneas horizontales de guía para ticks enteros */}
          {escalaY.ticks.map((tickVal) => {
            const yPos = 160 - (tickVal / escalaY.max) * 130;
            return (
              <g key={`tick-${tickVal}`}>
                <line
                  x1="35"
                  y1={yPos}
                  x2="530"
                  y2={yPos}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray={tickVal === 0 ? "none" : "3 3"}
                />
                <text
                  x="28"
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[10px] fill-text-muted font-medium"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Columnas mensuales */}
          {datosActividad12Meses.map((d, idx) => {
            const xPos = 45 + idx * 40;
            const barHeight = escalaY.max > 0 ? (d.total / escalaY.max) * 130 : 0;
            const yPos = 160 - barHeight;
            const isHovered = hoveredMonth === idx;

            return (
              <g
                key={d.mesNombre}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredMonth(idx)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Área de interacción ampliada */}
                <rect
                  x={xPos - 5}
                  y="15"
                  width="34"
                  height="160"
                  fill="transparent"
                />

                {/* Barra de valor */}
                <rect
                  x={xPos}
                  y={d.total > 0 ? yPos : 158}
                  width="24"
                  height={d.total > 0 ? Math.max(barHeight, 3) : 2}
                  rx="4"
                  fill={isHovered ? "#0284c7" : `url(#${chartId}-barGradient)`}
                  className="transition-all duration-150"
                />

                {/* Cantidad sobre la barra */}
                {d.total > 0 && (
                  <text
                    x={xPos + 12}
                    y={Math.max(yPos - 6, 25)}
                    textAnchor="middle"
                    className={`text-[10px] font-bold ${
                      isHovered ? "fill-primary font-black" : "fill-text-primary"
                    }`}
                  >
                    {d.total}
                  </text>
                )}

                {/* Etiqueta del mes */}
                <text
                  x={xPos + 12}
                  y="180"
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered ? "fill-primary font-bold" : "fill-text-muted"
                  }`}
                >
                  {d.mesNombre}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip informativo */}
        {hoveredMonth !== null && (
          <div className="text-center mt-2 text-xs font-semibold text-text-secondary bg-surface-subtle py-1.5 px-3 rounded-lg border border-border-subtle inline-block">
            <span>
              {MESES[hoveredMonth]}:{" "}
              <strong className="text-text-primary">
                {datosActividad12Meses[hoveredMonth].total} reclamo(s)
              </strong>{" "}
              ingresados
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
