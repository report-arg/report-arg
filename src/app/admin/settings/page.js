"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import SettingsPanel from "@/components/admin/SettingsPanel";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Configuración" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">

          <div style={{ marginBottom: 28 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#aaa", letterSpacing: 1 }}>ADMIN PANEL › CONFIGURACIÓN</p>
            <h1 style={{ margin: "6px 0 8px", fontSize: 28, fontWeight: "bold", color: "var(--color-primary)" }}>
              Configuración
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "#666", maxWidth: 520 }}>
              Ajustá los parámetros generales, categorías, estados del flujo y notificaciones del sistema.
            </p>
          </div>

          <SettingsPanel />

        </main>
      </div>
    </div>
  );
}