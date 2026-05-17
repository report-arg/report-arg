"use client";


import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Shield, Settings, Building2, X, Tag, FileText } from "lucide-react";

const navItems = [
  { label: "Dashboard",        href: "/admin",               icon: LayoutDashboard },
  { label: "Reportes",         href: "/admin/reclamos",      icon: FileText        },
  { label: "Usuarios",         href: "/admin/users",         icon: Users           },
  { label: "Roles y Permisos", href: "/admin/roles",         icon: Shield          },
  { label: "Instituciones",    href: "/admin/institutions",  icon: Building2       },
  { label: "Categorías",       href: "/admin/categories",    icon: Tag             },
  { label: "Configuración",    href: "/admin/settings",      icon: Settings        },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? "open" : ""}`}>

        {/* LOGO */}
        <div className="sidebar-header">
        <Link href="/admin" onClick={onClose} style={{ textDecoration: "none" }}>
         <Image
          src="/logo.png"
          alt="ReportARG"
          width={110}
          height={38}
          className="sidebar-logo"
        />
        <p className="sidebar-subtitle">ADMIN PANEL</p>
        </Link>

          <button className="sidebar-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* NAV */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`sidebar-item ${active ? "active" : ""}`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="sidebar-footer">
        </div>
      </aside>
    </>
  );
}