"use client";

import { Search, Bell, HelpCircle, Menu } from "lucide-react";


export default function Navbar({ section = "Dashboard", onMenuClick }) {
  return (
    <header className="navbar">

      {/* Izquierda */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

        <button className="navbar-hamburger" onClick={onMenuClick}>
          <Menu size={22} />
        </button>

        <div className="navbar-breadcrumb">
          <span className="hide-mobile">ADMIN PANEL</span>
          <span className="hide-mobile">›</span>
          <span className="navbar-section">
            {section.toUpperCase()}
          </span>
        </div>

      </div>

      {/* Centro */}
      <div className="navbar-search-wrapper hide-mobile">
        <Search size={14} className="navbar-search-icon" />
        <input
          type="text"
          placeholder="Buscar registros del sistema..."
          className="navbar-search"
        />
      </div>

      {/* Derecha */}
      <div className="navbar-right">

        <Bell size={18} style={{ cursor: "pointer", color: "#aaa" }} />

        <HelpCircle
          size={18}
          style={{ cursor: "pointer", color: "#aaa" }}
          className="hide-mobile"
        />

        <div className="navbar-user">

          <div className="navbar-user-info hide-mobile">
            <p className="navbar-user-name">Admin Root</p>
            <p className="navbar-user-role">Super Administrador</p>
          </div>

          <div className="navbar-avatar">
            A
          </div>

        </div>

      </div>

    </header>
  );
}