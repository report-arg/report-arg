"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Users, ShieldCheck, UserCog } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";

export default function EditUserPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Gestión de Cuentas de Usuario"
        description="Administración y supervisión del estado y rol de las cuentas de usuario."
        action={
          <Button
            onClick={() => router.push("/admin/users")}
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
          >
            Volver a usuarios
          </Button>
        }
      />

      <div className="p-8 rounded-2xl bg-surface border border-border-subtle shadow-xs text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <UserCog size={32} />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-lg font-bold text-text-primary m-0">
            La edición directa de perfiles ha sido simplificada
          </h2>
          <p className="text-xs text-text-muted leading-relaxed m-0">
            Para garantizar la privacidad ciudadana y la integridad histórica de los registros,
            los datos personales no se modifican manualmente desde esta vista. Podés gestionar el
            nivel de acceso o el estado operativo de cada cuenta directamente desde el listado principal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto pt-2">
          <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <ShieldCheck size={16} />
              <span>Cambio de Rol</span>
            </div>
            <p className="text-[11px] text-text-muted m-0 leading-relaxed">
              Promové usuarios a administradores o asigná rol de ciudadano con un clic y registro de auditoría.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <Users size={16} />
              <span>Habilitación / Inhabilitación</span>
            </div>
            <p className="text-[11px] text-text-muted m-0 leading-relaxed">
              Suspendé o reactivá el acceso de una cuenta con motivo documentado ante incidentes operativos.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border-subtle flex justify-center">
          <Button
            onClick={() => router.push("/admin/users")}
            variant="primary"
            leftIcon={<Users size={16} />}
          >
            Ir al Padrón de Usuarios
          </Button>
        </div>
      </div>
    </div>
  );
}
