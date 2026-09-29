"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { X, LogOut } from "lucide-react";
import ReportArgLogo from "@/components/brand/ReportArgLogo";

export default function AppSidebar({
  open = false,
  onClose = () => {},
  navigation = [],
  footerLinks = [],
  logoHref = "/ciudadano",
  subtitle = "EXPERIENCIA CIUDADANA",
  ctaNode = null,
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`home-sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`home-sidebar ${open ? "open" : ""}`}>
        <div className="home-sidebar-logo">
          <Link href={logoHref} onClick={onClose} style={{ textDecoration: "none" }}>
            <ReportArgLogo variant="horizontal" size={28} darkMode={true} />
            {subtitle && (
              <p className="home-sidebar-logo-sub" style={{ marginTop: 4 }}>{subtitle}</p>
            )}
          </Link>
          <button className="home-sidebar-close-btn" onClick={onClose} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        {/* CTA Opcional (Reportar problema, Crear comunicado, etc) */}
        {ctaNode && (
          <div style={{ padding: "12px 16px 4px" }}>
            {ctaNode}
          </div>
        )}

        <nav className="home-sidebar-nav mt-2">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`home-nav-item ${pathname === href ? "active" : ""}`}
              onClick={onClose}
            >
              {Icon && <Icon size={18} className="home-nav-icon" />}
              {label}
            </Link>
          ))}
        </nav>

        <div className="home-sidebar-footer">
          {footerLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="home-nav-item" onClick={onClose}>
              {Icon && <Icon size={18} className="home-nav-icon" />}
              {label}
            </Link>
          ))}
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
