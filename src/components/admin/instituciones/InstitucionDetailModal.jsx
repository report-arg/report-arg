"use client";

import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import InstitucionAvatar from "./InstitucionAvatar";
import { formatearFecha } from "@/utils/dateFormatters";

export default function InstitucionDetailModal({
  isOpen = false,
  onClose,
  institucion,
  onAprobar,
  onRechazar,
}) {
  if (!institucion) return null;

  const isVerificada = Number(institucion.verificada) === 1;
  const isRechazada = Boolean(institucion.motivo_rechazo);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha de Entidad Institucional"
      description={`Detalles operativos y de contacto de ${institucion.nombre}`}
      icon={<Building2 size={20} />}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Cabecera entidad */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle flex items-center gap-3">
          <InstitucionAvatar
            foto={institucion.foto_perfil}
            nombre={institucion.nombre}
            size="lg"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-text-primary m-0 truncate">
              {institucion.nombre}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface border border-border-subtle text-text-secondary capitalize">
                {institucion.tipo || "Institución"}
              </span>
              {isVerificada ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Verificada
                </span>
              ) : isRechazada ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Rechazada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Pendiente
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Motivo de rechazo si aplica */}
        {isRechazada && institucion.motivo_rechazo && (
          <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-xs">
            <span className="font-bold text-rose-700 dark:text-rose-400 block mb-0.5">
              Motivo de rechazo registrado:
            </span>
            <p className="text-rose-900 dark:text-rose-300 m-0">
              {institucion.motivo_rechazo}
            </p>
          </div>
        )}

        {/* Grilla de datos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-surface border border-border-subtle">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
              Ciudad / Jurisdicción
            </span>
            <p className="font-semibold text-text-primary m-0 flex items-center gap-1.5">
              <MapPin size={13} className="text-text-muted shrink-0" />
              {institucion.ciudad_nombre
                ? `${institucion.ciudad_nombre}${institucion.provincia ? `, ${institucion.provincia}` : ""}`
                : "Sin ciudad asignada"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border-subtle">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
              Dirección
            </span>
            <p className="font-semibold text-text-primary m-0 truncate">
              {institucion.direccion || "No especificada"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border-subtle">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
              Email de Contacto
            </span>
            <p className="font-semibold text-text-primary m-0 flex items-center gap-1.5 truncate">
              <Mail size={13} className="text-text-muted shrink-0" />
              {institucion.email || "Sin email"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border-subtle">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
              Teléfono
            </span>
            <p className="font-semibold text-text-primary m-0 flex items-center gap-1.5">
              <Phone size={13} className="text-text-muted shrink-0" />
              {institucion.telefono || "No especificado"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border-subtle sm:col-span-2">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
              Fecha de Registro
            </span>
            <p className="font-semibold text-text-primary m-0 flex items-center gap-1.5">
              <Calendar size={13} className="text-text-muted shrink-0" />
              {institucion.creado_en
                ? formatearFecha(institucion.creado_en)
                : "Fecha no disponible"}
              {institucion.fecha_verificacion && (
                <span className="text-text-muted font-normal ml-2">
                  (Verificada el {formatearFecha(institucion.fecha_verificacion)})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle">
          <Button onClick={onClose} variant="outline" size="sm">
            Cerrar
          </Button>

          {!isVerificada && onAprobar && (
            <Button
              onClick={() => onAprobar(institucion)}
              variant="success"
              size="sm"
              leftIcon={<CheckCircle size={13} />}
            >
              Verificar
            </Button>
          )}

          {!isRechazada && onRechazar && (
            <Button
              onClick={() => onRechazar(institucion)}
              variant="danger-soft"
              size="sm"
              leftIcon={<XCircle size={13} />}
            >
              Rechazar
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
