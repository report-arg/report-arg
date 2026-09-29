"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, RefreshCw, ChevronDown, Check } from "lucide-react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside para cerrar dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

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
    <div className="w-full max-w-5xl mx-auto px-4 py-8">

      {/* Header Explorar */}
      <div className="mb-6 pb-4 border-b border-border-subtle">
        <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
          Explorar la ciudad
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Buscá reportes vecinales, comunicaciones oficiales y temas de interés en tu localidad.
        </p>
      </div>

      {/* Buscador inteligente */}
      <div className="mb-6 relative">
        <Search size={18} className="absolute left-4 top-3.5 text-text-muted" />
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por palabra clave, calle, tema o categoría..."
          className="w-full text-sm pl-11 pr-10 py-3 rounded-2xl border border-border-subtle bg-surface focus:outline-hidden focus:border-primary shadow-xs transition-all text-text-primary placeholder:text-text-muted"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda("")}
            className="absolute right-3 top-3 text-text-muted hover:text-text-secondary p-1 rounded-full bg-surface-subtle hover:bg-border-subtle transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="mb-6 space-y-3">
        {/* Toolbar de Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="p-1.5 rounded-xl bg-surface-subtle border border-border-subtle flex items-center shadow-xs">
            {[
              { id: "todos", label: "Todo" },
              { id: "reclamo", label: "Reclamos" },
              { id: "comunicado", label: "Comunicados" },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTipo(t.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tipo === t.id
                    ? "bg-surface text-text-primary shadow-xs border border-border-subtle"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-between gap-3 bg-surface border border-border-subtle hover:border-border-strong text-text-secondary text-xs font-semibold px-4 py-2 rounded-xl focus:outline-hidden focus:border-primary shadow-xs transition-colors cursor-pointer min-w-[160px]"
            >
              <span>Categoría</span>
              <ChevronDown size={14} className={`text-text-muted transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-[240px] max-w-[calc(100vw-2rem)] sm:w-64 bg-surface rounded-xl shadow-lg border border-border-subtle z-50 overflow-hidden">
                <div className="max-h-80 overflow-y-auto overscroll-contain">
                  {/* Opción para limpiar/todas */}
                  <button
                    onClick={() => { setCategoriaId(null); setDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left text-xs transition-colors cursor-pointer ${
                      categoriaId === null ? "bg-surface-subtle font-bold text-text-primary" : "font-medium text-text-secondary hover:bg-surface-subtle"
                    }`}
                  >
                    <span>Todas las categorías</span>
                    {categoriaId === null && <Check size={14} className="text-primary" />}
                  </button>
                  
                  {/* Categorías reales */}
                  {categorias.map(cat => {
                    const CategoryIcon = getCategoryIcon(cat.codigo || cat.nombre, cat.nombre);
                    const isSelected = categoriaId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { setCategoriaId(cat.id); setDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 border-t border-border-subtle text-left text-xs transition-colors cursor-pointer group ${
                          isSelected ? "bg-primary-subtle font-bold text-text-primary" : "font-medium text-text-secondary hover:bg-surface-subtle"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CategoryIcon size={14} className={isSelected ? "text-primary" : "text-text-muted group-hover:text-text-secondary"} />
                          <span>{cat.nombre}</span>
                        </div>
                        {isSelected && <Check size={14} className="text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filtro Activo */}
        {categoriaId && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-secondary">Filtro:</span>
            <button
              onClick={() => setCategoriaId(null)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-subtle border border-official-border text-primary text-[11px] font-bold hover:bg-border-subtle transition-colors cursor-pointer group"
            >
              {categorias.find(c => c.id === categoriaId)?.nombre || "Categoría"}
              <X size={12} className="text-primary group-hover:text-primary-hover" />
            </button>
          </div>
        )}
      </div>

      {/* Lista de Resultados */}
      <div>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 rounded-xl bg-surface border border-border-subtle animate-pulse">
                <div className="w-1/3 h-4 bg-border-subtle rounded mb-2" />
                <div className="w-full h-12 bg-surface-subtle rounded" />
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
    </div>
  );
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Cargando explorador…</div>}>
      <ExplorarContent />
    </Suspense>
  );
}
