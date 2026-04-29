"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import UserForm from "@/components/admin/UserForm";

// Datos mock — reemplazá con fetch a tu API usando el id
const usuariosMock = [
  { id: "1", nombre: "Mateo Sánchez",      email: "mateo.sanchez@provincia.gob.ar", rol: "ADMIN",     estado: "ACTIVO",   foto: null },
  { id: "2", nombre: "Lucía Fernández",    email: "l.fernandez@gmail.com",          rol: "MODERADOR", estado: "ACTIVO",   foto: null },
  { id: "3", nombre: "Agustín Valenzuela", email: "agustin.val@outlook.com",        rol: "CIUDADANO", estado: "INACTIVO", foto: null },
  { id: "4", nombre: "Sofía Martínez",     email: "sofi.martinez@gmail.com",        rol: "CIUDADANO", estado: "ACTIVO",   foto: null },
];

export default function EditUserPage() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const usuario = usuariosMock.find(u => u.id === id);

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
          {usuario
            ? <UserForm usuario={usuario} />
            : <p style={{ color: "#aaa" }}>Usuario no encontrado.</p>
          }
        </main>
      </div>
    </div>
  );
}