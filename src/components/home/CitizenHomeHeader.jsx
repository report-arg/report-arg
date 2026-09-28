"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MapPin, Search, Map, Plus } from "lucide-react";
import { ReportProblemIcon } from "@/components/brand/icons";

export default function CitizenHomeHeader({ perfil }) {
  const router = useRouter();
  const { data: session } = useSession();

  const nombreUsuario = perfil?.nombre || session?.user?.name || "Ciudadano";
  const primerNombre = nombreUsuario.split(" ")[0];

  const ciudad = perfil?.ciudad_activa || perfil?.ciudad_declarada || null;
  const provincia = perfil?.provincia_activa || perfil?.provincia_declarada || null;

  const ubicacionTexto = ciudad
    ? `${ciudad}${provincia ? `, ${provincia}` : ""}`
    : "Sin ciudad activa";

  const preguntaTexto = ciudad
    ? `¿Qué está pasando en ${ciudad}?`
    : "¿Qué está pasando en tu ciudad?";

  return (
    <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[var(--color-brand-900)] text-white shadow-md border border-slate-700/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2.5 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-xs">
            <MapPin size={12} className="text-[var(--color-brand-300)]" />
            <span>{ubicacionTexto}</span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-1">
            Hola, {primerNombre}
          </h1>
          <p className="text-xs md:text-sm text-slate-300">
            {preguntaTexto}
          </p>
        </div>

        {/* Acciones principales del ciudadano */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
          <button
            onClick={() => router.push("/home/reclamos/nuevo")}
            className="btn-primary-report"
          >
            <ReportProblemIcon size={16} />
            <span>Reportar un problema</span>
          </button>

          <button
            onClick={() => router.push("/home/explorar")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            <Search size={14} />
            <span>Explorar</span>
          </button>

          <button
            onClick={() => router.push("/home/mapa")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            <Map size={14} />
            <span>Mapa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
