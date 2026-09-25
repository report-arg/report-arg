export function tiempoRelativo(fechaStr) {
  if (!fechaStr) return "";
  const diff = Date.now() - new Date(fechaStr).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)  return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const hs = Math.floor(min / 60);
  if (hs < 24)  return `Hace ${hs} h`;
  const dias = Math.floor(hs / 24);
  if (dias < 7) return `Hace ${dias} d`;
  return new Date(fechaStr).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export function fechaExacta(fechaStr) {
  if (!fechaStr) return "";
  return new Date(fechaStr).toLocaleString("es-AR", {
    day:    "numeric",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatearFecha(fechaStr) {
  if (!fechaStr) return "";
  return new Date(fechaStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
