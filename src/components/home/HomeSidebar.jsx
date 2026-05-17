"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home, Search, FileText, Building2, BarChart2,
  Settings, HelpCircle, LogOut, X,
} from "lucide-react";

const navLinks = [
  { href: "/home",               label: "Inicio",        icon: Home      },
  { href: "/home/explorar",      label: "Explorar",      icon: Search    },
  { href: "/home/reclamos",      label: "Mis Reclamos",  icon: FileText  },
  { href: "/home/instituciones", label: "Instituciones", icon: Building2 },
  { href: "/home/estadisticas",  label: "Estadísticas",  icon: BarChart2 },
];

export default function HomeSidebar({ open = false, onClose = () => {} }) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`home-sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`home-sidebar ${open ? "open" : ""}`}>
        <div className="home-sidebar-logo">
          <Link href="/home" onClick={onClose} style={{ textDecoration: "none" }}>
            <Image src="/logo.png" alt="ReportARG" width={110} height={38} style={{ objectFit: "contain" }} />
            <p className="home-sidebar-logo-sub">GESTIÓN CIUDADANA</p>
          </Link>
          <button className="home-sidebar-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

      <nav className="home-sidebar-nav">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`home-nav-item ${pathname === href ? "active" : ""}`}
          >
            <Icon size={18} className="home-nav-icon" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="home-sidebar-footer">
        <Link href="/home/configuracion" className="home-nav-item">
          <Settings size={18} className="home-nav-icon" />
          Configuración
        </Link>
        <Link href="/home/ayuda" className="home-nav-item">
          <HelpCircle size={18} className="home-nav-icon" />
          Ayuda
        </Link>
        <button
          className="home-nav-item"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut size={18} className="home-nav-icon" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
    </>
  );
}
