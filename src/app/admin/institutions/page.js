"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import InstitutionTable from "@/components/admin/InstitutionTable";
import Breadcrumb from "@/components/admin/Breadcrumb";

export default function InstitutionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Instituciones" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">

          <div style={{ marginBottom: 28 }}>
            <Breadcrumb items={[{ label: "ADMIN PANEL", href: "/admin" }, { label: "INSTITUCIONES" }]} />
            <h1 style={{ margin: "6px 0 8px", fontSize: 28, fontWeight: "bold", color: "var(--color-primary)" }}>
              Verificación de Instituciones
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "#666", maxWidth: 520 }}>
              Revisá y gestioná las solicitudes de verificación de instituciones registradas en ReportARG.
            </p>
          </div>

          <InstitutionTable />

        </main>
      </div>
    </div>
  );
}