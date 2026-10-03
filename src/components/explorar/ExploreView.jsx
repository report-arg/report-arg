"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import FeedCard from "@/components/feed/FeedCard";
import { EmptyState, CategoryDropdown, StatusDropdown } from "@/components/ui";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import useCategorias from "@/hooks/useCategorias";
import PageHeader from "@/components/layout/PageHeader";

export default function ExploreView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const queryInicial = searchParams.get("q") || "";
  const catInicial = searchParams.get("categoria") ? Number(searchParams.get("categoria")) : null;

  const [busqueda, setBusqueda] = useState(queryInicial);
  const [tipo, setTipo] = useState("todos");
  const [estado, setEstado] = useState("Todos");
  const [categoriaId, setCategoriaId] = useState(catInicial);
  const { categorias } = useCategorias("todas");
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExplorar = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limite: 40 });
      if (tipo !== "todos") params.set("tipo", tipo);
      if (categoriaId) params.set("categoria", categoriaId);
      if (tipo === "reclamo" && estado && estado !== "Todos") {
        params.set("estado", estado);
      }

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
            (i.categoriaNombre && i.categoriaNombre.toLowerCase().includes(q)) ||
            (i.autorNombre && i.autorNombre.toLowerCase().includes(q))
          );
        }
        setFeed(items);
      }
    } catch {
      toast.error("Error al cargar publicaciones en Explorar");
    } finally {
      setLoading(false);
    }
  }, [tipo, estado, categoriaId, busqueda]);

  useEffect(() => {
    fetchExplorar();
  }, [fetchExplorar]);

  function limpiarFiltros() {
    setBusqueda("");
    setTipo("todos");
    setEstado("Todos");
    setCategoriaId(null);
    router.replace(pathname);
  }

  const hayFiltros = Boolean(
    busqueda.trim() !== "" ||
    tipo !== "todos" ||
    categoriaId !== null ||
    (tipo === "reclamo" && estado !== "Todos")
  );

  // Textos contextuales para estados vacíos
  let emptyTitle = "No encontramos publicaciones";
  let emptyDesc = "Aún no hay publicaciones disponibles en esta sección.";

  if (busqueda.trim()) {
    emptyTitle = "Sin resultados para tu búsqueda";
    emptyDesc = `No encontramos publicaciones que coincidan con "${busqueda}". Probá con otras palabras.`;
  } else if (categoriaId || (tipo === "reclamo" && estado !== "Todos")) {
    emptyTitle = "No hay publicaciones con estos filtros";
    emptyDesc = "Probá ajustando la categoría o el estado seleccionado.";
  } else if (tipo !== "todos") {
    emptyTitle = tipo === "reclamo" ? "No hay reclamos disponibles" : "No hay comunicados disponibles";
    emptyDesc = "Aún no se han registrado publicaciones de este tipo en tu localidad.";
  }

  return (
    <div className="w-full">
      {/* Header Unificado Explorar */}
      <PageHeader
        title="Explorar la ciudad"
        description="Buscá reportes vecinales, comunicaciones oficiales y temas de interés en tu localidad."
      />

      {/* Buscador inteligente */}
      <div className="mb-4 relative">
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
            type="button"
            onClick={() => setBusqueda("")}
            className="absolute right-3 top-3 text-text-muted hover:text-text-secondary p-1 rounded-full bg-surface-subtle hover:bg-border-subtle transition-colors cursor-pointer"
            aria-label="Borrar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Toolbar integrada de Filtros */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 flex-wrap">
        {/* Selector de Tipo (Todo / Reclamos / Comunicados) */}
        <div className="p-1 rounded-xl bg-surface-subtle border border-border-subtle flex items-center shadow-xs self-start sm:self-auto">
          {[
            { id: "todos", label: "Todo" },
            { id: "reclamo", label: "Reclamos" },
            { id: "comunicado", label: "Comunicados" },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTipo(t.id);
                if (t.id !== "reclamo") setEstado("Todos");
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tipo === t.id
                  ? "bg-surface text-text-primary shadow-xs border border-border-subtle"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Dropdowns de Filtro */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro por Estado: SÓLO cuando se ven Reclamos */}
          {tipo === "reclamo" && (
            <StatusDropdown
              value={estado}
              onChange={(nuevoEstado) => setEstado(nuevoEstado)}
              placeholder="Todos los estados"
              triggerClassName="w-full sm:w-auto min-w-[155px]"
              menuClassName="right-0 w-[210px]"
            />
          )}

          {/* Filtro por Categoría */}
          <CategoryDropdown
            categorias={categorias}
            value={categoriaId}
            onChange={(id) => setCategoriaId(id)}
            showAllOption={true}
            allOptionLabel="Todas las categorías"
            placeholder="Categoría"
            triggerClassName="w-full sm:w-auto min-w-[155px]"
            menuClassName="right-0 w-[240px] max-w-[calc(100vw-2rem)] sm:w-64"
          />
        </div>
      </div>

      {/* Contador discreto de resultados y filtros activos */}
      <div className="flex items-center justify-between gap-2 text-xs text-text-muted mb-4 px-0.5 min-h-[24px]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-text-secondary">
            {loading
              ? "Cargando publicaciones..."
              : feed.length === 0
              ? "0 publicaciones encontradas"
              : feed.length === 1
              ? (tipo === "reclamo" ? "1 reclamo encontrado" : tipo === "comunicado" ? "1 comunicado oficial" : "1 publicación encontrada")
              : (tipo === "reclamo" ? `${feed.length} reclamos encontrados` : tipo === "comunicado" ? `${feed.length} comunicados oficiales` : `${feed.length} publicaciones encontradas`)}
          </span>

          {/* Chips discretos de filtros activos */}
          {categoriaId && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-subtle text-primary border border-primary/20 text-[10px] font-semibold">
              <span>{categorias.find(c => c.id === categoriaId)?.nombre || "Categoría"}</span>
              <button
                type="button"
                onClick={() => setCategoriaId(null)}
                className="hover:text-primary-hover cursor-pointer"
                aria-label="Quitar filtro de categoría"
              >
                <X size={10} />
              </button>
            </span>
          )}

          {tipo === "reclamo" && estado !== "Todos" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-subtle text-primary border border-primary/20 text-[10px] font-semibold">
              <span>{estado}</span>
              <button
                type="button"
                onClick={() => setEstado("Todos")}
                className="hover:text-primary-hover cursor-pointer"
                aria-label="Quitar filtro de estado"
              >
                <X size={10} />
              </button>
            </span>
          )}
        </div>

        {/* Botón discreto "Limpiar filtros" visible sólo si hay filtros activos */}
        {hayFiltros && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline cursor-pointer transition-colors shrink-0"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Lista de Publicaciones */}
      <div>
        {loading ? (
          <div className="space-y-3.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 rounded-xl bg-surface border border-border-subtle animate-pulse">
                <div className="w-1/3 h-4 bg-border-subtle rounded mb-2.5" />
                <div className="w-full h-10 bg-surface-subtle rounded" />
              </div>
            ))}
          </div>
        ) : feed.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDesc}
            actionLabel={hayFiltros ? "Limpiar filtros" : null}
            onAction={hayFiltros ? limpiarFiltros : null}
          />
        ) : (
          <div className="space-y-3.5">
            {feed.map((item, index) => (
              <FeedCard
                key={`${item.tipo}-${item.id}`}
                item={item}
                priorityImage={index === 0}
                onEliminado={(id) => setFeed(prev => prev.filter(x => x.id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
