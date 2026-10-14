"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Users, UserCheck, UserX, Shield } from "lucide-react";
import UsuarioTable from "@/components/admin/usuarios/UsuarioTable";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import apiClient from "@/services/apiClient";

export default function UsersPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, activos: 0, inactivos: 0, admins: 0 });

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get("/admin/usuarios/stats")
      .then((res) => {
        if (isMounted && res.data?.ok && res.data?.data) {
          setStats(res.data.data);
        }
      })
      .catch((error) => {
        console.error("No se pudieron cargar las estadísticas de usuarios", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const statsCards = [
    { label: "Total Usuarios", value: stats.total, icon: Users, color: "text-primary" },
    { label: "Activos", value: stats.activos, icon: UserCheck, color: "text-emerald-600" },
    { label: "Inactivos", value: stats.inactivos, icon: UserX, color: "text-rose-600" },
    { label: "Administradores", value: stats.admins, icon: Shield, color: "text-amber-600" },
  ];

  return (
    <div className="w-full">
      <PageHeader
        title="Gestión de Usuarios"
        description="Consultá y administrá las cuentas, roles y estados de los usuarios en ReportARG."
        action={
          <Button
            onClick={() => router.push("/admin/users/new")}
            variant="primary"
            leftIcon={<UserPlus size={16} />}
          >
            Nuevo usuario
          </Button>
        }
      />

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {statsCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-muted">{item.label}</span>
                <Icon size={16} className={item.color} />
              </div>
              <p className="text-2xl font-bold text-text-primary m-0">
                {Number(item.value || 0).toLocaleString("es-AR")}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tabla de usuarios */}
      <UsuarioTable />
    </div>
  );
}