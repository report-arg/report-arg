"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import UserTable from "@/components/admin/UserTable";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, activos: 0, inactivos: 0, admins: 0 });
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/usuarios/stats`);
        const data = await response.json();
        if (response.ok && data?.ok && data?.data) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("No se pudieron cargar las estadísticas de usuarios", error);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    { label: "TOTAL USUARIOS", value: stats.total, sub: "——", subColor: "var(--color-success)" },
    { label: "ACTIVOS", value: stats.activos, sub: "——", subColor: "var(--color-primary)" },
    { label: "INACTIVOS", value: stats.inactivos, sub: "——", subColor: "var(--color-danger)" },
    { label: "ADMINISTRADORES", value: stats.admins, sub: "——", subColor: "var(--color-warning)" },
  ];

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
            {statsCards.map((stat) => (
              <div key={stat.label} style={{
                background: "#fff", borderRadius: 10,
                border: "1px solid var(--color-border)", padding: "16px 20px",
              }}>
                <p style={{ margin: 0, fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>{stat.label}</p>
                <p style={{ margin: "6px 0 2px", fontSize: 26, fontWeight: "bold", color: "var(--color-primary)" }}>{Number(stat.value || 0).toLocaleString("es-AR")}</p>
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