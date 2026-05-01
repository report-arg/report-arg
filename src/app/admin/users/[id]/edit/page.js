"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import UserForm from "@/components/admin/UserForm";

export default function EditUserPage() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Usuarios" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">
          <div style={{ marginBottom: 28 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#aaa", letterSpacing: 1 }}>ADMIN PANEL › USUARIOS › EDITAR</p>
            <h1 style={{ margin: "6px 0 8px", fontSize: 28, fontWeight: "bold", color: "var(--color-primary)" }}>
              Editar Usuario
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
              Modificá los datos del usuario seleccionado.
            </p>
          </div>
          <UserForm usuarioId={id} />
        </main>
      </div>
    </div>
  );
}