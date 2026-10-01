"use client";

import { useRouter } from "next/navigation";
import { MapPin, Users, Eye } from "lucide-react";
import ClaimTracking from "@/components/reclamos/ClaimTracking";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import { getCategoryIcon } from "@/components/brand/icons";
import { tiempoRelativo, fechaExacta } from "@/utils/dateFormatters";
import ClaimVisibilityBadge from "@/components/reclamos/ClaimVisibilityBadge";

export default function InstitutionClaimCard({ item }) {
  const router = useRouter();
  const CategoryIcon = getCategoryIcon(item.categoriaNombre, item.categoriaNombre);

  const afectados = item.afectadosCount || 0;
  
  return (
    <div 
      className="bg-surface rounded-xl border border-border-subtle p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col relative"
      onClick={() => router.push(`/institucion/reclamos/${item.id}`)}
    >
      {/* Encabezado */}
      <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <ClaimStatusBadge estado={item.estado} />
          {item.visibilidad === 'privado' && <ClaimVisibilityBadge visibilidad="privado" />}

        </div>
        <span className="text-[10px] text-text-muted font-medium" title={fechaExacta(item.fecha_ultimo_cambio_estado || item.fecha_creacion)}>
          {tiempoRelativo(item.fecha_ultimo_cambio_estado || item.fecha_creacion)}
        </span>
      </div>

      <div className="mb-3"><ClaimTracking reclamo={item} advertir /></div>
      {/* Cuerpo */}
      <h3 className="text-sm font-bold text-text-primary mb-1 line-clamp-2">
        {item.titulo}
      </h3>
      
      {/* Metadatos */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-[11px] text-text-secondary">
        {item.categoriaNombre && (
          <span className="inline-flex items-center gap-1 font-semibold text-primary">
            <CategoryIcon size={13} /> {item.categoriaNombre}
          </span>
        )}
        
        {item.direccion && (
          <span className="inline-flex items-center gap-1 truncate max-w-[200px]" title={item.direccion}>
            <MapPin size={12} className="text-text-muted" /> {item.direccion}
          </span>
        )}
      </div>

      {/* Pie de tarjeta */}
      <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] font-medium text-text-muted">
          <Users size={13} />
          <span>{afectados} {afectados === 1 ? 'afectado' : 'afectados'}</span>
        </div>
        <div className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline">
          <Eye size={14} /> Detalle
        </div>
      </div>
    </div>
  );
}
