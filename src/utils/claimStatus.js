export const ESTADO_LABELS = {
  "Pendiente":   { label: "Pendiente",   cls: "pendiente",   bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" },
  "En revisión": { label: "En revisión", cls: "en_proceso",  bg: "#e0e7ff", text: "#3730a3", border: "#a5b4fc" },
  "En proceso":  { label: "En proceso",  cls: "en_proceso",  bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  "Resuelto":    { label: "Resuelto",    cls: "resuelto",    bg: "#dcfce7", text: "#166534", border: "#86efac" },
  "Cancelado":   { label: "Cancelado",   cls: "rechazado",   bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  // compatibilidad legacy
  recibido:      { label: "Pendiente",   cls: "pendiente",   bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" },
  en_proceso:    { label: "En proceso",  cls: "en_proceso",  bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  resuelto:      { label: "Resuelto",    cls: "resuelto",    bg: "#dcfce7", text: "#166534", border: "#86efac" },
  rechazado:     { label: "Cancelado",   cls: "rechazado",   bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
};

export const PASOS_PROGRESO = ["Pendiente", "En revisión", "En proceso", "Resuelto"];

export function getEstadoConfig(estado) {
  return ESTADO_LABELS[estado] || { label: estado || "Pendiente", cls: "pendiente", bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" };
}
