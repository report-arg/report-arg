"use client";

import { useState, useEffect } from "react";
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
  Filter,
  Users,
} from "lucide-react";
import apiClient from "@/services/apiClient";
import EmptyState from "@/components/ui/EmptyState";
import { tiempoRelativo } from "@/utils/dateFormatters";

export default function NotificationListView({
  title = "Notificaciones",
  description = "Avisos sobre cambios de estado en tus reportes y actualizaciones institucionales",
  backLink = "/ciudadano/reclamos",
  backLabel = "Ir a Mis reclamos",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todas"); // 'todas' | 'no_leidas' | 'leidas'
  const [markingAll, setMarkingAll] = useState(false);

  const getReclamoPath = (idReclamo) => {
    if (session?.user?.role === "institucion" || pathname?.startsWith("/institucion")) {
      return `/institucion/reclamos/${idReclamo}`;
    }
    if (session?.user?.role === "admin" || pathname?.startsWith("/admin")) {
      return `/admin/reclamos/${idReclamo}`;
    }
    return `/ciudadano/reclamos/${idReclamo}`;
  };

  const fetchNotificaciones = async () => {
    setLoading(true);
    try {
      let url = "/notificaciones?limite=50";
      if (filtro === "no_leidas") url += "&filtro=no_leidas";
      if (filtro === "leidas") url += "&filtro=leidas";

      const res = await apiClient.get(url);
      if (res.data?.ok) {
        setNotificaciones(res.data.data || []);
      }
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, [filtro]);

  const handleMarcarLeida = async (n) => {
    if (!n.leida) {
      try {
        await apiClient.patch(`/notificaciones/${n.id}/leida`);
        setNotificaciones((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, leida: true } : item))
        );
      } catch (err) {
        console.error("Error al marcar leída:", err);
      }
    }

    if (n.id_reclamo) {
      router.push(getReclamoPath(n.id_reclamo));
    }
  };

  const handleMarcarTodasLeidas = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await apiClient.patch("/notificaciones/leidas");
      setNotificaciones((prev) => prev.map((item) => ({ ...item, leida: true })));
    } catch (err) {
      console.error("Error al marcar todas leídas:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case "CLAIM_RESOLVED":
        return <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />;
      case "CLAIM_CANCELLED":
        return <XCircle size={18} className="text-rose-500 shrink-0" />;
      case "CLAIM_UPDATE":
        return <MessageSquare size={18} className="text-blue-500 shrink-0" />;
      case "CLAIM_REASSIGNED":
        return <Building2 size={18} className="text-amber-500 shrink-0" />;
      case "CLAIM_ASSIGNED":
        return <Building2 size={18} className="text-indigo-500 shrink-0" />;
      case "CLAIM_REOPENED":
        return <Clock size={18} className="text-amber-600 shrink-0" />;
      case "CLAIM_SUPPORT":
        return <Users size={18} className="text-amber-500 shrink-0" />;
      case "CLAIM_STATUS_CHANGED":
      default:
        return <Clock size={18} className="text-[var(--home-primary)] shrink-0" />;
    }
  };

  return (
    <div className="w-full">
      {/* Header Notificaciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--home-border)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--primary-subtle)] text-[var(--home-primary)] text-xs font-semibold mb-1">
            <Bell size={13} />
            <span>Novedades del sistema</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--home-text)] tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-[var(--home-muted)] mt-0.5">
            {description}
          </p>
        </div>

        {noLeidasCount > 0 && (
          <button
            type="button"
            onClick={handleMarcarTodasLeidas}
            disabled={markingAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--home-text)] bg-[var(--home-bg)] border border-[var(--home-border)] hover:bg-[var(--home-card)] transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <CheckCheck size={14} className="text-[var(--home-primary)]" />
            <span>Marcar todas como leídas</span>
          </button>
        )}
      </div>

      {/* Tabs de Filtro */}
      <div className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={() => setFiltro("todas")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${filtro === "todas"
              ? "bg-[var(--home-primary)] text-white shadow-xs"
              : "bg-[var(--home-card)] text-[var(--home-muted)] hover:text-[var(--home-text)] border border-[var(--home-border)]"
            }`}
        >
          Todas
        </button>
        <button
          type="button"
          onClick={() => setFiltro("no_leidas")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${filtro === "no_leidas"
              ? "bg-[var(--home-primary)] text-white shadow-xs"
              : "bg-[var(--home-card)] text-[var(--home-muted)] hover:text-[var(--home-text)] border border-[var(--home-border)]"
            }`}
        >
          <span>No leídas</span>
          {noLeidasCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${filtro === "no_leidas"
                  ? "bg-white text-[var(--home-primary)]"
                  : "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                }`}
            >
              {noLeidasCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setFiltro("leidas")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${filtro === "leidas"
              ? "bg-[var(--home-primary)] text-white shadow-xs"
              : "bg-[var(--home-card)] text-[var(--home-muted)] hover:text-[var(--home-text)] border border-[var(--home-border)]"
            }`}
        >
          Leídas
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-[var(--home-muted)] gap-2">
          <Loader2 size={24} className="animate-spin text-[var(--home-primary)]" />
          <span className="text-xs">Cargando notificaciones...</span>
        </div>
      ) : notificaciones.length === 0 ? (
        <EmptyState
          title={
            filtro === "no_leidas"
              ? "No tenés notificaciones pendientes"
              : "No hay notificaciones para mostrar"
          }
          description={
            filtro === "no_leidas"
              ? "Estás al día con todas las novedades de tus reclamos."
              : "Te avisaremos cuando haya novedades en tus reclamos registrados o comunicaciones importantes."
          }
          actionLabel={backLabel}
          onAction={() => router.push(backLink)}
          icon={Bell}
        />
      ) : (
        <div className="space-y-3">
          {notificaciones.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarcarLeida(n)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${n.leida
                  ? "bg-[var(--home-card)] border-[var(--home-border)] opacity-85 hover:opacity-100"
                  : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 shadow-xs"
                }`}
            >
              <div className="flex items-start gap-3">
                <div className="pt-0.5">{getNotificationIcon(n.tipo)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-bold text-[var(--home-text)]">
                      {n.titulo}
                    </p>
                    <span className="text-[11px] text-[var(--home-muted)] shrink-0">
                      {n.tiempo || tiempoRelativo(n.fecha_creacion || n.fecha) || "Reciente"}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--home-text)] leading-relaxed opacity-90">
                    {n.mensaje}
                  </p>

                  {n.id_reclamo && (
                    <div className="mt-3 pt-2 border-t border-[var(--home-border)]/60 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[var(--home-primary)] inline-flex items-center gap-1 hover:underline">
                        Ver reclamo
                        <ArrowRight size={12} />
                      </span>

                      {!n.leida && (
                        <span className="text-[10px] font-medium text-[var(--home-primary)] bg-[var(--primary-subtle)] px-2 py-0.5 rounded-full">
                          Nueva
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
