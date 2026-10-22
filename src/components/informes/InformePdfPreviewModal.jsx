"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import { createInformePdf } from "@/utils/generateInformePdf";

export default function InformePdfPreviewModal({ informe, institucion, exporting, onClose, onDownload }) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let url = "";

    async function createPreview() {
      setPreviewUrl("");
      setError("");
      try {
        const doc = await createInformePdf({ informe, institucion });
        url = URL.createObjectURL(doc.output("blob"));
        if (active) setPreviewUrl(url);
      } catch {
        if (active) setError("No se pudo generar la vista previa del documento.");
      }
    }

    createPreview();
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [informe, institucion]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="vista-previa-pdf">
      <div className="flex h-[min(92vh,860px)] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-slate-100 shadow-2xl">
        <header className="flex items-center justify-between bg-[#183657] px-5 py-3 text-white">
          <div>
            <h2 id="vista-previa-pdf" className="m-0 text-sm font-bold">Vista previa del documento</h2>
            <p className="mb-0 mt-0.5 text-[11px] text-slate-300">Informe de gestión de reclamos</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-200 transition-colors hover:bg-white/10 hover:text-white" aria-label="Cerrar vista previa"><X size={18} /></button>
        </header>

        <div className="min-h-0 flex-1 p-3 sm:p-5">
          {error ? <p role="alert" className="m-0 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : !previewUrl ? <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-text-muted"><Loader2 size={28} className="animate-spin text-primary" />Generando vista previa…</div> : <iframe title="Vista previa del informe PDF" src={previewUrl} className="h-full w-full rounded-sm border border-slate-200 bg-white shadow-sm" />}
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-border-subtle px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-subtle">Cancelar</button>
          <button type="button" onClick={onDownload} disabled={!previewUrl || exporting} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"><Download size={15} />{exporting ? "Descargando…" : "Descargar PDF"}</button>
        </footer>
      </div>
    </div>
  );
}
