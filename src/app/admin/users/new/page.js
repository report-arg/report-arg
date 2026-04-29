"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import UserForm from "@/components/admin/UserForm";

export default function NewUserPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Usuarios" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">
          <div style={{ marginBottom: 28 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#aaa", letterSpacing: 1 }}>ADMIN PANEL › USUARIOS › NUEVO</p>
            <h1 style={{ margin: "6px 0 8px", fontSize: 28, fontWeight: "bold", color: "var(--color-primary)" }}>
              Crear Usuario
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
              Completá los datos para registrar un nuevo usuario en el sistema.
            </p>
          </div>
          <UserForm />
        </main>
      </div>
    </div>
  );
}