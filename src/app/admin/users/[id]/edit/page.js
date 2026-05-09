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
          <div className="users-page-header users-page-header-single">
            <p className="users-breadcrumb">ADMIN PANEL › USUARIOS › EDITAR</p>
            <h1 className="users-title">
              Editar Usuario
            </h1>
            <p className="users-description users-description-wide">
              Modificá los datos del usuario seleccionado.
            </p>
          </div>
          <UserForm usuarioId={id} />
        </main>
      </div>
    </div>
  );
}