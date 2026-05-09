"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import UserForm from "@/components/admin/UserForm";

export default function NewUserPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, activos: 0, inactivos: 0, admins: 0 });

  useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/usuarios/stats`)
    .then(r => r.json())
    .then(data => { if (data.ok) setStats(data.data); })
    .catch(console.error);
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Usuarios" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">
          <div className="users-page-header users-page-header-single">
            <p className="users-breadcrumb">ADMIN PANEL › USUARIOS › NUEVO</p>
            <h1 className="users-title">
              Crear Usuario
            </h1>
            <p className="users-description users-description-wide">
              Completá los datos para registrar un nuevo usuario en el sistema.
            </p>
          </div>
          <UserForm />
        </main>
      </div>
    </div>
  );
}