"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import UserTable from "@/components/admin/UserTable";

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Usuarios" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">

          {/* Encabezado — solo desktop */}
          <div className="page-header hide-mobile" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#aaa", letterSpacing: 1 }}>ADMIN PANEL › USUARIOS</p>
              <h1 style={{ margin: "6px 0 8px", fontSize: 28, fontWeight: "bold", color: "var(--color-primary)" }}>
                Gestión de Usuarios
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: "#666", maxWidth: 520 }}>
                Administrá las credenciales de acceso, roles y estados de los ciudadanos y personal administrativo del sistema ReportARG.
              </p>
            </div>
            <button style={{
              padding: "10px 20px", background: "var(--color-primary)",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap",
            }}>
              + Crear Usuario
            </button>
          </div>

          {/* Stats desktop */}
          <div className="stats-grid hide-mobile">
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

          {/* Stats mobile */}
          <div className="mobile-stats">
            {/* Card azul total usuarios */}
            <div className="mobile-total-card">
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)", letterSpacing: 1 }}>TOTAL USUARIOS</p>
              <p style={{ margin: "8px 0 4px", fontSize: 40, fontWeight: "bold", color: "#fff" }}>1.284</p>
              <p style={{ margin: 0, fontSize: 13, color: "#a8d4f5" }}>↑ +12% este mes</p>
              <div style={{ position: "absolute", right: 16, bottom: 16, opacity: 0.15 }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="white"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
            </div>

            {/* Activos / Inactivos */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, background: "#fff", borderRadius: 10, border: "1px solid var(--color-border)", padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-success)"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                  <p style={{ margin: 0, fontSize: 11, color: "#aaa", fontWeight: 600 }}>ACTIVOS</p>
                </div>
                <p style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: "var(--color-primary)" }}>1.102</p>
              </div>
              <div style={{ flex: 1, background: "#fff", borderRadius: 10, border: "1px solid var(--color-border)", padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-danger)"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                  <p style={{ margin: 0, fontSize: 11, color: "#aaa", fontWeight: 600 }}>INACTIVOS</p>
                </div>
                <p style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: "var(--color-primary)" }}>182</p>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <UserTable />

        </main>

        {/* Bottom navbar mobile */}
        <nav className="mobile-bottom-nav">
          {[
            { label: "Inicio", href: "/admin", icon: "⊞" },
            { label: "Usuarios", href: "/admin/users", icon: "👥", active: true },
            { label: "Roles", href: "/admin/roles", icon: "🛡" },
            { label: "Ajustes", href: "/admin/settings", icon: "⚙" },
          ].map((item) => (
            <a key={item.href} href={item.href} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, textDecoration: "none",
              color: item.active ? "var(--color-primary)" : "#aaa",
              fontSize: 10, fontWeight: item.active ? "bold" : "normal",
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

      </div>
    </div>
  );
}