"use client";

import NotificationListView from "@/components/notifications/NotificationListView";

export default function NotificacionesInstitucionPage() {
  return (
    <NotificationListView
      title="Alertas y Notificaciones"
      description="Novedades y avisos sobre los reclamos asignados a tu institución"
      backLink="/institucion/reclamos"
      backLabel="Ir a Bandeja de reclamos"
    />
  );
}
