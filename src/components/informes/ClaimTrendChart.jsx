"use client";

import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function ClaimTrendChart({ data }) {
  if (!data.length) return <p className="mb-0 mt-5 text-sm text-text-secondary">No hay reclamos recibidos en este período.</p>;
  return (
    <div className="mt-5 h-64" role="img" aria-label="Evolución diaria de reclamos recibidos">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 12, left: -20, bottom: 0 }}>
          <defs><linearGradient id="receivedClaims" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid strokeDasharray="4 8" stroke="var(--color-border-subtle)" vertical={false} />
          <XAxis dataKey="etiqueta" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} minTickGap={28} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
          <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.fecha || ""} formatter={(value) => [`${value} reclamo${Number(value) === 1 ? "" : "s"}`, "Recibidos"]} cursor={{ stroke: "#2563eb", strokeDasharray: "4 4" }} />
          <Area type="monotone" dataKey="recibidos" stroke="none" fill="url(#receivedClaims)" />
          <Line type="monotone" dataKey="recibidos" stroke="#2563eb" strokeWidth={3} dot={{ r: 3, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
