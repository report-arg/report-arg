"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import DashboardStats from "@/components/admin/DashboardStats";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Dashboard" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">

          <div style={{ marginBottom: 28 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#aaa", letterSpacing: 1 }}>ADMIN PANEL › DASHBOARD</p>
            <h1 style={{ margin: "6px 0 8px", fontSize: 28, fontWeight: "bold", color: "var(--color-primary)" }}>
              Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "#666", maxWidth: 520 }}>
              Resumen general del sistema ReportARG.
            </p>
          </div>

          <DashboardStats />

        </main>
      </div>
    </div>
  );
}