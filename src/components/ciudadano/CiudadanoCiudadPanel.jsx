"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { MapPin, Plus, Trash2, AlertTriangle, CheckCircle2, Globe, Home, ArrowRight } from "lucide-react";
import { useCiudadanoCiudad } from "@/context/CiudadanoCiudadContext";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function CiudadanoCiudadPanel() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const {
    loading,
    procesando,
    ciudadResidencia,
    ciudadesInteres,
    ciudadesInteresInactivas,
    ciudadesActivas,
    ciudadSeleccionada,
    esVisitante,
    maxCiudadesInteres,
    modalAbierto,
    setModalAbierto,
    seleccionarCiudad,
    agregarCiudadInteres,
    eliminarCiudadInteres,
  } = useCiudadanoCiudad();

  const [nuevaCiudadId, setNuevaCiudadId] = useState("");
  const [ciudadVisitanteId, setCiudadVisitanteId] = useState("");

  // Opciones disponibles para agregar como ciudad de interés (solo activas que no sean residencia ni estén ya guardadas)
  const opcionesParaAgregar = useMemo(() => {
    const idsGuardados = new Set(ciudadesInteres.map((c) => Number(c.id)));
    return (ciudadesActivas || [])
      .filter((c) => {
        if (ciudadResidencia?.id && Number(c.id) === Number(ciudadResidencia.id)) return false;
        if (
          ciudadResidencia?.nombre &&
          ciudadResidencia?.provincia &&
          String(c.nombre).trim().toLowerCase() === String(ciudadResidencia.nombre).trim().toLowerCase() &&
          String(c.provincia).trim().toLowerCase() === String(ciudadResidencia.provincia).trim().toLowerCase()
        ) {
          return false;
        }
        return !idsGuardados.has(Number(c.id));
      })
      .map((c) => ({
        value: String(c.id),
        label: `${c.nombre}, ${c.provincia}`,
      }));
  }, [ciudadesActivas, ciudadesInteres, ciudadResidencia]);

  // Opciones activas para continuar como visitante cuando la residencia está inactiva
  const opcionesVisitante = useMemo(() => {
    return (ciudadesActivas || []).map((c) => ({
      value: String(c.id),
      label: `${c.nombre}, ${c.provincia}`,
    }));
  }, [ciudadesActivas]);

  const limiteAlcanzado = ciudadesInteres.length >= maxCiudadesInteres;

  const solicitudActivacionUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (ciudadResidencia?.nombre) params.set("ciudad", ciudadResidencia.nombre);
    if (ciudadResidencia?.provincia) params.set("provincia", ciudadResidencia.provincia);
    const qs = params.toString();
    return qs ? `/solicitud-activacion?${qs}` : "/solicitud-activacion";
  }, [ciudadResidencia]);

  async function handleAgregarInteres() {
    if (!nuevaCiudadId || limiteAlcanzado) return;
    const ok = await agregarCiudadInteres(Number(nuevaCiudadId));
    if (ok) {
      setNuevaCiudadId("");
    }
  }

  async function handleContinuarComoVisitante() {
    if (!ciudadVisitanteId) return;
    await seleccionarCiudad(Number(ciudadVisitanteId));
  }

  if (loading) return null;

  if (isAdmin) {
    return (
      <>
        <div className="mb-4">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-surface border border-border-subtle shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                <Globe size={14} className="text-primary shrink-0" />
                <span className="font-medium text-text-muted">Vista Comunitaria (Admin):</span>
                <span className="font-bold text-text-primary">
                  {ciudadSeleccionada?.nombre
                    ? `${ciudadSeleccionada.nombre}${ciudadSeleccionada.provincia ? `, ${ciudadSeleccionada.provincia}` : ""}`
                    : "Ninguna ciudad seleccionada"}
                </span>
                {ciudadSeleccionada?.id && (
                  <Badge variant="success" size="sm">
                    Jurisdicción activa
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<MapPin size={14} />}
                onClick={() => setModalAbierto(true)}
              >
                Cambiar ciudad activa
              </Button>
            </div>
          </div>
        </div>

        <Modal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          title="Seleccionar ciudad activa para la comunidad"
          description="Elegí la localidad activa donde querés interactuar o registrar un reclamo como administrador."
          icon={<MapPin size={20} />}
          maxWidth="md"
        >
          <div className="space-y-4">
            <Select
              id="select-ciudad-admin"
              label="Localidad activa *"
              value={ciudadSeleccionada?.id ? String(ciudadSeleccionada.id) : ""}
              onChange={(val) => {
                seleccionarCiudad(Number(val));
              }}
              options={(ciudadesActivas || []).map((c) => ({
                value: String(c.id),
                label: `${c.nombre}, ${c.provincia}`,
              }))}
              placeholder="Seleccioná una localidad activa..."
            />

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalAbierto(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      {/* Barra compacta superior de residencia y contexto territorial en el panel ciudadano */}
      <div className="mb-4 space-y-3">
        <div className="p-3 sm:p-3.5 rounded-2xl bg-surface border border-border-subtle shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
              <Home size={14} className="text-primary shrink-0" />
              <span className="font-medium text-text-muted">Residencia:</span>
              <span className="font-bold text-text-primary">
                {ciudadResidencia?.nombre || "Sin declarar"}
                {ciudadResidencia?.provincia ? `, ${ciudadResidencia.provincia}` : ""}
              </span>
              <Badge
                variant={ciudadResidencia?.activa ? "success" : "warning"}
                size="sm"
              >
                {ciudadResidencia?.activa ? "Activa" : "Inactiva"}
              </Badge>
            </div>

            {ciudadSeleccionada && (
              <div className="inline-flex items-center gap-1.5 text-xs pl-0 sm:pl-3 sm:border-l border-border-subtle">
                <Globe size={14} className="text-primary shrink-0" />
                <span className="font-medium text-text-muted">Consultando:</span>
                <span className="font-bold text-primary">
                  {ciudadSeleccionada.nombre}
                </span>
                {esVisitante && (
                  <Badge variant="info" size="sm">
                    Modo visitante
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {esVisitante && ciudadResidencia?.activa && ciudadResidencia?.id && (
              <Button
                variant="ghost"
                size="sm"
                loading={procesando}
                onClick={() => seleccionarCiudad(ciudadResidencia.id)}
              >
                Volver a mi residencia
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<MapPin size={14} />}
              onClick={() => setModalAbierto(true)}
            >
              Ciudades ({ciudadesInteres.length}/{maxCiudadesInteres})
            </Button>
          </div>
        </div>

        {/* Estado explicativo y opciones cuando la ciudad de residencia está inactiva */}
        {ciudadResidencia && !ciudadResidencia.activa && (
          <div
            role="region"
            aria-label="Estado de ciudad de residencia inactiva"
            className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/60 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <h2 className="text-sm font-bold text-text-primary">
                  Tu ciudad de residencia ({ciudadResidencia.nombre}
                  {ciudadResidencia.provincia ? `, ${ciudadResidencia.provincia}` : ""}) aún no está activa en ReportARG
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Mientras tu localidad no se encuentre activa, no es posible registrar nuevos reclamos ni adherirse a reportes vecinales. Podés solicitar la activación o reactivación de tu ciudad, o continuar como visitante consultando otra ciudad activa.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/70 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="flex-1 max-w-sm">
                <Select
                  id="select-ciudad-visitante"
                  label="Explorar otra ciudad activa como visitante"
                  value={ciudadVisitanteId}
                  onChange={setCiudadVisitanteId}
                  options={opcionesVisitante}
                  placeholder="Seleccioná una localidad activa..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!ciudadVisitanteId}
                  loading={procesando}
                  onClick={handleContinuarComoVisitante}
                >
                  Continuar como visitante
                </Button>
                <Button
                  href={solicitudActivacionUrl}
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight size={14} />}
                >
                  Solicitar activación de ciudad
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Aviso cuando alguna ciudad de interés guardada dejó de estar activa */}
        {ciudadesInteresInactivas.length > 0 && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-2.5 text-xs">
              <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-text-primary">
                  {ciudadesInteresInactivas.length === 1
                    ? `La ciudad de interés ${ciudadesInteresInactivas[0].nombre} dejó de estar activa`
                    : "Algunas de tus ciudades de interés dejaron de estar activas"}
                </p>
                <p className="text-text-secondary mt-0.5">
                  Se bloquearon las operaciones y consultas activas para{" "}
                  {ciudadesInteresInactivas.map((c) => c.nombre).join(", ")}. Podés quitarla de tu lista o gestionar tus ciudades.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalAbierto(true)}
              >
                Revisar mis ciudades
              </Button>
            </div>
          </div>
        )}

        {/* Aviso de modo visitante cuando explora una ciudad distinta a su residencia */}
        {esVisitante && ciudadSeleccionada && (
          <div className="p-3 rounded-2xl bg-primary-subtle/50 border border-primary/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-text-secondary">
              <Globe size={15} className="text-primary shrink-0" />
              <span>
                Estás consultando <strong className="text-text-primary">{ciudadSeleccionada.nombre}</strong> como visitante. Tu residencia sigue siendo{" "}
                <strong className="text-text-primary">{ciudadResidencia?.nombre || "tu localidad declarada"}</strong> y las operaciones de creación o adhesión de reclamos sólo están habilitadas en tu ciudad de residencia activa.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal de gestión de ciudad de residencia y ciudades adicionales de interés */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Mi ciudad de residencia y ciudades de interés"
        description="Cambiá la localidad que estás consultando o guardá hasta 3 ciudades adicionales de interés. El cambio de ciudad modifica únicamente el contexto de navegación, sin alterar tu residencia ni tus permisos."
        icon={<MapPin size={20} />}
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* 1. Ciudad de Residencia */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle/60 border border-border-subtle space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Ciudad de residencia (Fija)
              </span>
              <Badge variant={ciudadResidencia?.activa ? "success" : "warning"} size="sm">
                {ciudadResidencia?.activa ? "Activa" : "Inactiva"}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <p className="text-sm font-bold text-text-primary">
                  {ciudadResidencia?.nombre || "No registrada"}
                  {ciudadResidencia?.provincia ? `, ${ciudadResidencia.provincia}` : ""}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Determina tus permisos para crear reclamos y participar como vecino afectado.
                </p>
              </div>

              {ciudadResidencia?.activa && ciudadResidencia?.id ? (
                Number(ciudadSeleccionada?.id) === Number(ciudadResidencia.id) ? (
                  <Badge variant="primary" size="md">
                    Consultando actualmente
                  </Badge>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    loading={procesando}
                    onClick={() => seleccionarCiudad(ciudadResidencia.id)}
                  >
                    Cambiar a mi residencia
                  </Button>
                )
              ) : (
                <Button
                  href={solicitudActivacionUrl}
                  variant="outline"
                  size="sm"
                  onClick={() => setModalAbierto(false)}
                >
                  Solicitar activación
                </Button>
              )}
            </div>
          </div>

          {/* 2. Listado de Ciudades de Interés */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Ciudades adicionales de interés ({ciudadesInteres.length}/{maxCiudadesInteres})
              </h4>
              <span className="text-[11px] text-text-muted">
                Solo lectura / consulta
              </span>
            </div>

            {ciudadesInteres.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-border-subtle text-center text-xs text-text-muted">
                Todavía no guardaste ciudades adicionales de interés. Podés agregar hasta {maxCiudadesInteres} localidades activas para consultar su actividad.
              </div>
            ) : (
              <div className="space-y-2">
                {ciudadesInteres.map((ciudad) => {
                  const esSeleccionada =
                    ciudadSeleccionada && Number(ciudadSeleccionada.id) === Number(ciudad.id);

                  return (
                    <div
                      key={ciudad.id}
                      className={`p-3 rounded-2xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                        !ciudad.activa
                          ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50"
                          : esSeleccionada
                          ? "bg-primary-subtle/40 border-primary/40"
                          : "bg-surface border-border-subtle"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-text-primary">
                            {ciudad.nombre}, {ciudad.provincia}
                          </span>
                          <Badge
                            variant={ciudad.activa ? "success" : "danger"}
                            size="sm"
                          >
                            {ciudad.activa ? "Activa" : "Inactiva"}
                          </Badge>
                          {esSeleccionada && (
                            <Badge variant="primary" size="sm">
                              Consultando
                            </Badge>
                          )}
                        </div>
                        {!ciudad.activa && (
                          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                            {ciudad.aviso_inactiva || "Esta ciudad dejó de estar activa y sus operaciones fueron bloqueadas."}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {ciudad.activa && !esSeleccionada && (
                          <Button
                            variant="outline"
                            size="sm"
                            loading={procesando}
                            leftIcon={<CheckCircle2 size={13} />}
                            onClick={() => seleccionarCiudad(ciudad.id)}
                          >
                            Consultar
                          </Button>
                        )}
                        <Button
                          variant="danger-soft"
                          size="sm"
                          loading={procesando}
                          leftIcon={<Trash2 size={13} />}
                          onClick={() => eliminarCiudadInteres(ciudad.id)}
                          aria-label={`Eliminar ${ciudad.nombre} de mis ciudades de interés`}
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Formulario para agregar nueva ciudad de interés */}
          <div className="pt-3 border-t border-border-subtle space-y-2.5">
            <h4 className="text-xs font-bold text-text-primary">
              Agregar ciudad de interés
            </h4>

            {limiteAlcanzado ? (
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-secondary">
                Alcanzaste el máximo permitido de {maxCiudadesInteres} ciudades adicionales de interés. Eliminá una ciudad guardada si deseás agregar otra.
              </div>
            ) : opcionesParaAgregar.length === 0 ? (
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-muted">
                No hay otras ciudades activas disponibles para agregar en este momento.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-end gap-2.5">
                <div className="flex-1">
                  <Select
                    id="select-agregar-ciudad-interes"
                    label="Seleccioná una localidad activa"
                    value={nuevaCiudadId}
                    onChange={setNuevaCiudadId}
                    options={opcionesParaAgregar}
                    placeholder="Elegí una ciudad activa..."
                  />
                </div>
                <Button
                  variant="primary"
                  size="md"
                  disabled={!nuevaCiudadId || limiteAlcanzado}
                  loading={procesando}
                  leftIcon={<Plus size={14} />}
                  onClick={handleAgregarInteres}
                >
                  Agregar ciudad
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
