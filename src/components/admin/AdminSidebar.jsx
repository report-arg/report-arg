"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Inbox,
  Building2,
  Users,
  AlertCircle,
  Tag,
  MapPin,
  Globe,
  LogOut,
  X,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import apiClient from "@/services/apiClient";

const NAV_ITEMS = [
  { href: "/admin",             label: "Dashboard",       icon: LayoutDashboard, exact: true },
  { href: "/admin/solicitudes", label: "Solicitudes",     icon: Inbox,           hasBadge: true },
  { href: "/admin/institutions",label: "Instituciones",   icon: Building2 },
  { href: "/admin/users",       label: "Usuarios",        icon: Users },
  { href: "/admin/reclamos",    label: "Supervisión",     icon: AlertCircle },
  { href: "/admin/categories",  label: "Categorías",      icon: Tag },
  { href: "/admin/ciudades",    label: "Ciudades",        icon: MapPin },
];

export default function AdminSidebar({ open = false, onClose = () => {} }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [solicitudesCount, setSolicitudesCount] = useState(0);

  // Cargar conteo de solicitudes pendientes (instituciones sin verificar)
  useEffect(() => {
    let isMounted = true;
    apiClient
      .get("/admin/instituciones/stats")
      .then((res) => {
        if (isMounted && res.data?.ok && res.data?.data) {
          setSolicitudesCount(Number(res.data.data.pendientes || 0));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Backdrop mobile */}
      <div
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity duration-200 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar contenedor */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-250 ease-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navegación del panel de administración"
      >
        {/* Cabecera / Logo */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3 no-underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            <Image
              src="/logo.png"
              alt="ReportARG"
              width={105}
              height={36}
              className="h-7 w-auto object-contain brightness-110"
              priority
            />
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-primary/20 text-primary-subtle border border-primary/30">
              <Shield size={10} className="text-primary" /> Admin
            </span>
          </Link>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar menú lateral"
          >
            <X size={18} />
          </button>
        </div>

        {/* Acceso directo a la aplicación pública / comunidad */}
        <div className="p-3 border-b border-slate-800/60">
          <Link
            href="/ciudadano"
            onClick={onClose}
            className="group flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-all text-xs font-semibold text-slate-200 no-underline shadow-xs"
            title="Ir a la aplicación comunitaria para ver feed, mapas y reclamos públicos"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1.5 rounded-lg bg-primary/20 text-primary-subtle group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                <Globe size={14} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate m-0 leading-tight">
                  Ver comunidad
                </p>
                <p className="text-[10px] text-slate-400 truncate m-0">
                  Feed, mapa y reportes
                </p>
              </div>
            </div>
            <ArrowUpRight size={14} className="text-slate-400 group-hover:text-white transition-colors shrink-0" />
          </Link>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Gestión de Plataforma
          </p>

          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            const showBadge = item.hasBadge && solicitudesCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold no-underline transition-colors ${
                  active
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    size={16}
                    className={active ? "text-white shrink-0" : "text-slate-400 shrink-0"}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {showBadge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full leading-none shrink-0 ${
                      active
                        ? "bg-white text-primary"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {solicitudesCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Pie de navegación / Perfil y Cerrar Sesión */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate m-0">
                {session?.user?.name || "Administrador"}
              </p>
              <p className="text-[10px] text-slate-400 truncate m-0">
                {session?.user?.email || "admin@reportarg.gob.ar"}
              </p>
            </div>
            <button
              onClick={async () => {
                await signOut({ redirect: false });
                window.location.href = "/login";
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cerrar Sesión"
              aria-label="Cerrar Sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
