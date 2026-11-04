"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldOff,
  Star,
  Tag,
  UserCheck,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import InstitucionAvatar from "./InstitucionAvatar";
import { formatearFecha } from "@/utils/dateFormatters";

export default function InstitucionDetailModal({
  isOpen = false,
  onClose,
  institucion,
  categoriasGlobales = [],
  onAprobar,
  onRechazar,
  onCambiarEstado,
  onDesignarPrincipal,
  onActualizarCategorias,
  procesando = false,
}) {
  const [editandoCategorias, setEditandoCategorias] = useState(false);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);

  useEffect(() => {
    if (institucion) {
      const idsActuales = Array.isArray(institucion.categorias)
        ? institucion.categorias.map((c) => Number(c.id_categoria ?? c.id))
        : [];
      setCategoriasSeleccionadas(idsActuales);
      setEditandoCategorias(false);
    }
  }, [institucion]);

  if (!institucion) return null;

  const isVerificada = Number(institucion.verificada) === 1;
  const isActiva = Number(institucion.activo ?? 1) === 1;
  const isSuspendida = isVerificada && !isActiva;
  const isRechazada =
    !isVerificada &&
    (institucion.status === "rejected" || Boolean(institucion.motivo_rechazo));
  const isEsPrincipal = Number(institucion.es_principal) === 1;

  const toggleCategoria = (idCat) => {
    const idNum = Number(idCat);
    setCategoriasSeleccionadas((prev) =>
      prev.includes(idNum) ? prev.filter((id) => id !== idNum) : [...prev, idNum]
    );
  };

  const handleGuardarCategorias = async () => {
    if (!onActualizarCategorias) return;
    const res = await onActualizarCategorias(institucion, categoriasSeleccionadas);
    if (res?.ok) {
      setEditandoCategorias(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha de Entidad Institucional"
      description={`Detalles operativos, jurisdicción y estado de ${institucion.nombre}`}
      icon={<Building2 size={20} />}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Cabecera entidad */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <InstitucionAvatar
              foto={institucion.foto_perfil}
              nombre={institucion.nombre}
              size="lg"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-text-primary m-0 truncate">
                {institucion.nombre}
              </h4>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Badge variant="outline" size="sm" pill={false}>
                  {institucion.tipo || "Institución"}
                </Badge>

                {isEsPrincipal && (
                  <Badge
                    variant="primary"
                    size="sm"
                    icon={<Star size={11} className="fill-current" />}
                  >
                    Institución Principal
                  </Badge>
                )}

                {isSuspendida ? (
                  <Badge variant="danger" size="sm">
                    Suspendida
                  </Badge>
                ) : isVerificada ? (
                  <Badge variant="success" size="sm">
                    Verificada
                  </Badge>
                ) : isRechazada ? (
                  <Badge variant="danger" size="sm">
                    Rechazada
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    Pendiente
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {isVerificada && isActiva && !isEsPrincipal && onDesignarPrincipal && (
            <Button
              onClick={() => onDesignarPrincipal(institucion)}
              variant="outline"
              size="sm"
              leftIcon={<Star size={13} />}
              disabled={procesando}
              title="Establecer como institución principal de la ciudad"
            >
              Designar Principal
            </Button>
          )}
        </div>

        {/* Motivo de rechazo si aplica */}
        {isRechazada && institucion.motivo_rechazo && (
          <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-xs space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-rose-700 dark:text-rose-400">
                Motivo de rechazo registrado:
              </span>
              {institucion.fecha_rechazo && (
                <span className="text-[11px] text-rose-600/80 dark:text-rose-300/80">
                  Rechazada el {formatearFecha(institucion.fecha_rechazo)} (ventana de 7 días)
                </span>
              )}
            </div>
            <p className="text-rose-900 dark:text-rose-200 m-0 leading-relaxed">
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
                ? `${institucion.ciudad_nombre}${
                    institucion.provincia ? `, ${institucion.provincia}` : ""
                  }`
                : "Sin ciudad asignada"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border-subtle">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
              Dirección Declarada
            </span>
            <p className="font-semibold text-text-primary m-0 truncate">
              {institucion.direccion || "No especificada"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border-subtle">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
              Email Institucional
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

          <div className="p-3 rounded-xl bg-surface border border-border-subtle">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
              CUIT / Identificación Fiscal
            </span>
            <p className="font-semibold text-text-primary m-0 flex items-center gap-1.5">
              <FileSpreadsheet size={13} className="text-text-muted shrink-0" />
              {institucion.cuit || "No informado"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border-subtle">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
              Responsable / Contacto
            </span>
            <p className="font-semibold text-text-primary m-0 flex items-center gap-1.5 truncate">
              <UserCheck size={13} className="text-text-muted shrink-0" />
              {institucion.nombre_contacto || "No informado"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border-subtle sm:col-span-2">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
              Trazabilidad de Registro
            </span>
            <p className="font-semibold text-text-primary m-0 flex flex-wrap items-center gap-1.5">
              <Calendar size={13} className="text-text-muted shrink-0" />
              <span>
                Registrada:{" "}
                {institucion.creado_en
                  ? formatearFecha(institucion.creado_en)
                  : "Fecha no disponible"}
              </span>
              {institucion.fecha_verificacion && (
                <span className="text-text-muted font-normal ml-1">
                  · Verificada el {formatearFecha(institucion.fecha_verificacion)}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Sección de Categorías Operativas Autorizadas */}
        <div className="p-3.5 rounded-xl bg-surface border border-border-subtle space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Tag size={14} className="text-primary" />
              <span className="text-xs font-bold text-text-primary">
                Categorías Operativas Asignadas
              </span>
            </div>

            {isVerificada && onActualizarCategorias && !editandoCategorias && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditandoCategorias(true)}
              >
                Configurar categorías
              </Button>
            )}
          </div>

          {!editandoCategorias ? (
            <div className="flex flex-wrap gap-1.5">
              {Array.isArray(institucion.categorias) &&
              institucion.categorias.length > 0 ? (
                institucion.categorias.map((cat) => (
                  <Badge
                    key={cat.id_categoria ?? cat.id}
                    variant="default"
                    size="sm"
                    pill={false}
                  >
                    {cat.nombre}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-text-muted m-0">
                  {isEsPrincipal
                    ? "Como Institución Principal, recibe por defecto todas las categorías sin institución especializada asignada en la ciudad."
                    : "Sin categorías específicas asignadas actualmente."}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <p className="text-[11px] text-text-muted m-0">
                Seleccioná las categorías que gestiona directamente esta institución en{" "}
                <strong>{institucion.ciudad_nombre || "su ciudad"}</strong>. Una categoría no
                puede estar asignada simultáneamente a dos instituciones activas de la misma
                ciudad.
              </p>

              <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-2 rounded-xl bg-surface-subtle border border-border-subtle">
                {categoriasGlobales.map((cat) => {
                  const idCat = Number(cat.id_categoria ?? cat.id);
                  const seleccionada = categoriasSeleccionadas.includes(idCat);
                  return (
                    <Button
                      key={idCat}
                      type="button"
                      size="sm"
                      variant={seleccionada ? "primary" : "outline"}
                      onClick={() => toggleCategoria(idCat)}
                      leftIcon={seleccionada ? <Check size={12} /> : null}
                      className="text-xs"
                    >
                      {cat.nombre}
                    </Button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const idsActuales = Array.isArray(institucion.categorias)
                      ? institucion.categorias.map((c) => Number(c.id_categoria ?? c.id))
                      : [];
                    setCategoriasSeleccionadas(idsActuales);
                    setEditandoCategorias(false);
                  }}
                  disabled={procesando}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleGuardarCategorias}
                  loading={procesando}
                >
                  Guardar categorías
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle">
          <div>
            {isVerificada && onCambiarEstado && (
              <Button
                onClick={() => onCambiarEstado(institucion)}
                variant={isActiva ? "danger-soft" : "success"}
                size="sm"
                leftIcon={isActiva ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                disabled={procesando}
              >
                {isActiva ? "Suspender institución" : "Rehabilitar institución"}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button onClick={onClose} variant="outline" size="sm">
              Cerrar
            </Button>

            {!isVerificada && onAprobar && (
              <Button
                onClick={() => onAprobar(institucion)}
                variant="success"
                size="sm"
                leftIcon={<CheckCircle size={13} />}
                disabled={procesando}
              >
                Verificar
              </Button>
            )}

            {!isVerificada && !isRechazada && onRechazar && (
              <Button
                onClick={() => onRechazar(institucion)}
                variant="danger-soft"
                size="sm"
                leftIcon={<XCircle size={13} />}
                disabled={procesando}
              >
                Rechazar
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
