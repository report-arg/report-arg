"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Clock,
  XCircle,
  AlertTriangle,
  Building2,
  Edit3,
  UserPlus,
  LogOut,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  FileSpreadsheet,
  UserCheck,
} from "lucide-react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { formatearFecha } from "@/utils/dateFormatters";

const TIPOS_INSTITUCION = [
  { value: "municipio", label: "Municipio / Gobierno Local" },
  { value: "hospital", label: "Hospital / Centro de salud" },
  { value: "escuela", label: "Escuela / Institución educativa" },
  { value: "ong", label: "ONG / Fundación" },
  { value: "seguridad", label: "Fuerza de seguridad / Emergencias" },
  { value: "Cooperativa", label: "Cooperativa de Servicios Públicos" },
  { value: "otra", label: "Otra institución" },
];

function calcularDiasRestantes(fechaRechazo) {
  if (!fechaRechazo) return 7;
  const fechaMs = new Date(fechaRechazo).getTime();
  if (Number.isNaN(fechaMs)) return 7;
  const limiteMs = fechaMs + 7 * 24 * 60 * 60 * 1000;
  const diffDias = Math.ceil((limiteMs - Date.now()) / (24 * 60 * 60 * 1000));
  return Math.max(1, Math.min(7, diffDias));
}

