import React from 'react';

export const PASOS_SECUENCIA = [
  { key: "Pendiente", label: "Pendiente" },
  { key: "En revisión", label: "En revisión" },
  { key: "En proceso", label: "En proceso" },
  { key: "Resuelto", label: "Resuelto" },
];

export const NOMBRES_EVENTO = {
  CANCELACION: "Cancelación",
  RESOLUCION: "Resolución",
  REAPERTURA: "Reapertura",
  CREACION: "Creación",
  EDICION: "Edición",
  CAMBIO_ESTADO: "Cambio de estado",
  REASIGNACION: "Reasignación",
};

export function getNombreEvento(tipo) {
  if (!tipo) return "Movimiento";
  return NOMBRES_EVENTO[tipo] || tipo.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());
}

export function getNodeStyle(tipoEvento) {
  switch (tipoEvento) {
    case 'CANCELACION':
      return { dot: 'bg-rose-500 ring-2 ring-rose-500/20', text: 'text-rose-700 dark:text-rose-400' };
    case 'RESOLUCION':
      return { dot: 'bg-emerald-500 ring-2 ring-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400' };
    case 'REAPERTURA':
      return { dot: 'bg-amber-500 ring-2 ring-amber-500/20', text: 'text-amber-700 dark:text-amber-400' };
    default:
      return { dot: 'bg-primary ring-2 ring-primary/20', text: 'text-text-primary' };
  }
}

export function formatearDetalleHistorial(detalle, institucionNombre) {
  if (!detalle) return "";
  const instNombre = institucionNombre || "la institución asignada";
  return detalle.replace(/Asignado a institución ID \d+/gi, `Asignado a ${instNombre}`);
}

export function renderContenidoEvento(ev, institucionNombre) {
  const detalleBase = formatearDetalleHistorial(ev.detalle, institucionNombre);
  if (!detalleBase) return null;

  if (ev.tipo_evento === 'CANCELACION') {
    const partes = detalleBase.split(/\.?\s*Motivo:\s*/i);
    const accion = partes[0]?.trim();
    const motivo = partes[1]?.trim();

    return (
      <div className="text-xs text-text-secondary mt-0.5 space-y-0.5 leading-relaxed">
        {accion && <p>{accion.endsWith('.') ? accion : `${accion}.`}</p>}
        {motivo && (
          <p className="text-text-secondary">
            <span className="font-semibold text-text-primary">Motivo:</span> {motivo}
          </p>
        )}
      </div>
    );
  }

  if (ev.tipo_evento === 'REAPERTURA') {
    const partes = detalleBase.split(/\.?\s*Motivo:\s*/i);
    const accion = partes[0]?.trim();
    const motivo = partes[1]?.trim();

    return (
      <div className="text-xs text-text-secondary mt-0.5 space-y-0.5 leading-relaxed">
        {accion && <p>{accion.endsWith('.') ? accion : `${accion}.`}</p>}
        {motivo && (
          <p className="text-text-secondary">
            <span className="font-semibold text-text-primary">Motivo:</span> {motivo}
          </p>
        )}
      </div>
    );
  }

  if (ev.tipo_evento === 'RESOLUCION') {
    const partes = detalleBase.split(/\.?\s*Mensaje:\s*/i);
    const accion = partes[0]?.trim();
    const mensaje = partes[1]?.trim();

    return (
      <div className="text-xs text-text-secondary mt-0.5 space-y-0.5 leading-relaxed">
        {accion && <p>{accion.endsWith('.') ? accion : `${accion}.`}</p>}
        {mensaje && (
          <p className="text-text-secondary">
            <span className="font-semibold text-text-primary">Resolución:</span> &ldquo;{mensaje}&rdquo;
          </p>
        )}
      </div>
    );
  }

  return (
    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
      {detalleBase.endsWith('.') ? detalleBase : `${detalleBase}.`}
    </p>
  );
}
