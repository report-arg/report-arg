"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, RefreshCw } from "lucide-react";
import FeedCard from "@/components/home/FeedCard";
import EmptyState from "@/components/common/EmptyState";
import { getCategoryIcon } from "@/components/brand/icons";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";

function ExplorarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryInicial = searchParams.get("q") || "";
  const catInicial = searchParams.get("categoria") ? Number(searchParams.get("categoria")) : null;

  const [busqueda, setBusqueda] = useState(queryInicial);
  const [tipo, setTipo] = useState("todos");
  const [categoriaId, setCategoriaId] = useState(catInicial);
  const [categorias, setCategorias] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/feed/categorias`)
      .then(r => r.data)
      .then(d => { if (d.ok) setCategorias(d.data || []); })
      .catch(() => {});
  }, []);

  const fetchExplorar = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limite: 30 });
      if (tipo !== "todos") params.set("tipo", tipo);
      if (categoriaId) params.set("categoria", categoriaId);

      const res = await apiClient.get(`/feed?${params}`);
      const data = res.data;
      if (data.ok) {
        let items = data.data || [];
        if (busqueda.trim()) {
          const q = busqueda.toLowerCase().trim();
          items = items.filter(i =>
            (i.titulo && i.titulo.toLowerCase().includes(q)) ||
            (i.descripcion && i.descripcion.toLowerCase().includes(q)) ||
            (i.direccion && i.direccion.toLowerCase().includes(q)) ||
            (i.categoriaNombre && i.categoriaNombre.toLowerCase().includes(q))
          );
        }
        setFeed(items);
      }
    } catch {
      toast.error("Error al cargar publicaciones en Explorar");
    } finally {
      setLoading(false);
    }
  }, [tipo, categoriaId, busqueda]);

  useEffect(() => {
    fetchExplorar();
  }, [fetchExplorar]);

  function limpiarFiltros() {
    setBusqueda("");
    setTipo("todos");
    setCategoriaId(null);
    router.replace("/home/explorar");
  }

  const hayFiltros = busqueda.trim() !== "" || tipo !== "todos" || categoriaId !== null;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">

      {/* Header Explorar */}
      <div className="mb-6 pb-4 border-b border-slate-200/80">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Explorar la ciudad
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Descubrí reportes vecinales, comunicaciones oficiales y temas de interés en tu localidad
        </p>
      </div>

      {/* Buscador inteligente */}
      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por palabra clave, calle, tema o categoría..."
          className="w-full text-xs pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-hidden focus:border-[var(--color-brand-600)] shadow-xs transition-all"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda("")}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1 rounded-full"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Barra de Filtros por tipo */}
      <div className="mb-4 p-2 rounded-2xl bg-white border border-slate-200/90 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
          {[
            { id: "todos", label: "Todo" },
            { id: "reclamo", label: "Reclamos" },
            { id: "comunicado", label: "Comunicados" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTipo(t.id)}
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

        {hayFiltros && (
          <button
            onClick={limpiarFiltros}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={13} />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Chips de Categorías */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategoriaId(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            categoriaId === null
              ? "bg-[var(--color-brand-600)] text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Todas las categorías
        </button>

        {categorias.map(cat => {
          const CategoryIcon = getCategoryIcon(cat.codigo || cat.nombre, cat.nombre);
          const isSelected = categoriaId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoriaId(cat.id)}
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

      {/* Lista de Resultados */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 animate-pulse">
              <div className="w-1/3 h-4 bg-slate-200 rounded mb-2" />
              <div className="w-full h-12 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : feed.length === 0 ? (
        <EmptyState
          title="No encontramos publicaciones"
          description={
            hayFiltros
              ? "Probá ajustar la búsqueda o seleccionar otra categoría."
              : "Aún no hay publicaciones disponibles en esta sección."
          }
          actionLabel={hayFiltros ? "Limpiar filtros" : null}
          onAction={hayFiltros ? limpiarFiltros : null}
        />
      ) : (
        <div className="space-y-4">
          {feed.map(item => (
            <FeedCard
              key={item.id}
              item={item}
              onEliminado={(id) => setFeed(prev => prev.filter(x => x.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Cargando explorador…</div>}>
      <ExplorarContent />
    </Suspense>
  );
}
