"use client";

import NotificationListView from "@/components/notifications/NotificationListView";

export default function NotificacionesCiudadanoPage() {
  return (
    <NotificationListView
      title="Notificaciones"
      description="Avisos sobre cambios de estado en tus reclamos y actualizaciones institucionales"
      backLink="/ciudadano/reclamos"
      backLabel="Ir a Mis reclamos"
    />
  );
}
