"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import RolesPanel from "@/components/admin/RolesPanel";

export default function RolesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Roles" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">

          {/* Encabezado */}
          <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#aaa", letterSpacing: 1 }}>ADMIN PANEL › ROLES</p>
              <h1 style={{ margin: "6px 0 8px", fontSize: 28, fontWeight: "bold", color: "var(--color-primary)" }}>
                Roles y Permisos
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: "#666", maxWidth: 520 }}>
                Definí y gestioná las capacidades de acceso para cada tipo de usuario en ReportARG.
              </p>
            </div>
            <button style={{
              padding: "10px 20px", background: "var(--color-primary)",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap",
            }}>
              + Nuevo Rol
            </button>
          </div>

          {/* Panel de roles */}
          <RolesPanel />

        </main>
      </div>
    </div>
  );
}