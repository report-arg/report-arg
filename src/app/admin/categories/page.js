"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import CategoriesPanel from "@/components/admin/CategoriesPanel";
import Breadcrumb from "@/components/admin/Breadcrumb";

export default function CategoriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Categorías" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">

          <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <Breadcrumb items={[{ label: "ADMIN PANEL", href: "/admin" }, { label: "CATEGORÍAS" }]} />
              <h1 style={{ margin: "6px 0 8px", fontSize: 28, fontWeight: "bold", color: "var(--color-primary)" }}>
                Gestión de Categorías
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: "#666", maxWidth: 520 }}>
                Configurá las categorías disponibles para ciudadanos e instituciones.
              </p>
            </div>
            <button onClick={() => router.push("/admin/categories/crear")}
              style={{
                padding: "10px 20px", background: "var(--color-primary)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap",
              }}>
              + Nueva Categoría
            </button>
          </div>

          <CategoriesPanel />

        </main>
      </div>
    </div>
  );
}