"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CalendarDays, Download, Loader2, UsersRound } from "lucide-react";
import apiClient from "@/services/apiClient";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/informes/KpiCard";
import StatusDonutChart from "@/components/informes/StatusDonutChart";
import ClaimTrendChart from "@/components/informes/ClaimTrendChart";
import CategoryDistributionChart from "@/components/informes/CategoryDistributionChart";
import { generateInformePdf } from "@/utils/generateInformePdf";

const PERIODOS = [
  { value: "este_mes", label: "Este mes" },
  { value: "mes_anterior", label: "Mes anterior" },
  { value: "ultimos_30_dias", label: "Últimos 30 días" },
  { value: "personalizado", label: "Personalizado" },
];

function formatNumber(value, suffix = "") {
  return value === null || value === undefined ? "Sin datos" : `${Number(value).toLocaleString("es-AR", { maximumFractionDigits: 1 })}${suffix}`;
}

export default function InformesInstitucionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [periodo, setPeriodo] = useState("este_mes");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [informe, setInforme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (periodo === "personalizado" && (!desde || !hasta)) {
        setInforme(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.get("/institucion/informes/gestion-reclamos", { params: { periodo, ...(periodo === "personalizado" ? { desde, hasta } : {}) } });
        if (!response.data?.ok) throw new Error(response.data?.mensaje);
        if (active) setInforme(response.data.data);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.mensaje || "No se pudo generar el informe. Intentá nuevamente.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [periodo, desde, hasta]);

  const kpis = informe?.kpis;
  const openBandeja = (filter) => {
    if (!informe) return;
    const params = new URLSearchParams({ fechaDesde: informe.periodo.desde, fechaHasta: informe.periodo.hasta, ...filter });
    router.push(`/institucion/reclamos?${params.toString()}`);
  };
  const downloadPdf = async () => {
    if (!informe || exporting) return;
    setExporting(true);
    try { await generateInformePdf({ informe, institucion: session?.user?.name }); }
    finally { setExporting(false); }
  };
  return (
    <div className="w-full">
      <PageHeader title="Informes" description="Analizá la gestión de reclamos de tu institución para el período seleccionado." action={<button type="button" onClick={downloadPdf} disabled={!informe || loading || exporting} className="btn-primary-report shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"><Download size={16} /><span>{exporting ? "Generando PDF…" : "Descargar PDF"}</span></button>} />

      <section className="mb-6 rounded-xl border border-border-subtle bg-surface p-4" aria-label="Período de análisis">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <label htmlFor="periodo" className="text-xs font-semibold text-text-secondary">Período de análisis</label>
            <select id="periodo" value={periodo} onChange={(event) => setPeriodo(event.target.value)} className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary">
              {PERIODOS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          {periodo === "personalizado" && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">Desde<input type="date" value={desde} max={hasta || undefined} onChange={(event) => setDesde(event.target.value)} className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary" /></label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">Hasta<input type="date" value={hasta} min={desde || undefined} onChange={(event) => setHasta(event.target.value)} className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary" /></label>
            </div>
          )}
        </div>
        {informe?.periodo && <p className="mb-0 mt-3 flex items-center gap-1 text-xs text-text-muted"><CalendarDays size={14} /> Cohorte: {informe.periodo.desde} al {informe.periodo.hasta} (Argentina)</p>}
      </section>

      {loading ? (
        <div className="flex flex-col items-center py-20 text-text-muted"><Loader2 size={28} className="animate-spin text-primary" /><p className="mt-2 text-sm">Generando informe…</p></div>
      ) : error ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
      ) : informe ? (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Indicadores principales">
            <KpiCard label="Reclamos recibidos" value={formatNumber(kpis.recibidos)} />
            <KpiCard label="Reclamos resueltos" value={formatNumber(kpis.resueltos)} />
            <KpiCard label="Resolución" value={formatNumber(kpis.porcentajeResolucion, "%")} helper="Excluye reclamos cancelados" />
            <KpiCard label="Tiempo promedio" value={formatNumber(kpis.tiempoPromedioResolucionDias, " días")} helper="Solo reclamos resueltos" />
            <KpiCard label="Reclamos demorados" value={formatNumber(kpis.demorados)} />
          </section>

          <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <section className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5"><h2 className="m-0 text-base font-bold text-text-primary">Distribución por estado</h2><p className="mb-0 mt-1 text-xs text-text-secondary">Seleccioná un estado para ver sus reclamos.</p><StatusDonutChart items={informe.porEstado} onSelect={(item) => openBandeja({ estado: item.nombre })} /></section>
            <section className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5"><h2 className="m-0 text-base font-bold text-text-primary">Distribución por categoría</h2><p className="mb-0 mt-1 text-xs text-text-secondary">Seleccioná una categoría para ver sus reclamos.</p><CategoryDistributionChart items={informe.porCategoria} onSelect={(item) => openBandeja({ categoria: String(item.id) })} /></section>
          </section>

          <section className="mt-6 rounded-xl border border-border-subtle bg-surface p-4 sm:p-5"><h2 className="m-0 text-base font-bold text-text-primary">Evolución de reclamos recibidos</h2><p className="mb-0 mt-1 text-xs text-text-secondary">Cantidad de reclamos creados por día dentro del período seleccionado.</p><ClaimTrendChart data={informe.porDia} /></section>

          <section className="mt-6 rounded-xl border border-border-subtle bg-surface p-4 sm:p-5">
            <div className="flex items-center gap-2"><UsersRound size={18} className="text-primary" /><h2 className="m-0 text-base font-bold text-text-primary">Mayor impacto ciudadano</h2></div>
            {informe.mayorImpacto.length === 0 ? <p className="mb-0 mt-5 text-sm text-text-secondary">No hay reclamos para mostrar en este período.</p> : (
              <ol className="m-0 mt-4 list-none divide-y divide-border-subtle p-0">
                {informe.mayorImpacto.map((reclamo) => <li key={reclamo.id} className="first:pt-0"><Link href={`/institucion/reclamos/${reclamo.id}`} className="flex items-center gap-3 rounded-lg py-3 transition-colors hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-primary"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-xs font-bold text-primary">{reclamo.afectadosCount}</span><div className="min-w-0 flex-1"><p className="m-0 truncate text-sm font-semibold text-text-primary">{reclamo.titulo || "Reclamo sin título"}</p><p className="mb-0 mt-0.5 text-xs text-text-secondary">{reclamo.categoriaNombre || "Sin categoría"} · {reclamo.estado}</p></div>{reclamo.afectadosCount > 0 && <span className="flex items-center gap-1 text-xs font-semibold text-text-secondary"><UsersRound size={14} /> afectados</span>}<span className="sr-only">Abrir reclamo</span></Link></li>)}
              </ol>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
