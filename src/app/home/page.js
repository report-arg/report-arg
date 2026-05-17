"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, Tag, Map, X, Newspaper } from "lucide-react";
import FeedCard from "@/components/home/FeedCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function HomePage() {
  const router = useRouter();

  const [categorias,   setCategorias]   = useState([]);
  const [feed,         setFeed]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [categoriaId,  setCategoriaId]  = useState(null);
  const [pagina,       setPagina]       = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/api/feed/categorias`)
      .then(r => r.json())
      .then(d => { if (d.ok) setCategorias(d.data); })
      .catch(() => {});
  }, []);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pagina, limite: 10, tipo: 'comunicado' });
      if (categoriaId) params.set("categoria", categoriaId);

      const res  = await fetch(`${API_URL}/api/feed?${params}`);
      const data = await res.json();

      if (data.ok) {
        setFeed(data.data);
        setTotal(data.total ?? 0);
        setTotalPaginas(data.totalPaginas);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [categoriaId, pagina]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  function seleccionarCategoria(id) {
    setCategoriaId(id);
    setPagina(1);
  }

  function limpiarFiltros() {
    setCategoriaId(null);
    setPagina(1);
  }

  const categoriaActiva = categorias.find(c => c.id === categoriaId);
  const hayFiltros      = categoriaId !== null;

  return (
    <>
      <div className="home-feed-wrapper">

        <div className="home-quick-actions">
          <button
            className="home-action-btn primary"
            onClick={() => router.push("/home/reclamos/nuevo")}
          >
            <FilePlus2 size={20} />
            <span className="label">Crear Reclamo</span>
          </button>
          <button className="home-action-btn secondary" onClick={() => router.push("/home")}>
            <Newspaper size={20} color="#2D3A8C" />
            <span className="label">Ver Comunicados</span>
          </button>
          <button className="home-action-btn secondary" onClick={() => router.push("/home/explorar")}>
            <Tag size={20} color="#2D3A8C" />
            <span className="label">Explorar Categorías</span>
          </button>
          <button className="home-action-btn secondary" onClick={() => router.push("/home/mapa")}>
            <Map size={20} color="#2D3A8C" />
            <span className="label">Mapa</span>
          </button>
        </div>



        <div className="home-filters">
          <button
            className={`home-filter-tab ${categoriaId === null ? "active" : ""}`}
            onClick={() => seleccionarCategoria(null)}
          >
            Todas las categorías
          </button>
          {categorias.map(c => (
            <button
              key={c.id}
              className={`home-filter-tab ${categoriaId === c.id ? "active" : ""}`}
              onClick={() => seleccionarCategoria(c.id)}
            >
              {c.nombre}
            </button>
          ))}
        </div>

        <div className="home-feed-header">
          <span className="home-feed-count">
            {loading ? "Buscando..." : (
              <>
                <strong>{total}</strong> comunicado{total !== 1 ? "s" : ""}
                {categoriaActiva && <> en <em>{categoriaActiva.nombre}</em></>}
              </>
            )}
          </span>
          {hayFiltros && (
            <button className="home-clear-filter" onClick={limpiarFiltros}>
              <X size={13} /> Limpiar filtros
            </button>
          )}
        </div>

        {loading && <p className="feed-loading">Cargando...</p>}

        {!loading && feed.length === 0 && (
          <div className="feed-empty">
            <p style={{ fontSize: 14, fontWeight: 600 }}>
              No hay publicaciones{categoriaActiva ? ` en "${categoriaActiva.nombre}"` : ""}.
            </p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              Probá con otra categoría o{" "}
              <button className="home-clear-filter" onClick={limpiarFiltros}>limpiar los filtros</button>.
            </p>
          </div>
        )}

        {!loading && feed.map(item => (
          <FeedCard key={item.id} item={item} />
        ))}

        {!loading && totalPaginas > 1 && (
          <div className="home-pagination">
            <button
              className="home-page-btn"
              onClick={() => setPagina(p => Math.max(p - 1, 1))}
              disabled={pagina === 1}
            >
              ← Anterior
            </button>
            <span className="home-page-info">{pagina} / {totalPaginas}</span>
            <button
              className="home-page-btn"
              onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))}
              disabled={pagina === totalPaginas}
            >
              Siguiente →
            </button>
          </div>
        )}

      </div>
    </>
  );
}