export default function InstitucionEstadoSolicitudView({
  perfil,
  onPerfilActualizado,
}) {
  const router = useRouter();
  const { update } = useSession();

  const esRechazada =
    perfil?.institucion_status === "rejected" || Boolean(perfil?.motivo_rechazo);
  const diasRestantes = calcularDiasRestantes(perfil?.fecha_rechazo);

  // Modal 1: Corregir y reenviar solicitud institucional
  const [modalReenviar, setModalReenviar] = useState(false);
  const [formInstitucion, setFormInstitucion] = useState({
    nombre: perfil?.nombre || "",
    tipo: perfil?.tipo || "municipio",
    cuit: perfil?.cuit || "",
    nombre_contacto: perfil?.nombre_contacto || "",
    telefono: perfil?.telefono || "",
    direccion: perfil?.direccion || "",
    zona: perfil?.zona || "Centro",
    provincia: perfil?.provincia || "",
    ciudad: perfil?.ciudad || "",
  });
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [errorSolicitud, setErrorSolicitud] = useState("");

  // Modal 2: Convertir cuenta actual a ciudadano
  const [modalConvertir, setModalConvertir] = useState(false);
  const [formCiudadano, setFormCiudadano] = useState({
    nombre: "",
    apellido: "",
    provincia: perfil?.provincia || "",
    ciudad: perfil?.ciudad || "",
  });
  const [convirtiendo, setConvirtiendo] = useState(false);
  const [errorConvertir, setErrorConvertir] = useState("");

  const abrirModalReenviar = () => {
    setFormInstitucion({
      nombre: perfil?.nombre || "",
      tipo: perfil?.tipo || "municipio",
      cuit: perfil?.cuit || "",
      nombre_contacto: perfil?.nombre_contacto || "",
      telefono: perfil?.telefono || "",
      direccion: perfil?.direccion || "",
      zona: perfil?.zona || "Centro",
      provincia: perfil?.provincia || "",
      ciudad: perfil?.ciudad || "",
    });
    setErrorSolicitud("");
    setModalReenviar(true);
  };

  const handleReenviarSolicitud = async (e) => {
    e.preventDefault();
    if (!formInstitucion.nombre.trim()) {
      setErrorSolicitud("El nombre de la institución es obligatorio.");
      return;
    }
    setEnviandoSolicitud(true);
    setErrorSolicitud("");
    try {
      const res = await apiClient.put("/auth/me/institucion-solicitud", formInstitucion);
      if (res.data?.ok) {
        toast.success(
          res.data.mensaje ||
            "Solicitud institucional actualizada y reenviada para verificación."
        );
        setModalReenviar(false);
        const actualizado = res.data.data || res.data.user || {};
        if (actualizado.nombre) {
          await update({ name: actualizado.nombre });
        }
        onPerfilActualizado?.({
          ...perfil,
          ...actualizado,
          ciudad: actualizado.ciudad_nombre || actualizado.ciudad || perfil?.ciudad,
          institucion_status: "pending",
          motivo_rechazo: null,
          fecha_rechazo: null,
        });
      } else {
        setErrorSolicitud(
          res.data?.error || res.data?.mensaje || "No se pudo actualizar la solicitud."
        );
      }
    } catch (err) {
      setErrorSolicitud(
        err.response?.data?.error ||
          err.response?.data?.mensaje ||
          "Error al reenviar la solicitud institucional."
      );
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  const handleConvertirACiudadano = async (e) => {
    e.preventDefault();
    if (!formCiudadano.nombre.trim() || !formCiudadano.apellido.trim()) {
      setErrorConvertir("Ingresá tu nombre y apellido personal para crear tu perfil ciudadano.");
      return;
    }
    setConvirtiendo(true);
    setErrorConvertir("");
    try {
      const res = await apiClient.post("/auth/me/convertir-a-ciudadano", formCiudadano);
      if (res.data?.ok) {
        toast.success("Tu cuenta fue convertida a Ciudadano correctamente.");
        setModalConvertir(false);
        await update({
          role: "ciudadano",
          name:
            res.data.user?.nombre ||
            `${formCiudadano.nombre.trim()} ${formCiudadano.apellido.trim()}`,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        });
        router.push("/ciudadano");
        router.refresh();
      } else {
        setErrorConvertir(
          res.data?.error || res.data?.mensaje || "No se pudo convertir la cuenta."
        );
      }
    } catch (err) {
      setErrorConvertir(
        err.response?.data?.error ||
          err.response?.data?.mensaje ||
          "Error al convertir la cuenta a ciudadano."
      );
    } finally {
      setConvirtiendo(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Tarjeta principal de estado */}
      <div
        className={`rounded-2xl border p-6 sm:p-8 shadow-xs space-y-5 ${
          esRechazada
            ? "bg-surface border-rose-200 dark:border-rose-900/50"
            : "bg-surface border-amber-200 dark:border-amber-900/50"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                esRechazada
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
              }`}
            >
              {esRechazada ? <XCircle size={24} /> : <Clock size={24} />}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-text-primary m-0">
                  {esRechazada
                    ? "Solicitud institucional rechazada"
                    : "Pendiente de verificación"}
                </h1>
                <Badge variant={esRechazada ? "danger" : "warning"} size="sm">
                  {esRechazada ? "Rechazada" : "En revisión administrativa"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary m-0 leading-relaxed">
                {esRechazada
                  ? "La administración revisó los datos de tu solicitud institucional y encontró observaciones que impiden habilitar la cuenta operativa."
                  : "Tu solicitud institucional fue recibida y está siendo verificada por el equipo de administración de ReportARG. Hasta que sea aprobada, la cuenta no tiene permisos para gestionar reclamos ni emitir comunicados oficiales."}
              </p>
            </div>
          </div>
        </div>

        {/* Bloque de rechazo + Motivo + Alerta de cierre en 7 días */}
        {esRechazada && (
          <div className="space-y-3">
            {perfil?.motivo_rechazo && (
              <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-1">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block">
                  Motivo informado por la administración:
                </span>
                <p className="text-xs sm:text-sm text-rose-950 dark:text-rose-100 m-0 leading-relaxed font-medium">
                  “{perfil.motivo_rechazo}”
                </p>
                {perfil.fecha_rechazo && (
                  <span className="text-[11px] text-rose-600/80 dark:text-rose-300/80 block pt-1">
                    Fecha de revisión: {formatearFecha(perfil.fecha_rechazo)}
                  </span>
                )}
              </div>
            )}

            <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <AlertTriangle
                size={18}
                className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
              />
              <div className="text-xs text-amber-950 dark:text-amber-100 space-y-1">
                <p className="font-bold m-0">
                  Importante: esta cuenta se cerrará automáticamente en {diasRestantes}{" "}
                  {diasRestantes === 1 ? "día" : "días"}
                </p>
                <p className="m-0 leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                  Si cargaste algún dato institucional con error, podés corregirlo y volver a
                  enviar la solicitud para una nueva verificación. Si te registraste como
                  institución por error y sos un vecino, podés transformar esta misma cuenta en
                  una cuenta de Ciudadano sin perder tu correo electrónico.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resumen de los datos enviados en la solicitud */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Building2 size={14} className="text-primary" />
              Datos registrados en tu solicitud
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-surface border border-border-subtle">
              <span className="text-[10px] font-bold uppercase text-text-muted block">
                Institución / Tipo
              </span>
              <p className="font-semibold text-text-primary m-0 mt-0.5">
                {perfil?.nombre || "Sin nombre"} · {perfil?.tipo || "Institución"}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-surface border border-border-subtle">
              <span className="text-[10px] font-bold uppercase text-text-muted block">
                Ciudad / Jurisdicción
              </span>
              <p className="font-semibold text-text-primary m-0 mt-0.5 flex items-center gap-1">
                <MapPin size={12} className="text-text-muted shrink-0" />
                {perfil?.ciudad
                  ? `${perfil.ciudad}${perfil.provincia ? `, ${perfil.provincia}` : ""}`
                  : "No especificada"}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-surface border border-border-subtle">
              <span className="text-[10px] font-bold uppercase text-text-muted block">
                CUIT y Responsable
              </span>
              <p className="font-semibold text-text-primary m-0 mt-0.5 flex items-center gap-1.5">
                <FileSpreadsheet size={12} className="text-text-muted shrink-0" />
                <span>CUIT: {perfil?.cuit || "No informado"}</span>
                {perfil?.nombre_contacto && (
                  <span className="text-text-muted font-normal">
                    ({perfil.nombre_contacto})
                  </span>
                )}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-surface border border-border-subtle">
              <span className="text-[10px] font-bold uppercase text-text-muted block">
                Contacto Declarado
              </span>
              <p className="font-semibold text-text-primary m-0 mt-0.5 flex items-center gap-1.5 truncate">
                <Mail size={12} className="text-text-muted shrink-0" />
                <span className="truncate">{perfil?.email}</span>
                {perfil?.telefono && (
                  <>
                    <Phone size={11} className="text-text-muted shrink-0 ml-1" />
                    <span>{perfil.telefono}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones disponibles */}
        <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={abrirModalReenviar}
              leftIcon={<Edit3 size={14} />}
            >
              {esRechazada
                ? "Corregir datos y volver a solicitar como institución"
                : "Editar datos de la solicitud"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setErrorConvertir("");
                setModalConvertir(true);
              }}
              leftIcon={<UserPlus size={14} />}
            >
              Crear cuenta como Ciudadano (usar mi email)
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/register/citizen" })}
            leftIcon={<LogOut size={14} />}
          >
            Cerrar sesión / Usar otro correo
          </Button>
        </div>
      </div>

      {/* Modal 1: Corregir datos y reenviar solicitud institucional */}
      <Modal
        isOpen={modalReenviar}
        onClose={() => !enviandoSolicitud && setModalReenviar(false)}
        title="Corregir y reenviar solicitud institucional"
        description="Revisá y corregí los datos oficiales de la entidad. Al guardar, tu solicitud volverá al estado Pendiente de verificación para ser evaluada nuevamente por el administrador."
        icon={<Building2 size={20} />}
        maxWidth="lg"
      >
        <form onSubmit={handleReenviarSolicitud} className="space-y-4">
          {errorSolicitud && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold">
              {errorSolicitud}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nombre oficial de la institución"
              required
              value={formInstitucion.nombre}
              onChange={(e) =>
                setFormInstitucion((prev) => ({ ...prev, nombre: e.target.value }))
              }
              placeholder="Ej. Municipalidad de Viale"
            />

            <Select
              label="Tipo de organismo"
              value={formInstitucion.tipo}
              onChange={(val) =>
                setFormInstitucion((prev) => ({ ...prev, tipo: val }))
              }
              options={TIPOS_INSTITUCION}
            />

            <Input
              label="CUIT del organismo"
              value={formInstitucion.cuit}
              onChange={(e) =>
                setFormInstitucion((prev) => ({ ...prev, cuit: e.target.value }))
              }
              placeholder="Ej. 30-99999999-9"
            />

            <Input
              label="Nombre y apellido del responsable"
              value={formInstitucion.nombre_contacto}
              onChange={(e) =>
                setFormInstitucion((prev) => ({
                  ...prev,
                  nombre_contacto: e.target.value,
                }))
              }
              placeholder="Ej. Juan Pérez (Secretaría de Obras)"
            />

            <Input
              label="Teléfono oficial"
              value={formInstitucion.telefono}
              onChange={(e) =>
                setFormInstitucion((prev) => ({ ...prev, telefono: e.target.value }))
              }
              placeholder="Ej. 0343 492-0000"
            />

            <Input
              label="Dirección de sede"
              value={formInstitucion.direccion}
              onChange={(e) =>
                setFormInstitucion((prev) => ({ ...prev, direccion: e.target.value }))
              }
              placeholder="Ej. 9 de Julio 245"
            />

            <Input
              label="Zona / Barrio"
              value={formInstitucion.zona}
              onChange={(e) =>
                setFormInstitucion((prev) => ({ ...prev, zona: e.target.value }))
              }
              placeholder="Ej. Centro"
              containerClassName="sm:col-span-2"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalReenviar(false)}
              disabled={enviandoSolicitud}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={enviandoSolicitud}
              leftIcon={<CheckCircle2 size={14} />}
            >
              Guardar y reenviar a verificación
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Convertir la cuenta actual a Ciudadano */}
      <Modal
        isOpen={modalConvertir}
        onClose={() => !convirtiendo && setModalConvertir(false)}
        title="Convertir mi cuenta a Ciudadano"
        description={`Se conservará tu correo actual (${perfil?.email}) y se reemplazará la solicitud institucional por un perfil personal de vecino para reportar y seguir reclamos en tu ciudad.`}
        icon={<UserCheck size={20} />}
        maxWidth="md"
      >
        <form onSubmit={handleConvertirACiudadano} className="space-y-4">
          {errorConvertir && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold">
              {errorConvertir}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tu nombre personal"
              required
              value={formCiudadano.nombre}
              onChange={(e) =>
                setFormCiudadano((prev) => ({ ...prev, nombre: e.target.value }))
              }
              placeholder="Ej. María"
            />

            <Input
              label="Tu apellido"
              required
              value={formCiudadano.apellido}
              onChange={(e) =>
                setFormCiudadano((prev) => ({ ...prev, apellido: e.target.value }))
              }
              placeholder="Ej. González"
            />
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-secondary">
            Ciudad de residencia asociada:{" "}
            <strong className="text-text-primary">
              {perfil?.ciudad
                ? `${perfil.ciudad}${perfil.provincia ? `, ${perfil.provincia}` : ""}`
                : "Según tu localidad registrada"}
            </strong>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalConvertir(false)}
              disabled={convirtiendo}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={convirtiendo}
              leftIcon={<UserPlus size={14} />}
            >
              Confirmar y pasar a Ciudadano
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

