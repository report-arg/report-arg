/**
 * Utilidades para formateo y parseo consistente de fechas en reportARG.
 * Toda la plataforma trabaja con timestamps UTC almacenados en base de datos
 * y los visualiza en la zona horaria oficial de Argentina (America/Argentina/Buenos_Aires).
 */

export function parsearFecha(fechaStr) {
  if (!fechaStr) return null;
  if (fechaStr instanceof Date) return isNaN(fechaStr.getTime()) ? null : fechaStr;
  let str = String(fechaStr).trim();
  // Si viene en formato MySQL "YYYY-MM-DD HH:mm:ss"
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(str)) {
    str = str.replace(" ", "T") + "Z";
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(str)) {
    // Si viene en formato ISO sin 'Z' ni offset +/-XX:XX
    str += "Z";
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function tiempoRelativo(fechaStr) {
  const d = parsearFecha(fechaStr);
  if (!d) return "";
  const diff = Math.max(0, Date.now() - d.getTime());
  const min  = Math.floor(diff / 60000);
  if (min < 1)  return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const hs = Math.floor(min / 60);
  if (hs < 24)  return `Hace ${hs} h`;
  const dias = Math.floor(hs / 24);
  if (dias === 1) return "Hace 1 día";
  if (dias < 7) return `Hace ${dias} días`;
  return d.toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "numeric",
    month: "short",
  });
}

export function fechaExacta(fechaStr) {
  const d = parsearFecha(fechaStr);
  if (!d) return "";
  return d.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day:    "numeric",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatearFecha(fechaStr) {
  const d = parsearFecha(fechaStr);
  if (!d) return "";
  return d.toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatearFechaCorta(fechaStr) {
  const d = parsearFecha(fechaStr);
  if (!d) return "";
  return d.toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

