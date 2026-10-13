"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased text-text-primary">
      {/* Sidebar fijo / drawer mobile */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenedor principal con offset en desktop para el sidebar (w-64 = 16rem = pl-64) */}
      <div className="md:pl-64 flex flex-col flex-1 min-h-screen min-w-0">
        {/* Navbar superior */}
        <AdminNavbar onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Área de contenido central */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
