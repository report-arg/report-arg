"use client";

import { useEffect, useState } from "react";
import {
  Inbox,
  CheckCircle,
  XCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import StatusBadge from "@/components/ui/StatusBadge";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modales de acción
  const [modalAprobar, setModalAprobar] = useState(null);
  const [modalRechazar, setModalRechazar] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [motivoError, setMotivoError] = useState("");
  const [procesando, setProcesando] = useState(false);

  const cargarSolicitudes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/admin/instituciones?estado=pendiente");
      if (res.data?.ok) {
        setSolicitudes(res.data.data || []);
      } else {
        setError("No se pudieron cargar las solicitudes pendientes.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor para consultar solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  async function handleAprobar() {
    if (!modalAprobar) return;
    setProcesando(true);
    try {
      const res = await apiClient.put(`/admin/instituciones/${modalAprobar.id}/verificar`);
      if (res.data?.ok) {
        toast.success(`Institución "${modalAprobar.nombre}" verificada correctamente.`);
        setModalAprobar(null);
        await cargarSolicitudes();
      } else {
        toast.error(res.data?.mensaje || "Error al verificar institución.");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al verificar institución.");
    } finally {
      setProcesando(false);
    }
  }

  async function handleRechazar() {
    if (!modalRechazar) return;
    if (!motivoRechazo.trim()) {
      setMotivoError("El motivo de rechazo es obligatorio para notificar a la entidad.");
      return;
    }

    setProcesando(true);
    try {
      const res = await apiClient.put(`/admin/instituciones/${modalRechazar.id}/rechazar`, {
        motivo: motivoRechazo.trim(),
      });
      if (res.data?.ok) {
        toast.success(`Solicitud de "${modalRechazar.nombre}" rechazada correctamente.`);
        setModalRechazar(null);
        setMotivoRechazo("");
        setMotivoError("");
        await cargarSolicitudes();
      } else {
        toast.error(res.data?.mensaje || "Error al rechazar solicitud.");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al rechazar solicitud.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Solicitudes Administrativas"
        description="Bandeja de verificación y validación de nuevas instituciones para operar en ReportARG."
        action={
          <Button
            onClick={cargarSolicitudes}
            variant="outline"
            size="sm"
            loading={loading}
            leftIcon={<RefreshCw size={14} />}
          >
            Actualizar
          </Button>
        }
      />

      {/* Contenedor principal de solicitudes */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text-primary m-0">
              Verificación Institucional
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30">
              {solicitudes.length} pendientes
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-text-muted text-xs gap-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span>Consultando solicitudes pendientes...</span>
          </div>
        ) : error ? (
          <div className="py-12 px-4 text-center">
            <p className="text-xs text-rose-600 font-semibold mb-3">{error}</p>
            <Button onClick={cargarSolicitudes} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-text-muted mb-3">
              <Inbox size={24} />
            </div>
            <h4 className="text-sm font-bold text-text-primary m-0">
              No hay solicitudes pendientes
            </h4>
            <p className="text-xs text-text-muted mt-1 max-w-sm m-0">
              Todas las instituciones registradas han sido procesadas o ya se encuentran validadas en el sistema.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Institución</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Ubicación</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {solicitudes.map((inst) => (
                  <tr key={inst.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 font-bold">
                          <Building2 size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-text-primary m-0 truncate">
                            {inst.nombre}
                          </p>
                          <p className="text-[11px] text-text-muted m-0 capitalize">
                            {inst.tipo || "Institución"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <Mail size={13} className="text-text-muted shrink-0" />
                        <span className="truncate">{inst.email || "Sin email"}</span>
                      </div>
                      {inst.telefono && (
                        <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                          <Phone size={12} className="shrink-0" />
                          <span>{inst.telefono}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-text-muted shrink-0" />
                        <span>{inst.direccion || "Dirección no especificada"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status="Pendiente" customLabel="Pendiente" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          onClick={() => setModalAprobar(inst)}
                          variant="success"
                          size="sm"
                          leftIcon={<CheckCircle size={14} />}
                        >
                          Verificar
                        </Button>
                        <Button
                          onClick={() => {
                            setModalRechazar(inst);
                            setMotivoRechazo("");
                            setMotivoError("");
                          }}
                          variant="danger-soft"
                          size="sm"
                          leftIcon={<XCircle size={14} />}
                        >
                          Rechazar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Confirmar Aprobación */}
      {modalAprobar && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setModalAprobar(null)}
          onConfirm={handleAprobar}
          title="¿Verificar institución?"
          description={
            <>
              Estás por validar a <strong>{modalAprobar.nombre}</strong> ({modalAprobar.email}).
              Al verificarse, la institución quedará habilitada para gestionar reclamos de su competencia y emitir comunicados oficiales.
            </>
          }
          variant="success"
          confirmText="Verificar institución"
          cancelText="Cancelar"
          loading={procesando}
        />
      )}

      {/* Modal Confirmar Rechazo */}
      {modalRechazar && (
        <ConfirmModal
          isOpen={true}
          onClose={() => {
            setModalRechazar(null);
            setMotivoRechazo("");
            setMotivoError("");
          }}
          onConfirm={handleRechazar}
          title="Rechazar solicitud de institución"
          description={
            <>
              Indicá el motivo por el cual se rechaza la verificación de <strong>{modalRechazar.nombre}</strong>.
              Este motivo se notificará formalmente por correo electrónico al solicitante.
            </>
          }
          variant="danger"
          confirmText="Confirmar rechazo"
          cancelText="Cancelar"
          loading={procesando}
          confirmDisabled={!motivoRechazo.trim()}
        >
          <div className="mt-3">
            <label className="block text-xs font-bold text-text-primary mb-1">
              Motivo del rechazo <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={motivoRechazo}
              onChange={(e) => {
                setMotivoRechazo(e.target.value);
                setMotivoError("");
              }}
              placeholder="Ej. La documentación adjunta no coincide con el organismo público declarado..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-border-subtle bg-surface text-text-primary focus:border-rose-500 outline-hidden resize-y"
            />
            {motivoError && (
              <p className="text-[11px] text-rose-600 mt-1 font-semibold">{motivoError}</p>
            )}
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}
