"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronLeft, ChevronRight, SlidersHorizontal, X, RefreshCw,
} from "lucide-react";
import FeedCard from "@/components/home/FeedCard";
import CitizenHomeHeader from "@/components/home/CitizenHomeHeader";
import EmptyState from "@/components/common/EmptyState";
import { getCategoryIcon } from "@/components/brand/icons";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [perfil, setPerfil] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);

  // Filtros
  const [tipo, setTipo] = useState("todos");   // todos | comunicado | reclamo
  const [categoriaId, setCategoriaId] = useState(null);
  const [mostrarFil, setMostrarFil] = useState(false);

  // Cargar datos del perfil del usuario para obtener contexto territorial real
  useEffect(() => {
    if (!session?.user?.id) return;
    apiClient.get(`/auth/me`)
      .then(r => r.data)
      .then(d => { if (d.ok) setPerfil(d.data); })
      .catch(() => {});
  }, [session?.user?.id]);

  // Cargar lista de categorías públicas
  useEffect(() => {
    apiClient.get(`/feed/categorias`)
      .then(r => r.data)
      .then(d => { if (d.ok) setCategorias(d.data); })
      .catch(() => { toast.error("No se pudieron cargar las categorías"); });
  }, []);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pagina, limite: 10 });
      if (tipo !== "todos") params.set("tipo", tipo);
      if (categoriaId) params.set("categoria", categoriaId);

      const res = await apiClient.get(`/feed?${params}`);
      const data = res.data;
      if (data.ok) {
        setFeed(data.data || []);
        setTotal(data.total ?? 0);
        setTotalPaginas(data.totalPaginas ?? 1);
      } else {
        toast.error(data.error || "Ocurrió un error al cargar las publicaciones");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al cargar el feed");
    } finally {
      setLoading(false);
    }
  }, [tipo, categoriaId, pagina]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  function cambiarTipo(t) { setTipo(t); setPagina(1); }
  function cambiarCat(id) { setCategoriaId(id); setPagina(1); }
  function limpiarFiltros() { setTipo("todos"); setCategoriaId(null); setPagina(1); }

  const hayFiltros = tipo !== "todos" || categoriaId !== null;
  const catActiva = categorias.find(c => c.id === categoriaId);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:px-6">

      {/* Encabezado humano con contexto territorial y CTA principal */}
      <CitizenHomeHeader perfil={perfil} />

      {/* Barra de Filtros */}
      <div className="mb-4 p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-2">
        {/* Tabs por Tipo */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
          {[
            { id: "todos", label: "Todo" },
            { id: "reclamo", label: "Reclamos" },
            { id: "comunicado", label: "Comunicados" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => cambiarTipo(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tipo === t.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Botón desplegable de Categorías */}
          <button
            onClick={() => setMostrarFil(v => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              catActiva || mostrarFil
                ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] border-[var(--color-brand-200)]"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>{catActiva ? catActiva.nombre : "Categorías"}</span>
            {catActiva && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-600)]" />
            )}
          </button>

          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Limpiar todos los filtros"
            >
              <X size={13} />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid de Chips de Categorías (Desplegable) */}
      {mostrarFil && (
        <div className="mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap gap-1.5">
          <button
            onClick={() => cambiarCat(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              categoriaId === null
                ? "bg-[var(--color-brand-600)] text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-200/60 border border-slate-200"
            }`}
          >
            Todas
          </button>

          {categorias.map(cat => {
            const CategoryIcon = getCategoryIcon(cat.codigo || cat.nombre, cat.nombre);
            const isSelected = categoriaId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => cambiarCat(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--color-brand-600)] text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <CategoryIcon size={14} className={isSelected ? "text-white" : "text-[var(--color-brand-600)]"} />
                <span>{cat.nombre}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Contador de resultados */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs text-slate-500 font-medium">
          {loading ? (
            "Consultando actividad en tu ciudad..."
          ) : (
            <>
              Mostrando <strong className="text-slate-900">{total}</strong> publicación{total !== 1 ? "es" : ""}
              {catActiva && <> en <span className="font-bold text-[var(--color-brand-700)]">{catActiva.nombre}</span></>}
            </>
          )}
        </span>

        <button
          onClick={fetchFeed}
          className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
          title="Actualizar feed"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Feed Content */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-slate-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-32 h-3.5 bg-slate-200 rounded" />
                  <div className="w-20 h-2.5 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="w-3/4 h-5 bg-slate-200 rounded mb-2" />
              <div className="w-full h-12 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && feed.length === 0 && (
        <EmptyState
          title={catActiva ? `No hay reportes en ${catActiva.nombre}` : "Por acá está todo tranquilo"}
          description={
            hayFiltros
              ? "No encontramos publicaciones que coincidan con los filtros seleccionados."
              : "Todavía no hay publicaciones en tu ciudad. ¡Sé el primero en reportar un problema!"
          }
          actionLabel={hayFiltros ? "Limpiar filtros" : "Reportar un problema"}
          onAction={hayFiltros ? limpiarFiltros : () => router.push("/home/reclamos/nuevo")}
        />
      )}

      {!loading && feed.map(item => (
        <FeedCard
          key={item.id}
          item={item}
          onEliminado={(id) => setFeed(prev => prev.filter(x => x.id !== id))}
        />
      ))}

      {/* Paginación */}
      {!loading && totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6 mb-8">
          <button
            onClick={() => setPagina(p => Math.max(p - 1, 1))}
            disabled={pagina === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={15} />
            <span>Anterior</span>
          </button>

          <span className="text-xs font-bold text-slate-600 px-2">
            {pagina} / {totalPaginas}
          </span>

          <button
            onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))}
            disabled={pagina === totalPaginas}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            <span>Siguiente</span>
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
