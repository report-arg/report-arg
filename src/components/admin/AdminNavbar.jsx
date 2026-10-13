"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  Search,
  Bell,
  Globe,
  User,
  LogOut,
  ChevronDown,
  X,
  Check,
  Loader2,
  FileText,
  Tag,
  Users as UsersIcon,
  Shield,
  ArrowRight,
} from "lucide-react";
import apiClient from "@/services/apiClient";

const SECTION_TITLES = {
  "/admin": "Dashboard General",
  "/admin/solicitudes": "Solicitudes Administrativas",
  "/admin/institutions": "Gestión de Instituciones",
  "/admin/users": "Gestión de Usuarios",
  "/admin/users/new": "Nuevo Usuario",
  "/admin/reclamos": "Supervisión de Reclamos",
  "/admin/reclamos/nuevo": "Registrar Reclamo",
  "/admin/categories": "Administración de Categorías",
  "/admin/categories/crear": "Crear Categoría",
  "/admin/ciudades": "Administración Territorial",
};

export default function AdminNavbar({ onOpenSidebar = () => {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  // Búsqueda global
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Notificaciones
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const notifRef = useRef(null);
  const noLeidas = notifs.filter((n) => !n.leida).length;

  // Menú de perfil
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Determinar título contextual
  const currentTitle =
    SECTION_TITLES[pathname] ||
    (pathname.startsWith("/admin/users/") ? "Detalle de Usuario" : "Panel de Administración");

  // Cerrar paneles al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    const term = searchQuery.trim();
    if (!term) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    setSearchLoading(true);
    setSearchOpen(true);
    const timer = setTimeout(async () => {
      try {
        const res = await apiClient.get(`/admin/buscar?q=${encodeURIComponent(term)}`);
        if (res.data?.ok) {
          setSearchResults(res.data.data || []);
        }
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cargar notificaciones al abrir panel
  useEffect(() => {
    if (!notifOpen) return;
    setNotifsLoading(true);
    apiClient
      .get("/admin/notificaciones")
      .then((res) => {
        if (res.data?.ok) setNotifs(res.data.data || []);
      })
      .catch(() => {})
      .finally(() => setNotifsLoading(false));
  }, [notifOpen]);

  async function marcarLeida(id) {
    try {
      await apiClient.put(`/admin/notificaciones/${id}/leer`);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    } catch (err) {
      console.error("Error al marcar leída:", err);
    }
  }

  async function marcarTodasLeidas() {
    try {
      await apiClient.put("/admin/notificaciones/leer-todas");
      setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (err) {
      console.error("Error al marcar todas leídas:", err);
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/90 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Lado izquierdo: Hamburguesa + Título contextual */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
          aria-label="Abrir menú de navegación"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted m-0 hidden sm:block">
            Panel de Administración
          </p>
          <h2 className="text-sm sm:text-base font-bold text-text-primary m-0 truncate">
            {currentTitle}
          </h2>
        </div>
      </div>

      {/* Lado derecho: Buscador global + Ver Comunidad + Notificaciones + Perfil */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Buscador global con dropdown */}
        <div ref={searchRef} className="relative hidden md:block w-56 lg:w-72">
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setSearchOpen(true)}
              placeholder="Buscar usuarios, reclamos..."
              className="w-full text-xs py-2 pl-9 pr-7 rounded-xl bg-surface-subtle border border-border-subtle focus:bg-surface focus:border-primary text-text-primary placeholder:text-text-muted outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-text-muted hover:text-text-primary cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Resultados de búsqueda flotantes */}
          {searchOpen && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-surface rounded-xl border border-border-subtle shadow-md z-50 max-h-80 overflow-y-auto p-1.5">
              {searchLoading ? (
                <div className="flex items-center justify-center py-6 text-text-muted text-xs gap-2">
                  <Loader2 size={15} className="animate-spin text-primary" />
                  <span>Buscando...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <p className="py-4 text-center text-xs text-text-muted m-0">
                  No se encontraron resultados para &quot;{searchQuery}&quot;
                </p>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((item, idx) => {
                    const iconMap = {
                      Usuario: UsersIcon,
                      Reporte: FileText,
                      Categoría: Tag,
                    };
                    const ItemIcon = iconMap[item.tipo] || FileText;

                    return (
                      <button
                        key={`${item.tipo}-${idx}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                          router.push(item.href || "/admin");
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-surface-subtle transition-colors flex items-center justify-between gap-2 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="p-1.5 rounded-md bg-surface-subtle text-text-muted group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                            <ItemIcon size={13} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-text-primary truncate m-0 group-hover:text-primary transition-colors">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-text-muted truncate m-0">
                              {item.tipo} · {item.sub}
                            </p>
                          </div>
                        </div>
                        <ArrowRight size={12} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Campanita de notificaciones */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer relative"
            aria-label="Notificaciones"
          >
            <Bell size={18} />
            {noLeidas > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface animate-pulse">
                {noLeidas > 9 ? "9+" : noLeidas}
              </span>
            )}
          </button>

          {/* Dropdown de notificaciones */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface rounded-2xl border border-border-subtle shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-text-primary m-0">Notificaciones</h3>
                  <p className="text-[11px] text-text-muted m-0">
                    {noLeidas > 0 ? `${noLeidas} sin leer` : "Todas leídas"}
                  </p>
                </div>
                {noLeidas > 0 && (
                  <button
                    onClick={marcarTodasLeidas}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Marcar todas
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-border-subtle">
                {notifsLoading ? (
                  <div className="py-8 text-center text-xs text-text-muted flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <span>Cargando notificaciones...</span>
                  </div>
                ) : notifs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-text-muted">
                    No tenés notificaciones pendientes
                  </div>
                ) : (
                  notifs.slice(0, 8).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.leida && marcarLeida(n.id)}
                      className={`p-3 text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                        !n.leida ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-surface-subtle opacity-80"
                      }`}
                    >
                      <span className="p-1 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                        <Bell size={12} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-text-primary m-0 leading-snug">
                          {n.titulo || n.mensaje}
                        </p>
                        {n.titulo && (
                          <p className="text-[11px] text-text-muted m-0 mt-0.5 leading-snug">
                            {n.mensaje}
                          </p>
                        )}
                        <span className="text-[10px] text-text-muted mt-1 block">
                          {n.fecha_creacion ? new Date(n.fecha_creacion).toLocaleDateString("es-AR") : ""}
                        </span>
                      </div>
                      {!n.leida && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menú de Perfil */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-subtle transition-colors cursor-pointer"
            aria-label="Menú de perfil"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
              {session?.user?.name
                ? session.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "AD"}
            </div>
            <ChevronDown size={14} className="text-text-muted hidden sm:block" />
          </button>

          {/* Dropdown de perfil */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-2xl border border-border-subtle shadow-lg z-50 p-2">
              <div className="px-3 py-2 border-b border-border-subtle mb-1">
                <p className="text-xs font-bold text-text-primary m-0 truncate">
                  {session?.user?.name || "Administrador"}
                </p>
                <p className="text-[10px] text-text-muted m-0 truncate">
                  {session?.user?.email || "admin@reportarg.gob.ar"}
                </p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-primary/10 text-primary">
                  Rol: Administrador
                </span>
              </div>

              <Link
                href="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-primary hover:bg-surface-subtle transition-colors no-underline cursor-pointer"
              >
                <User size={14} className="text-text-muted" />
                Mi Perfil
              </Link>

              <Link
                href="/ciudadano"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-primary hover:bg-surface-subtle transition-colors no-underline cursor-pointer"
              >
                <Globe size={14} className="text-text-muted" />
                Ir a la Comunidad
              </Link>

              <div className="border-t border-border-subtle my-1" />

              <button
                onClick={async () => {
                  await signOut({ redirect: false });
                  window.location.href = "/login";
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:dark:bg-rose-950/20 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
