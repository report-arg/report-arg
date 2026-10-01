"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Building2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import apiClient from "@/services/apiClient";
import { tiempoRelativo } from "@/utils/dateFormatters";

export default function NotificationBell({
  notificationsLink = "/ciudadano/notificaciones",
  className = "",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Determinar rol/portal dinámico para rutas de navegación
  const getReclamoPath = (idReclamo) => {
    if (pathname?.startsWith("/institucion")) {
      return `/institucion/reclamos/${idReclamo}`;
    }
    if (pathname?.startsWith("/admin")) {
      return `/admin/reclamos/${idReclamo}`;
    }
    return `/ciudadano/reclamos/${idReclamo}`;
  };

  // Cargar contador de no leídas al inicio
  const fetchUnreadCount = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await apiClient.get("/notificaciones/unread-count");
      if (res.data?.ok) {
        setNoLeidas(res.data.noLeidas || 0);
      }
    } catch {
      // Silenciar error en caso de offline
    }
  };

  // Cargar notificaciones para el dropdown
  const fetchNotifs = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await apiClient.get("/notificaciones?limite=8");
      if (res.data?.ok) {
        setNotifs(res.data.data || []);
        if (typeof res.data.noLeidas === "number") {
          setNoLeidas(res.data.noLeidas);
        }
      }
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [session?.user?.id, pathname]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  // Click outside y tecla Escape para cerrar popover
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMarcarLeida = async (n, e) => {
    if (e) e.stopPropagation();
    if (!n.leida) {
      try {
        await apiClient.patch(`/notificaciones/${n.id}/leida`);
        setNotifs((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, leida: true } : item))
        );
        setNoLeidas((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error al marcar leída:", err);
      }
    }

    if (n.id_reclamo) {
      setIsOpen(false);
      router.push(getReclamoPath(n.id_reclamo));
    }
  };

  const handleMarcarTodasLeidas = async () => {
    if (actionLoading || noLeidas === 0) return;
    setActionLoading(true);
    try {
      await apiClient.patch("/notificaciones/leidas");
      setNotifs((prev) => prev.map((item) => ({ ...item, leida: true })));
      setNoLeidas(0);
    } catch (err) {
      console.error("Error al marcar todas leídas:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case "CLAIM_RESOLVED":
        return <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />;
      case "CLAIM_CANCELLED":
        return <XCircle size={16} className="text-rose-500 shrink-0" />;
      case "CLAIM_UPDATE":
        return <MessageSquare size={16} className="text-blue-500 shrink-0" />;
      case "CLAIM_REASSIGNED":
        return <Building2 size={16} className="text-amber-500 shrink-0" />;
      case "CLAIM_STATUS_CHANGED":
      default:
        return <Clock size={16} className="text-[var(--home-primary)] shrink-0" />;
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Botón de la Campana */}
      <button
        type="button"
        className="home-icon-btn relative cursor-pointer"
        title="Notificaciones"
        aria-label="Abrir panel de notificaciones"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Bell size={18} />
        {noLeidas > 0 && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full shadow-xs ring-2 ring-[var(--home-card)] animate-in fade-in zoom-in"
            aria-label={`${noLeidas} notificaciones no leídas`}
          >
            {noLeidas > 99 ? "99+" : noLeidas}
          </span>
        )}
      </button>

      {/* Popover / Dropdown flotante */}
      {isOpen && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-[320px] sm:w-[360px] bg-[var(--home-card)] border border-[var(--home-border)] rounded-2xl shadow-xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          role="dialog"
          aria-label="Notificaciones recientes"
        >
          {/* Header del dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--home-border)] bg-[var(--home-bg)]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--home-text)] tracking-tight">
                Notificaciones
              </span>
              {noLeidas > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                  {noLeidas} nuevas
                </span>
              )}
            </div>

            {noLeidas > 0 && (
              <button
                type="button"
                onClick={handleMarcarTodasLeidas}
                disabled={actionLoading}
                className="text-[11px] font-medium text-[var(--home-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <CheckCheck size={13} />
                <span>Marcar todas</span>
              </button>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-[var(--home-border)]">
            {loading ? (
              <div className="py-10 flex flex-col items-center justify-center text-[var(--home-muted)] gap-2">
                <Loader2 size={18} className="animate-spin text-[var(--home-primary)]" />
                <span className="text-xs">Cargando avisos...</span>
              </div>
            ) : notifs.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <Bell size={22} className="mx-auto text-[var(--home-muted)] mb-2 opacity-50" />
                <p className="text-xs font-semibold text-[var(--home-text)]">
                  No tenés notificaciones nuevas.
                </p>
                <p className="text-[11px] text-[var(--home-muted)] mt-0.5">
                  Te avisaremos sobre novedades en tus reclamos.
                </p>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  onClick={(e) => handleMarcarLeida(n, e)}
                  className={`p-3.5 flex gap-3 transition-colors cursor-pointer text-left ${
                    n.leida
                      ? "bg-[var(--home-card)] hover:bg-[var(--home-bg)] opacity-85"
                      : "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/30 font-medium"
                  }`}
                >
                  <div className="pt-0.5">{getNotificationIcon(n.tipo)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-0.5">
                      <p className="text-xs font-semibold text-[var(--home-text)] truncate">
                        {n.titulo}
                      </p>
                      {!n.leida && (
                        <span className="w-2 h-2 rounded-full bg-[var(--home-primary)] shrink-0 mt-1" />
                      )}
                    </div>

                    <p className="text-xs text-[var(--home-text)] leading-snug line-clamp-2 opacity-90">
                      {n.mensaje}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-[var(--home-border)]/40 text-[10px] text-[var(--home-muted)]">
                      <span>{n.tiempo || tiempoRelativo(n.fecha_creacion || n.fecha) || "Reciente"}</span>
                      {n.id_reclamo && (
                        <span className="text-[var(--home-primary)] font-semibold inline-flex items-center gap-0.5">
                          Ver reclamo #{n.id_reclamo}
                          <ArrowRight size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer "Ver todas" */}
          {notificationsLink && (
            <div className="p-2.5 bg-[var(--home-bg)] border-t border-[var(--home-border)] text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push(notificationsLink);
                }}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-[var(--home-primary)] hover:bg-[var(--home-card)] transition-colors cursor-pointer text-center inline-flex items-center justify-center gap-1.5"
              >
                <span>Ver todas las notificaciones</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
