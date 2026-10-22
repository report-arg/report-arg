"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import { createInformePdf } from "@/utils/generateInformePdf";

export default function InformePdfPreviewModal({ informe, institucion, exporting, onClose, onDownload }) {
  const pagesRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function renderPdf() {
      const container = pagesRef.current;
      if (!container) return;

      container.replaceChildren();
      setLoading(true);
      setError("");
      try {
        const [{ getDocument, GlobalWorkerOptions }, doc] = await Promise.all([
          import("pdfjs-dist/legacy/build/pdf.mjs"),
          createInformePdf({ informe, institucion }),
        ]);
        GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
        const pdf = await getDocument({ data: new Uint8Array(doc.output("arraybuffer")) }).promise;
        if (cancelled) return;

        setPageCount(pdf.numPages);
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          if (cancelled) return;
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          // Cada página se ajusta por alto y ancho disponibles para que se vea
          // completa antes de que la persona decida descargarla.
          canvas.className = "block h-auto max-h-[calc(100dvh-10rem)] w-auto max-w-full rounded-sm bg-white shadow-md";
          container.appendChild(canvas);
          await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        }
      } catch (renderError) {
        if (!cancelled) {
          console.error("Error al renderizar vista previa del PDF", renderError);
          setError("No se pudo mostrar la vista previa. Intentá nuevamente.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    renderPdf();
    return () => { cancelled = true; };
  }, [informe, institucion]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-labelledby="vista-previa-pdf">
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-100 shadow-2xl sm:h-[min(92dvh,860px)] sm:max-w-4xl sm:rounded-xl">
        <header className="flex shrink-0 items-center justify-between bg-[#183657] px-3 py-2.5 text-white sm:px-5 sm:py-3">
          <div className="min-w-0">
            <h2 id="vista-previa-pdf" className="m-0 truncate text-xs font-bold sm:text-sm">Vista previa del documento</h2>
            <p className="mb-0 mt-0.5 text-[10px] text-slate-300 sm:text-[11px]">Informe de gestión de reclamos{pageCount ? ` · ${pageCount} página${pageCount === 1 ? "" : "s"}` : ""}</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-md p-1 text-slate-200 transition-colors hover:bg-white/10 hover:text-white" aria-label="Cerrar vista previa"><X size={18} /></button>
        </header>

        <div className="relative min-h-0 flex-1 overflow-auto bg-slate-200 p-3 sm:p-5">
          {loading && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-200/90 text-sm text-text-muted"><Loader2 size={28} className="animate-spin text-primary" />Generando vista previa…</div>}
          {error ? <p role="alert" className="mx-auto max-w-md rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : <div ref={pagesRef} className="mx-auto flex min-h-full w-full flex-col items-center gap-4" />}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-white px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-border-subtle px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-subtle sm:px-4">Cancelar</button>
          <button type="button" onClick={onDownload} disabled={loading || Boolean(error) || exporting} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:px-4"><Download size={15} />{exporting ? "Descargando…" : "Descargar PDF"}</button>
        </footer>
      </div>
    </div>
  );
}
