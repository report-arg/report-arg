"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home, Search, FileText, Activity, Map, Bell,
  Settings, HelpCircle, LogOut, X, Megaphone,
  Shield, PlusSquare,
} from "lucide-react";
import ReportArgLogo from "@/components/brand/ReportArgLogo";
import { ReportProblemIcon } from "@/components/brand/icons";

const BASE_LINKS = [
  { href: "/home",               label: "Inicio",               icon: Home     },
  { href: "/home/explorar",      label: "Explorar",             icon: Search   },
  { href: "/home/reclamos",      label: "Mis Reclamos",         icon: FileText },
  { href: "/home/mapa",          label: "Mapa",                 icon: Map      },
  { href: "/home/actividad",     label: "Actividad en mi ciudad", icon: Activity },
  { href: "/home/notificaciones",label: "Notificaciones",       icon: Bell     },
];

const INST_EXTRA = [
  { href: "/home/institucion/comunicados",       label: "Mis Comunicados", icon: Megaphone  },
  { href: "/home/institucion/comunicados/nuevo", label: "Nuevo Comunicado",icon: PlusSquare },
];

const ADMIN_EXTRA = [
  { href: "/admin", label: "Panel Admin", icon: Shield },
];

export default function HomeSidebar({ open = false, onClose = () => {}, role = "ciudadano" }) {
  const pathname = usePathname();
  const router   = useRouter();

  const extraLinks =
    role === "admin"      ? ADMIN_EXTRA :
    role === "institucion"? INST_EXTRA  : [];

  const allLinks = [...BASE_LINKS, ...extraLinks];

  const subtitleMap = {
    admin:       "ADMINISTRADOR",
    institucion: "GESTIÓN INSTITUCIONAL",
    ciudadano:   "EXPERIENCIA CIUDADANA",
  };
  const subtitle = subtitleMap[role] ?? "EXPERIENCIA CIUDADANA";

  return (
    <>
      <div
        className={`home-sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`home-sidebar ${open ? "open" : ""}`}>
        <div className="home-sidebar-logo">
          <Link href="/home" onClick={onClose} style={{ textDecoration: "none" }}>
            <ReportArgLogo variant="horizontal" size={28} />
            <p className="home-sidebar-logo-sub" style={{ marginTop: 4 }}>{subtitle}</p>
          </Link>
          <button className="home-sidebar-close-btn" onClick={onClose} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        {/* CTA contextual para ciudadano o institución */}
        {role === "ciudadano" && (
          <div style={{ padding: "12px 16px 4px" }}>
            <button
              className="btn-primary-report"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { router.push("/home/reclamos/nuevo"); onClose(); }}
            >
              <ReportProblemIcon size={16} />
              Reportar un problema
            </button>
          </div>
        )}

        {role === "institucion" && (
          <div style={{ padding: "12px 16px 4px" }}>
            <button
              className="hs-cta-btn"
              onClick={() => { router.push("/home/institucion/comunicados/nuevo"); onClose(); }}
            >
              <Megaphone size={16} />
              Nuevo Comunicado
            </button>
          </div>
        )}

        <nav className="home-sidebar-nav">
          {allLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`home-nav-item ${pathname === href ? "active" : ""}`}
              onClick={onClose}
            >
              <Icon size={18} className="home-nav-icon" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="home-sidebar-footer">
          <Link href="/profile" className="home-nav-item" onClick={onClose}>
            <Settings size={18} className="home-nav-icon" />
            Mi Perfil
          </Link>
          <button
            className="home-nav-item"
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = "/login";
            }}
          >
            <LogOut size={18} className="home-nav-icon" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
