"use client";

import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import PageHeader from "@/components/layout/PageHeader";

export default function DashboardPage() {
  return (
    <div className="w-full">
      <PageHeader
        title="Dashboard General"
        description="Resumen operativo e indicadores clave de la plataforma ReportARG."
      />

      <DashboardStats />
    </div>
  );
}