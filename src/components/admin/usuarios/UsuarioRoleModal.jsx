"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Shield, User as UserIcon, Loader2, AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

const OPCIONES_ROL = [
  { value: "ciudadano", label: "Ciudadano" },
  { value: "admin", label: "Administrador" },
];

export default function UsuarioRoleModal({
  isOpen = false,
  onClose,
  usuario = null,
  currentUserId = null,
  onRoleChanged,
}) {
  const [nuevoRol, setNuevoRol] = useState("ciudadano");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (usuario && isOpen) {
      setNuevoRol((usuario.rol || "ciudadano").toLowerCase());
      setError("");
    }
  }, [usuario, isOpen]);

  if (!usuario) return null;

  const esMiCuenta = Number(usuario.id) === Number(currentUserId);
  const esInstitucion = (usuario.rol || "").toLowerCase() === "institucion";
  const mismoRol = nuevoRol === (usuario.rol || "").toLowerCase();

  const handleConfirm = async () => {
    if (mismoRol) {
      onClose();
      return;
    }
    if (esMiCuenta && nuevoRol !== "admin") {
      setError("No podés quitarte los permisos de administrador a tu propia cuenta.");
      return;
    }
    if (esInstitucion) {
      setError(
        "No se puede cambiar el rol de una cuenta institucional para preservar la trazabilidad de los reclamos asignados."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onRoleChanged?.(usuario.id, nuevoRol);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.mensaje || err?.message || "Error al actualizar el rol del usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cambiar rol de usuario"
      description={`Modificá el nivel de acceso en la plataforma para "${usuario.nombre || usuario.email}".`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 pt-2">
        {esInstitucion ? (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold m-0">Cuenta Institucional</p>
              <p className="m-0 mt-0.5 text-[11px] leading-relaxed">
                Las cuentas institucionales no admiten cambio de rol directo para preservar la trazabilidad histórica de los reclamos atendidos. La habilitación o suspensión debe gestionarse desde el Padrón Institucional.
              </p>
            </div>
          </div>
        ) : esMiCuenta ? (
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs flex items-start gap-2.5">
            <ShieldAlert size={16} className="shrink-0 mt-0.5 text-primary" />
            <div>
              <p className="font-bold m-0">Tu propia cuenta administradora</p>
              <p className="m-0 mt-0.5 text-[11px] leading-relaxed">
                No está permitida la auto-degradación de tu cuenta administradora activa para evitar bloqueos accidentales de acceso a la plataforma.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Seleccionar nuevo rol <span className="text-rose-500">*</span>
              </label>
              <Select
                value={nuevoRol}
                onChange={setNuevoRol}
                options={OPCIONES_ROL}
                placeholder="Seleccionar rol"
              />
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs space-y-1">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Alcance del rol seleccionado:
              </span>
              {nuevoRol === "admin" ? (
                <div className="flex items-start gap-2 text-text-primary text-[11px] pt-1">
                  <Shield size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Administrador:</strong> Acceso total de gestión y supervisión a la plataforma, padrón de instituciones, localidades, categorías y auditoría.
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-text-primary text-[11px] pt-1">
                  <UserIcon size={14} className="text-text-muted shrink-0 mt-0.5" />
                  <span>
                    <strong>Ciudadano:</strong> Acceso a la experiencia comunitaria, publicación de reclamos y consulta de información oficial en sus ciudades de residencia e interés.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={loading || esInstitucion || (esMiCuenta && nuevoRol !== "admin") || mismoRol}
            leftIcon={loading ? <Loader2 size={13} className="animate-spin" /> : <Shield size={13} />}
          >
            {loading ? "Actualizando..." : "Confirmar cambio de rol"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

