"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import apiClient from "@/services/apiClient";
import EmptyState from "@/components/ui/EmptyState";
import InstitucionReclamoTable from "@/components/reclamos/InstitucionReclamoTable";
import { Loader2, Filter, Inbox } from "lucide-react";
import ReclamoFilters from "@/components/reclamos/ReclamoFilters";
import { CLAIM_STATUSES } from "@/utils/reclamoStatus";
import useCategorias from "@/hooks/useCategorias";
import PageHeader from "@/components/layout/PageHeader";

const ESTADOS_PERMITIDOS = ["Todos", ...CLAIM_STATUSES];

function BandejaReclamos() {
  const searchParams = useSearchParams();
  const queryEstado = CLAIM_STATUSES.includes(searchParams.get("estado")) ? searchParams.get("estado") : "Todos";
  const queryCategoria = searchParams.get("categoria") || "Todas";
  const queryFechaDesde = searchParams.get("fechaDesde") || "";
  const queryFechaHasta = searchParams.get("fechaHasta") || "";

  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { categorias } = useCategorias("reclamo");
  
  // Filtros
  const [estado, setEstado] = useState(queryEstado);
  const [categoria, setCategoria] = useState(queryCategoria);
  const [orden, setOrden] = useState("recientes");
  const [error, setError] = useState("");

  const hayFiltrosActivos = useMemo(() => {
    return estado !== "Todos" || categoria !== "Todas" || orden !== "recientes" || Boolean(queryFechaDesde || queryFechaHasta);
  }, [estado, categoria, orden, queryFechaDesde, queryFechaHasta]);

  useEffect(() => {
    let vigente = true;
    setLoading(true);
    setError("");
    const params = { orderBy: orden };
    if (estado !== "Todos") params.estado = estado;
    if (categoria !== "Todas") params.categoria = categoria;
    if (queryFechaDesde) params.fechaDesde = queryFechaDesde;
    if (queryFechaHasta) params.fechaHasta = queryFechaHasta;
    apiClient.get('/institucion/reclamos/bandeja', { params })
      .then(res => { if (!res.data.ok) throw new Error(res.data.mensaje); if (vigente) setReclamos(res.data.data || []); })
      .catch(err => { if (vigente) setError(err.response?.data?.mensaje || "No se pudo cargar la bandeja. Intentá nuevamente."); })
      .finally(() => { if (vigente) setLoading(false); });
    return () => { vigente = false; };
  }, [estado, categoria, orden, queryFechaDesde, queryFechaHasta]);

  // Actualizar estado si cambia el query parameter
  useEffect(() => {
    if (searchParams.has("estado")) {
      const q = searchParams.get("estado");
      if (ESTADOS_PERMITIDOS.includes(q)) setEstado(q);
    }
    if (searchParams.has("categoria")) setCategoria(searchParams.get("categoria") || "Todas");
  }, [searchParams]);

  function handleLimpiarFiltros() {
    setEstado("Todos");
    setCategoria("Todas");
    setOrden("recientes");
  }

  return (
    <div className="w-full">
      {/* Header Unificado Bandeja de Reclamos */}
      <PageHeader
        title="Bandeja de reclamos"
        description="Gestioná y priorizá los reclamos asignados a tu institución."
      />

      <ReclamoFilters
        estado={estado}
        categoria={categoria}
        categorias={categorias}
        onEstado={setEstado}
        onCategoria={setCategoria}
        orden={orden}
        onOrden={setOrden}
        onClear={handleLimpiarFiltros}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <Loader2 className="animate-spin mb-2 text-primary" size={28} />
          <p className="text-xs font-medium">Cargando bandeja de reclamos...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300">
          <p role="alert">{error}</p>
        </div>
      ) : reclamos.length === 0 ? (
        hayFiltrosActivos ? (
          <EmptyState
            icon={Filter}
            title="Sin resultados para estos filtros"
            description="No se encontraron reclamos asignados que coincidan con los criterios seleccionados."
            actionLabel="Limpiar filtros"
            onAction={handleLimpiarFiltros}
          />
        ) : (
          <EmptyState
            icon={Inbox}
            title="No hay reclamos asignados"
            description="Tu institución no tiene reclamos pendientes de gestión en este momento."
          />
        )
      ) : (
        <InstitucionReclamoTable reclamos={reclamos} />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-muted text-xs"><Loader2 className="animate-spin mx-auto text-primary" size={24} /></div>}>
      <BandejaReclamos />
    </Suspense>
  );
}
