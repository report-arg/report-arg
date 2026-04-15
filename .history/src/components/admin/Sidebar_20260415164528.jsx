"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "⊞" },
  { label: "Users", href: "/admin/users", icon: "👥" },
  { label: "Roles", href: "/admin/roles", icon: "🛡" },
  { label: "Permissions", href: "/admin/permissions", icon: "🔑" },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "#fff",
      borderRight: "1px solid #e8f0fa",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
    }}>
      {/* Logo */}
      <div style={{ padding: "0 20px 28px", borderBottom: "1px solid #e8f0fa" }}>
        <Image src="/logo.png" alt="ReportARG" width={130} height={45} style={{ objectFit: "contain" }} />
        <p style={{ margin: "6px 0 0", fontSize: 11, color: "#5BAAE8", fontWeight: "bold", letterSpacing: 1 }}>
          ADMIN PANEL · SYSTEM MANAGEMENT
        </p>
      </div>

      {/* Nav */}
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 4,
                background: active ? "#f0f6ff" : "transparent",
                color: active ? "#2D3A8C" : "#555",
                fontWeight: active ? "bold" : "normal",
                fontSize: 14,
                cursor: "pointer",
                borderLeft: active ? "3px solid #2D3A8C" : "3px solid transparent",
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #e8f0fa", fontSize: 12, color: "#aaa" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1A7A3C" }}></div>
          System Status: Healthy
        </div>
      </div>
    </aside>
  );
}