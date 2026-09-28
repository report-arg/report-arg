"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";

export default function NotificacionesPage() {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState([]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      {/* Header Notificaciones */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] text-xs font-semibold mb-1">
            <Bell size={13} />
            <span>Novedades del sistema</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Notificaciones
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Avisos sobre cambios de estado en tus reportes y actualizaciones institucionales
          </p>
        </div>

        {notificaciones.length > 0 && (
          <button
            onClick={() => setNotificaciones([])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <CheckCheck size={14} />
            <span>Marcar todas como leídas</span>
          </button>
        )}
      </div>

      {notificaciones.length === 0 ? (
        <EmptyState
          title="Estás al día con tus notificaciones"
          description="Te avisaremos cuando haya novedades en tus reclamos registrados o comunicaciones importantes."
          actionLabel="Ir a Mis reclamos"
          onAction={() => router.push("/home/reclamos")}
          icon={Bell}
        />
      ) : (
        <div className="space-y-3">
          {notificaciones.map(n => (
            <div key={n.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-900">{n.titulo}</p>
              <p className="text-xs text-slate-600 mt-1">{n.mensaje}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
