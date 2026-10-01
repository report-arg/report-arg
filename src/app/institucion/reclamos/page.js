"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import apiClient from "@/services/apiClient";
import EmptyState from "@/components/ui/EmptyState";
import InstitutionClaimCard from "@/components/reclamos/InstitutionClaimCard";
import { Loader2, Filter, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import useCategorias from "@/hooks/useCategorias";

function BandejaReclamos() {
  const searchParams = useSearchParams();
  const queryEstado = searchParams.get("estado") || "Todos";

  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { categorias } = useCategorias("reclamo");
  
  // Filtros
  const [estado, setEstado] = useState(queryEstado);
  const [categoria, setCategoria] = useState("Todas");
  const [orden, setOrden] = useState("recientes");

  const estadosPermitidos = ["Todos", "Pendiente", "En revisión", "En proceso", "Resuelto", "Cancelado"];

  // Categorias loaded by hook

  const fetchBandeja = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (estado !== "Todos") params.append("estado", estado);
    if (categoria !== "Todas") params.append("categoria", categoria);
    params.append("orderBy", orden);

    apiClient.get(`/institucion/reclamos/bandeja?${params.toString()}`)
      .then(res => {
        if(res.data?.ok) {
          setReclamos(res.data.data);
        } else {
          toast.error("Error al cargar la bandeja");
        }
      })
      .catch(err => {
        toast.error("Error al conectar con el servidor");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBandeja();
  }, [estado, categoria, orden]);

  // Actualizar estado si cambia el query parameter
  useEffect(() => {
    if (searchParams.has("estado")) {
      const q = searchParams.get("estado");
      if (estadosPermitidos.includes(q)) setEstado(q);
    }
  }, [searchParams]);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary">Bandeja de Entrada</h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Gestioná los reclamos asignados a tu institución.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-surface rounded-xl border border-border-subtle p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-auto">
          <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Estado</label>
          <select 
            value={estado} 
            onChange={e => setEstado(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-border-subtle bg-surface focus:outline-hidden focus:border-primary"
          >
            {estadosPermitidos.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        
        <div className="w-full md:w-auto">
          <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Categoría</label>
          <select 
            value={categoria} 
            onChange={e => setCategoria(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-border-subtle bg-surface focus:outline-hidden focus:border-primary"
          >
            <option value="Todas">Todas</option>
            {categorias.map(c => (
              <option key={c.id || c.id_categoria} value={c.id || c.id_categoria}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-auto">
          <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Ordenar por</label>
          <select 
            value={orden} 
            onChange={e => setOrden(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-border-subtle bg-surface focus:outline-hidden focus:border-primary"
          >
            <option value="recientes">Más recientes</option>
            <option value="antiguos">Más antiguos</option>
            <option value="impacto">Mayor impacto (afectados)</option>
          </select>
        </div>

        {(estado !== "Todos" || categoria !== "Todas" || orden !== "recientes") && (
          <button 
            onClick={() => { setEstado("Todos"); setCategoria("Todas"); setOrden("recientes"); }}
            className="text-xs font-semibold text-text-secondary hover:text-text-primary px-3 py-2 bg-surface-subtle hover:bg-border-subtle rounded-lg transition-colors w-full md:w-auto mt-2 md:mt-0"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p className="text-sm">Cargando bandeja...</p>
        </div>
      ) : reclamos.length === 0 ? (
        <EmptyState 
          icon={Filter} 
          title="Sin resultados" 
          description="No se encontraron reclamos con los filtros actuales."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reclamos.map(r => (
            <InstitutionClaimCard key={r.id} item={r} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>}>
      <BandejaReclamos />
    </Suspense>
  );
}
