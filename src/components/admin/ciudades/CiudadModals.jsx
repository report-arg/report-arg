"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Combobox from "@/components/ui/Combobox";
import { PROVINCIAS_AR } from "@/utils/constants";

export default function CiudadModals({
  // Modal Activar
  modalActivar = null,
  onCloseActivar = () => {},
  onConfirmActivar = () => {},
  instPrincipalSeleccionada = "",
  setInstPrincipalSeleccionada = () => {},

  // Modal Desactivar
  modalDesactivar = null,
  onCloseDesactivar = () => {},
  onConfirmDesactivar = () => {},
  motivoDesactivacion = "",
  setMotivoDesactivacion = () => {},
  errorMotivo = "",
  setErrorMotivo = () => {},

  // Modal Designar/Cambiar Principal
  modalPrincipal = null,
  onClosePrincipal = () => {},
  onConfirmPrincipal = () => {},
  nuevaPrincipalId = "",
  setNuevaPrincipalId = () => {},

  // Modal Registrar Nueva Localidad
  modalNuevaCiudad = false,
  onCloseNuevaCiudad = () => {},
  onConfirmNuevaCiudad = () => {},
  nuevaProvincia = "",
  setNuevaProvincia = () => {},
  nuevaLocalidad = "",
  setNuevaLocalidad = () => {},
  localidadesPadron = [],
  loadingLocalidades = false,

  // Estado general de procesamiento
  procesando = false,
}) {
  return (
    <>
      {/* 1. Modal: Activar Ciudad */}
      <ConfirmModal
        isOpen={Boolean(modalActivar)}
        onClose={onCloseActivar}
        onConfirm={onConfirmActivar}
        title={
          modalActivar ? `Activar ciudad: ${modalActivar.nombre}` : "Activar ciudad"
        }
        description={
          modalActivar
            ? `Para habilitar operativamente ${modalActivar.nombre} (${modalActivar.provincia}), debe contar con una institución principal verificada y activa que actúe como responsable general de la localidad.`
            : ""
        }
        variant="success"
        confirmText="Activar ciudad"
        loading={procesando}
        confirmDisabled={
          !instPrincipalSeleccionada ||
          (modalActivar?.instituciones_elegibles || []).length === 0
        }
      >
        {modalActivar && (
          <div className="space-y-3 pt-2">
            {(modalActivar.instituciones_elegibles || []).length === 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                <p className="font-bold m-0">
                  No hay instituciones verificadas y activas en {modalActivar.nombre}
                </p>
                <p className="m-0 leading-relaxed">
                  Una ciudad no puede activarse sin una institución principal válida. Verificá primero la solicitud de la municipalidad o entidad principal de esta ciudad.
                </p>
                <div className="pt-1">
                  <Link href="/admin/solicitudes">
                    <Button variant="outline" size="sm">
                      Ir a Bandeja de Solicitudes
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Select
                label="Institución Principal de la Ciudad"
                value={instPrincipalSeleccionada}
                onChange={(val) => setInstPrincipalSeleccionada(String(val))}
                options={(modalActivar.instituciones_elegibles || []).map((inst) => ({
                  value: String(inst.id),
                  label: `${inst.nombre}${inst.tipo ? ` (${inst.tipo})` : ""}`,
                }))}
                placeholder="Seleccioná la institución principal..."
              />
            )}
          </div>
        )}
      </ConfirmModal>

      {/* 2. Modal: Desactivar Ciudad */}
      <ConfirmModal
        isOpen={Boolean(modalDesactivar)}
        onClose={onCloseDesactivar}
        onConfirm={onConfirmDesactivar}
        title={
          modalDesactivar
            ? `Desactivar ciudad: ${modalDesactivar.nombre}`
            : "Desactivar ciudad"
        }
        description={
          modalDesactivar
            ? `Al desactivar ${modalDesactivar.nombre}, los ciudadanos no podrán registrar nuevos reclamos en esta localidad hasta que vuelva a habilitarse.`
            : ""
        }
        variant="danger"
        confirmText="Desactivar ciudad"
        loading={procesando}
      >
        <div className="pt-2">
          <Textarea
            label="Motivo de desactivación *"
            value={motivoDesactivacion}
            onChange={(e) => {
              setMotivoDesactivacion(e.target.value);
              if (errorMotivo) setErrorMotivo("");
            }}
            placeholder="Explicá el motivo administrativo u operativo de la desactivación..."
            rows={3}
            error={errorMotivo}
          />
        </div>
      </ConfirmModal>

      {/* 3. Modal: Designar / Cambiar Institución Principal */}
      <ConfirmModal
        isOpen={Boolean(modalPrincipal)}
        onClose={onClosePrincipal}
        onConfirm={onConfirmPrincipal}
        title={
          modalPrincipal
            ? `Institución Principal de ${modalPrincipal.nombre}`
            : "Designar Institución Principal"
        }
        description="La institución principal actúa como responsable general de la comunidad y recibe los reclamos que no posean una institución especializada asignada."
        variant="primary"
        confirmText="Guardar institución principal"
        loading={procesando}
        confirmDisabled={
          !nuevaPrincipalId ||
          (modalPrincipal?.instituciones_elegibles || []).length === 0
        }
      >
        {modalPrincipal && (
          <div className="space-y-3 pt-2">
            {(modalPrincipal.instituciones_elegibles || []).length === 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                <p className="font-bold m-0">
                  Sin instituciones verificadas elegibles en {modalPrincipal.nombre}
                </p>
                <p className="m-0 leading-relaxed">
                  Solo una institución verificada y activa perteneciente a esta localidad puede ser designada como institución principal.
                </p>
                <div className="pt-1">
                  <Link href="/admin/solicitudes">
                    <Button variant="outline" size="sm">
                      Revisar solicitudes pendientes
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Select
                label="Seleccionar institución verificada y activa"
                value={nuevaPrincipalId}
                onChange={(val) => setNuevaPrincipalId(String(val))}
                options={(modalPrincipal.instituciones_elegibles || []).map((inst) => ({
                  value: String(inst.id),
                  label: `${inst.nombre}${
                    Number(inst.es_principal) === 1 ? " (Principal actual)" : ""
                  }`,
                }))}
                placeholder="Seleccioná una institución..."
              />
            )}
          </div>
        )}
      </ConfirmModal>

      {/* 4. Modal: Registrar nueva localidad del padrón oficial */}
      <ConfirmModal
        isOpen={modalNuevaCiudad}
        onClose={onCloseNuevaCiudad}
        onConfirm={onConfirmNuevaCiudad}
        title="Registrar localidad en el padrón territorial"
        description="Incorporá una localidad oficial de Argentina al listado territorial. Se registrará inicialmente en estado Inactiva hasta que se verifique y asigne su institución principal."
        variant="primary"
        confirmText="Registrar localidad"
        loading={procesando}
        confirmDisabled={!nuevaProvincia || !nuevaLocalidad}
      >
        <div className="space-y-4 pt-2">
          <Select
            label="Provincia *"
            value={nuevaProvincia}
            onChange={(val) => {
              setNuevaProvincia(val);
              setNuevaLocalidad("");
            }}
            options={PROVINCIAS_AR.map((p) => ({ value: p, label: p }))}
            placeholder="Seleccioná una provincia..."
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-text-secondary">
              Localidad oficial *
            </label>
            <Combobox
              id="nueva-localidad-admin"
              value={nuevaLocalidad}
              onChange={(val) => setNuevaLocalidad(val)}
              options={localidadesPadron}
              placeholder={
                nuevaProvincia
                  ? "Seleccionar o buscar localidad..."
                  : "Primero elegí una provincia"
              }
              searchPlaceholder="Escribí para buscar localidad..."
              disabled={!nuevaProvincia}
              loading={loadingLocalidades}
            />
          </div>
        </div>
      </ConfirmModal>
    </>
  );
}

