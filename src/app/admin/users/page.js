"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import UserTable from "@/components/admin/UserTable";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Usuarios" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">

          {/* Encabezado */}
          <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#aaa", letterSpacing: 1 }}>ADMIN PANEL › USUARIOS</p>
              <h1 style={{ margin: "6px 0 8px", fontSize: 28, fontWeight: "bold", color: "var(--color-primary)" }}>
                Gestión de Usuarios
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: "#666", maxWidth: 520 }}>
                Administrá las credenciales de acceso, roles y estados de los ciudadanos y personal administrativo del sistema ReportARG.
              </p>
            </div>
            <button onClick={() => router.push("/admin/users/new")} style={{
              padding: "10px 20px", background: "var(--color-primary)",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap",
            }}>
              + Crear Usuario
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {[
              { label: "TOTAL USUARIOS", value: "12.482", sub: "+4.2%", subColor: "var(--color-success)" },
              { label: "ACTIVOS", value: "10.105", sub: "——", subColor: "var(--color-primary)" },
              { label: "INACTIVOS", value: "2.377", sub: "——", subColor: "var(--color-danger)" },
              { label: "ADMINISTRADORES", value: "48", sub: "——", subColor: "var(--color-warning)" },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: "#fff", borderRadius: 10,
                border: "1px solid var(--color-border)", padding: "16px 20px",
              }}>
                <p style={{ margin: 0, fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>{stat.label}</p>
                <p style={{ margin: "6px 0 2px", fontSize: 26, fontWeight: "bold", color: "var(--color-primary)" }}>{stat.value}</p>
                <p style={{ margin: 0, fontSize: 12, color: stat.subColor, fontWeight: "bold" }}>{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabla */}
          <UserTable />

        </main>
      </div>
    </div>
  );
}