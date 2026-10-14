"use client";

import {
  FileText,
  ShieldAlert,
  ArrowRightLeft,
  Tag,
  Building2,
  MapPin,
  User,
  Clock,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import ClaimTracking from "@/components/reclamos/ClaimTracking";
import { formatearFecha } from "@/utils/dateFormatters";

export default function ClaimDetailModal({
  isOpen = false,
  onClose,
  detalle,
  onAbrirReasignar,
}) {
  if (!detalle) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Supervisión Reclamo #${String(detalle.id).padStart(4, "0")}`}
      description="Ficha técnica, trazabilidad y registro histórico de auditoría."
      icon={<FileText size={20} />}
      iconBgClass="bg-primary/10 text-primary"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Aviso informativo de supervisión administrativa */}
        <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle flex items-start gap-2.5 text-xs text-text-secondary">
          <ShieldAlert size={16} className="text-primary shrink-0 mt-0.5" />
          <div>
            <strong className="text-text-primary block font-medium">
              Supervisión y Gobernanza Administrativa
            </strong>
            El panel de administración tiene facultades de control y reasignación territorial. La actualización de estados operativos corresponde exclusivamente a la institución responsable designada.
          </div>
        </div>

        {/* Encabezado y Estado actual */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface border border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <ClaimStatusBadge estado={detalle.estado} />
              <ClaimTracking reclamo={detalle} advertir={true} />
            </div>
            <h3 className="text-base font-bold text-text-primary mt-2 m-0">
              {detalle.titulo}
            </h3>
          </div>
          {onAbrirReasignar && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAbrirReasignar(detalle)}
              leftIcon={<ArrowRightLeft size={14} />}
            >
              Reasignar
            </Button>
          )}
        </div>

        {/* Descripción */}
        {detalle.descripcion && (
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Descripción del reporte
            </span>
            <p className="text-xs sm:text-sm text-text-primary bg-surface p-3 rounded-xl border border-border-subtle whitespace-pre-line m-0 leading-relaxed">
              {detalle.descripcion}
            </p>
          </div>
        )}

        {/* Metadatos en cuadrícula */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-border-subtle bg-surface space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Tag size={12} className="text-primary" /> Categoría
            </span>
            <p className="font-medium text-text-primary m-0">
              {detalle.categoriaNombre || "General"}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-border-subtle bg-surface space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Building2 size={12} className="text-primary" /> Institución Responsable
            </span>
            <p className="font-medium text-text-primary m-0">
              {detalle.institucionNombre || "Sin asignar"}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-border-subtle bg-surface space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <MapPin size={12} className="text-primary" /> Ubicación y Ciudad
            </span>
            <p className="font-medium text-text-primary m-0">
              {detalle.direccion || "Sin dirección"}
              {detalle.ciudadNombre ? ` · ${detalle.ciudadNombre}` : ""}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-border-subtle bg-surface space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <User size={12} className="text-primary" /> Autor del Reclamo
            </span>
            <p className="font-medium text-text-primary m-0">
              {detalle.autorNombre || "Ciudadano"}
            </p>
            <p className="text-[11px] text-text-muted m-0">
              Registrado el {formatearFecha(detalle.fecha_creacion)}
            </p>
          </div>
        </div>

        {/* Historial de Auditoría */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 m-0">
            <Clock size={13} className="text-primary" />
            Historial de Cambios y Auditoría
          </h4>

          {(!detalle.historial || detalle.historial.length === 0) ? (
            <p className="text-xs text-text-muted italic bg-surface-subtle p-3 rounded-xl border border-border-subtle">
              No se registran eventos históricos adicionales para este reclamo.
            </p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {detalle.historial.map((h, idx) => (
                <div
                  key={h.id || idx}
                  className="p-3 rounded-xl bg-surface border border-border-subtle flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded-md bg-surface-subtle border border-border-subtle">
                        {h.tipo_evento || "EVENTO"}
                      </span>
                      {h.estado_nuevo && (
                        <span className="text-[11px] text-text-secondary">
                          Estado: <strong>{h.estado_nuevo}</strong>
                        </span>
                      )}
                    </div>
                    <p className="text-text-primary m-0 mt-1">{h.detalle}</p>
                    <p className="text-[11px] text-text-muted m-0">
                      Por: {h.autorNombre || "Sistema / Administrador"}
                    </p>
                  </div>
                  <span className="text-[11px] text-text-muted whitespace-nowrap shrink-0">
                    {formatearFecha(h.fecha_creacion)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="pt-4 border-t border-border-subtle flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
