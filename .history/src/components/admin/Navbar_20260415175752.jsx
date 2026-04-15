"use client";

import { Search, Bell, HelpCircle, Menu } from "lucide-react";

export default function Navbar({ section = "Dashboard", onMenuClick }) {
  return (
    <header className="navbar">

      {/* Izquierda: hamburguesa + breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="navbar-hamburger" onClick={onMenuClick}>
          <Menu size={22} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#aaa" }}>
          <span className="hide-mobile">ADMIN PANEL</span>
          <span className="hide-mobile">›</span>
          <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>
            {section.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Centro: buscador */}
      <div style={{ position: "relative" }} className="hide-mobile">
        <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "#aaa" }} />
        <input
          type="text"
          placeholder="Buscar registros del sistema..."
          style={{
            padding: "7px 14px 7px 32px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            fontSize: 13,
            width: 260,
            color: "#333",
            outline: "none",
            background: "var(--color-bg)",
          }}
        />
      </div>

      {/* Derecha: acciones + usuario */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Bell size={18} style={{ cursor: "pointer", color: "#aaa" }} />
        <HelpCircle size={18} style={{ cursor: "pointer", color: "#aaa" }} className="hide-mobile" />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ textAlign: "right" }} className="hide-mobile">
            <p style={{ margin: 0, fontSize: 13, fontWeight: "bold", color: "var(--color-primary)" }}>Admin Root</p>
            <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>Super Administrador</p>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--color-primary)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "bold", fontSize: 14,
          }}>
            A
          </div>
        </div>
      </div>

    </header>
  );
}