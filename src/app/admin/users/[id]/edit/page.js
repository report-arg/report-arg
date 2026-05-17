"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import UserForm from "@/components/admin/UserForm";
import Breadcrumb from "@/components/admin/Breadcrumb";

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
            <Breadcrumb items={[{ label: "ADMIN PANEL", href: "/admin" }, { label: "USUARIOS", href: "/admin/users" }, { label: "EDITAR" }]} />
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