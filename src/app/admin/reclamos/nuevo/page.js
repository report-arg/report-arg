"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, ArrowRight, ShieldAlert } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";

export default function AdminReclamoNuevoRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirección sugerida a la comunidad para operar en contexto de ciudad activa
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Creación de Reclamos"
        description="Los reclamos ciudadanos y reportes de prueba se registran directamente desde la experiencia comunitaria."
        action={
          <Button
            onClick={() => router.push("/admin/reclamos")}
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
          >
            Volver a supervisión
          </Button>
        }
      />

      <div className="p-6 rounded-2xl bg-surface border border-border-subtle shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
          <Globe size={24} />
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-bold text-text-primary m-0">
            Registro en contexto comunitario
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed m-0">
            Para preservar la integridad de asignación, trazabilidad territorial e institución responsable por localidad, los reportes se crean ingresando a la vista comunitaria con una ciudad activa seleccionada.
          </p>
        </div>

        <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            onClick={() => router.push("/ciudadano/reclamos/nuevo")}
            rightIcon={<ArrowRight size={15} />}
          >
            Ir a crear reclamo en la Comunidad
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/reclamos")}
          >
            Ir a supervisión de reclamos
          </Button>
        </div>
      </div>
    </div>
  );
}
