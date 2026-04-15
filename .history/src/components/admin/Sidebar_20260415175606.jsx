"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Shield, KeyRound, Settings, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Usuarios", href: "/admin/users", icon: Users },
  { label: "Roles", href: "/admin/roles", icon: Shield },
  { label: "Permisos", href: "/admin/permissions", icon: KeyRound },
  { label: "Configuración", href: "/admin/settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={onClose} />

      <aside className={`sidebar ${open ? "open" : ""}`}>

        {/* Logo */}
        <div style={{ padding: "0 20px 28px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <Image src="/logo.png" alt="ReportARG" width={110} height={38} style={{ objectFit: "contain" }} />
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--color-accent)", fontWeight: "bold", letterSpacing: 1 }}>
              ADMIN PANEL
            </p>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }} onClick={onClose}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 8, marginBottom: 4,
                  background: active ? "var(--color-primary-light)" : "transparent",
                  color: active ? "var(--color-primary)" : "#555",
                  fontWeight: active ? "bold" : "normal",
                  fontSize: 14, cursor: "pointer",
                  borderLeft: active ? "3px solid var(--color-primary)" : "3px solid transparent",
                }}>
                  <Icon size={17} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--color-border)", fontSize: 12, color: "#aaa" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-success)" }}></div>
            System Status: Healthy
          </div>
        </div>
      </aside>
    </>
  );
}