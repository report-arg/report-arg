"use client";

import InstitucionTable from "@/components/admin/instituciones/InstitucionTable";
import PageHeader from "@/components/layout/PageHeader";

export default function InstitutionsPage() {
  return (
    <div className="w-full">
      <PageHeader
        title="Gestión de Instituciones"
        description="Consultá y administrá las instituciones del sistema, su estado de verificación y datos de contacto."
      />

      <InstitucionTable />
    </div>
  );
}