"use client";

import { Download, X } from "lucide-react";

function value(value, suffix = "") {
  return value === null || value === undefined ? "Sin datos" : `${Number(value).toLocaleString("es-AR", { maximumFractionDigits: 1 })}${suffix}`;
}

function CategoryRows({ items }) {
  const max = Math.max(...items.map((item) => item.cantidad), 1);
  return (
    <div className="space-y-1.5">
      {items.slice(0, 5).map((item) => <div key={item.id || item.nombre} className="grid grid-cols-[58px_1fr_16px] items-center gap-1.5 text-[6px] text-slate-600"><span className="truncate">{item.nombre}</span><span className="h-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-blue-500" style={{ width: `${(item.cantidad / max) * 100}%` }} /></span><strong className="text-right text-slate-700">{item.cantidad}</strong></div>)}
    </div>
  );
}

export default function InformePdfPreviewModal({ informe, institucion, exporting, onClose, onDownload }) {
  const { kpis, periodo, porEstado, porCategoria, mayorImpacto } = informe;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-labelledby="vista-previa-pdf">
      <div className="flex h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-slate-100 shadow-2xl sm:h-[min(92dvh,860px)]">
        <header className="flex shrink-0 items-center justify-between bg-[#183657] px-3 py-2 text-white sm:px-5 sm:py-3">
          <div className="min-w-0">
            <h2 id="vista-previa-pdf" className="m-0 truncate text-xs font-bold sm:text-sm">Vista previa del documento</h2>
            <p className="mb-0 mt-0.5 text-[10px] text-slate-300 sm:text-[11px]">Informe de gestión de reclamos</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-md p-1 text-slate-200 transition-colors hover:bg-white/10 hover:text-white" aria-label="Cerrar vista previa"><X size={18} /></button>
        </header>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-2 sm:p-4">
          <article className="flex shrink-0 flex-col overflow-hidden bg-white px-[7%] py-[5%] shadow-md" style={{ height: "min(68dvh, 650px)", aspectRatio: "210 / 297" }} aria-label="Resumen visual del informe">
            <header className="flex items-start justify-between border-b border-blue-200 pb-[3%]">
              <img src="/logo.png" alt="ReportARG" className="h-auto w-[22%] object-contain object-left" />
              <div className="max-w-[44%] text-right text-[6px] leading-tight text-slate-500"><strong className="block text-[7px] text-slate-700">{institucion || "Institución"}</strong><span>Informe institucional</span></div>
            </header>

            <div className="mt-[5%]">
              <p className="m-0 text-[5px] font-bold uppercase tracking-[0.16em] text-blue-600">Reporte institucional</p>
              <h3 className="mb-[1%] mt-[2%] text-[10px] font-bold leading-tight text-slate-800">Informe de gestión de reclamos</h3>
              <p className="m-0 text-[5px] text-slate-500">Período analizado: {periodo.desde} al {periodo.hasta}</p>
            </div>

            <section className="mt-[4%] grid grid-cols-5 overflow-hidden rounded border border-slate-200">
              {[
                ["Recibidos", value(kpis.recibidos)], ["Resueltos", value(kpis.resueltos)], ["Resolución", value(kpis.porcentajeResolucion, "%")], ["Tiempo promedio", value(kpis.tiempoPromedioResolucionDias, " días")], ["Demorados", value(kpis.demorados)],
              ].map(([label, amount]) => <div key={label} className="min-w-0 border-r border-slate-200 px-[7%] py-[12%] last:border-r-0"><p className="m-0 truncate text-[4px] text-slate-500">{label}</p><p className="mb-0 mt-[10%] text-[8px] font-bold text-slate-800">{amount}</p></div>)}
            </section>

            <section className="mt-[4%] grid h-[31%] grid-cols-2 gap-[3%]">
              <div className="rounded border border-slate-200 p-[7%]"><p className="m-0 text-[5px] font-bold text-slate-700">Distribución por estado</p><div className="mx-auto my-[8%] h-[42%] w-[42%] rounded-full" style={{ background: "conic-gradient(#2563eb 0 34%, #14b8a6 34% 62%, #f59e0b 62% 78%, #8b5cf6 78% 100%)" }}><div className="relative left-[24%] top-[24%] flex h-[52%] w-[52%] items-center justify-center rounded-full bg-white text-[7px] font-bold text-slate-800">{kpis.recibidos}</div></div><div className="space-y-1">{porEstado.slice(0, 4).map((item) => <div key={item.nombre} className="flex justify-between text-[5px] text-slate-500"><span className="truncate">{item.nombre}</span><strong>{item.cantidad}</strong></div>)}</div></div>
              <div className="rounded border border-slate-200 p-[7%]"><p className="m-0 text-[5px] font-bold text-slate-700">Reclamos por categoría</p><div className="mt-[9%]"><CategoryRows items={porCategoria} /></div></div>
            </section>

            <section className="mt-[4%] rounded border border-slate-200 p-[3.5%]"><p className="m-0 text-[5px] font-bold text-slate-700">Reclamos con mayor impacto ciudadano</p><div className="mt-[3%] space-y-1.5">{mayorImpacto.slice(0, 3).map((reclamo, index) => <div key={reclamo.id} className="flex items-center gap-1.5 text-[5px] text-slate-600"><span className="flex h-2 w-2 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[4px] font-bold text-blue-600">{index + 1}</span><span className="truncate">{reclamo.titulo || "Reclamo sin título"}</span><strong className="ml-auto shrink-0 text-[4px]">{reclamo.afectadosCount} afectados</strong></div>)}</div></section>

            <p className="mb-0 mt-auto pt-[4%] text-center text-[4px] text-slate-400">Reporte generado por ReportARG · Informe institucional</p>
          </article>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-white px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-border-subtle px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-subtle sm:px-4">Cancelar</button>
          <button type="button" onClick={onDownload} disabled={exporting} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:px-4"><Download size={15} />{exporting ? "Descargando…" : "Descargar PDF"}</button>
        </footer>
      </div>
    </div>
  );
}
