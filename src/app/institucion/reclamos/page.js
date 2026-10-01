"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import apiClient from "@/services/apiClient";
import EmptyState from "@/components/ui/EmptyState";
import InstitutionClaimCard from "@/components/reclamos/InstitutionClaimCard";
import { Loader2, Filter } from "lucide-react";
import ClaimFilters from "@/components/reclamos/ClaimFilters";
import { CLAIM_STATUSES } from "@/utils/claimStatus";
import useCategorias from "@/hooks/useCategorias";

function BandejaReclamos() {
  const searchParams = useSearchParams();
  const queryEstado = CLAIM_STATUSES.includes(searchParams.get("estado")) ? searchParams.get("estado") : "Todos";

  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { categorias } = useCategorias("reclamo");
  
  // Filtros
  const [estado, setEstado] = useState(queryEstado);
  const [categoria, setCategoria] = useState("Todas");
  const [orden, setOrden] = useState("recientes");

  const estadosPermitidos = ["Todos", ...CLAIM_STATUSES];
  const [error, setError] = useState("");

  // Categorias loaded by hook

  useEffect(() => {
    let vigente = true;
    setLoading(true);
    setError("");
    const params = { orderBy: orden };
    if (estado !== "Todos") params.estado = estado;
    if (categoria !== "Todas") params.categoria = categoria;
    apiClient.get('/institucion/reclamos/bandeja', { params })
      .then(res => { if (!res.data.ok) throw new Error(res.data.mensaje); if (vigente) setReclamos(res.data.data); })
      .catch(err => { if (vigente) setError(err.response?.data?.mensaje || "No se pudo cargar la bandeja. Intentá nuevamente."); })
      .finally(() => { if (vigente) setLoading(false); });
    return () => { vigente = false; };
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

      <ClaimFilters estado={estado} categoria={categoria} categorias={categorias} onEstado={setEstado} onCategoria={setCategoria} orden={orden} onOrden={setOrden} onClear={() => { setEstado("Todos"); setCategoria("Todas"); setOrden("recientes"); }} />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p className="text-sm">Cargando bandeja...</p>
        </div>
      ) : error ? <p role="alert" className="text-sm text-text-primary">{error}</p> : reclamos.length === 0 ? (
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
