"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Save,
} from "lucide-react";
import apiClient from "@/services/apiClient";
import Button from "@/components/ui/Button";
import UsuarioPhotoUpload from "./UsuarioPhotoUpload";

const rolesOpciones = [
  { value: "ciudadano", label: "Ciudadano", desc: "Acceso comunitario regular (feed, mapas, reportes)" },
  { value: "institucion", label: "Institución", desc: "Gestión institucional y resolución de reclamos asignados" },
  { value: "admin", label: "Administrador", desc: "Acceso total de supervisión y gestión de plataforma" },
];

export default function UsuarioForm({ usuarioId = null }) {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = Number(session?.user?.id || 0);

  const isEdit = Boolean(usuarioId);
  const esMiCuenta = isEdit && Number(usuarioId) === currentUserId;

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "ciudadano",
    estado: "activo",
    foto: null,
  });

  const [originalRol, setOriginalRol] = useState("ciudadano");
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [apiError, setApiError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [uploadingFoto, setUploadingFoto] = useState(false);

  // Cargar usuario si estamos en modo edición
  useEffect(() => {
    if (!isEdit) return;

    let isMounted = true;
    async function cargarUsuario() {
      setLoadingData(true);
      setApiError("");
      try {
        const res = await apiClient.get(`/admin/usuarios/${usuarioId}`);
        if (res.data?.ok && isMounted) {
          const u = res.data.data;
          setForm({
            nombre: u.nombre || "",
            email: u.email || "",
            password: "",
            rol: (u.rol || "ciudadano").toLowerCase(),
            estado: u.estado || "activo",
            foto: u.foto || null,
          });
          setOriginalRol((u.rol || "ciudadano").toLowerCase());
          if (u.foto) setPreview(u.foto);
        } else if (isMounted) {
          setApiError(res.data?.mensaje || "No se encontraron los datos del usuario.");
        }
      } catch (err) {
        if (isMounted) {
          setApiError(err.response?.data?.mensaje || "Error al cargar los datos del usuario.");
        }
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }

    cargarUsuario();
    return () => {
      isMounted = false;
    };
  }, [usuarioId, isEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
    setInfoMessage("");
  }

  function validate() {
    const errs = {};
    if (!form.nombre.trim()) {
      errs.nombre = "El nombre es obligatorio.";
    }
    if (!form.email.trim()) {
      errs.email = "El correo electrónico es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Ingresá un formato de email válido.";
    }

    if (!isEdit) {
      if (!form.password) {
        errs.password = "La contraseña es obligatoria para nuevos usuarios.";
      } else if (form.password.length < 6) {
        errs.password = "La contraseña debe tener al menos 6 caracteres.";
      }
    }

    return errs;
  }

  async function handleFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const urlPreview = URL.createObjectURL(file);
    setPreview(urlPreview);

    setUploadingFoto(true);
    setApiError("");
    setInfoMessage("");

    try {
      const formData = new FormData();
      formData.append("foto", file);

      const res = await apiClient.post(`/admin/upload/foto`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.ok && res.data.url) {
        setForm((prev) => ({ ...prev, foto: res.data.url }));
        setInfoMessage("Foto cargada correctamente. Guardá el formulario para confirmar los cambios.");
      } else {
        setApiError(res.data?.mensaje || "No se pudo subir la foto de perfil.");
      }
    } catch (err) {
      setApiError(err.response?.data?.mensaje || "Error de conexión al subir la imagen.");
    } finally {
      setUploadingFoto(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError("");
    setInfoMessage("");

    try {
      const payload = {
        nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(),
        rol: form.rol,
        estado: form.estado,
        foto: form.foto,
      };

      if (!isEdit) {
        payload.password = form.password;
      }

      const res = isEdit
        ? await apiClient.put(`/admin/usuarios/${usuarioId}`, payload)
        : await apiClient.post(`/admin/usuarios`, payload);

      if (res.data?.ok) {
        router.push("/admin/users");
      } else {
        setApiError(res.data?.mensaje || "No se pudo guardar el usuario.");
      }
    } catch (err) {
      setApiError(
        err.response?.data?.mensaje ||
          "Ocurrió un error al procesar la solicitud en el servidor."
      );
    } finally {
      setLoading(false);
    }
  }

  const esInstitucion = isEdit && originalRol === "institucion";

  if (loadingData) {
    return (
      <div className="p-8 rounded-2xl bg-surface border border-border-subtle shadow-xs text-center flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-primary" />
        <span className="text-xs text-text-muted">Cargando datos del usuario...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Alertas informativas y de error */}
      {apiError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {infoMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Tarjeta del Formulario */}
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-2xl bg-surface border border-border-subtle shadow-xs space-y-6"
      >
        {/* Cabecera visual del formulario con avatar */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-border-subtle">
          <UsuarioPhotoUpload
            preview={preview}
            uploading={uploadingFoto}
            onFileSelect={handleFoto}
          />

          <div className="text-center sm:text-left min-w-0">
            <h2 className="text-base font-bold text-text-primary m-0">
              {isEdit ? "Editar Información del Usuario" : "Registro de Nuevo Usuario"}
            </h2>
            <p className="text-xs text-text-secondary m-0 mt-0.5">
              {isEdit
                ? "Modificá los datos personales, rol o estado operativo de la cuenta."
                : "Completá los campos requeridos para dar de alta la cuenta en ReportARG."}
            </p>
          </div>
        </div>

        {/* Campos principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nombre Completo */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Nombre Completo / Denominación <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Laura Gómez o Municipalidad de Viale"
              className={`w-full text-xs py-2.5 px-3.5 rounded-xl bg-surface-subtle border ${
                errors.nombre ? "border-rose-500" : "border-border-subtle"
              } focus:bg-surface focus:border-primary text-text-primary placeholder:text-text-muted outline-hidden transition-all`}
            />
            {errors.nombre && <p className="text-[11px] text-rose-500 m-0">{errors.nombre}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Correo Electrónico <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="usuario@reportarg.gob.ar"
              className={`w-full text-xs py-2.5 px-3.5 rounded-xl bg-surface-subtle border ${
                errors.email ? "border-rose-500" : "border-border-subtle"
              } focus:bg-surface focus:border-primary text-text-primary placeholder:text-text-muted outline-hidden transition-all`}
            />
            {errors.email && <p className="text-[11px] text-rose-500 m-0">{errors.email}</p>}
          </div>

          {/* Contraseña (solo al crear) */}
          {!isEdit && (
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Contraseña Inicial <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className={`w-full text-xs py-2.5 px-3.5 rounded-xl bg-surface-subtle border ${
                  errors.password ? "border-rose-500" : "border-border-subtle"
                } focus:bg-surface focus:border-primary text-text-primary placeholder:text-text-muted outline-hidden transition-all`}
              />
              {errors.password && <p className="text-[11px] text-rose-500 m-0">{errors.password}</p>}
            </div>
          )}

          {/* Rol del Usuario */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Rol de Acceso <span className="text-rose-500">*</span>
            </label>
            <select
              name="rol"
              value={form.rol}
              onChange={handleChange}
              disabled={esMiCuenta || esInstitucion}
              className={`w-full text-xs py-2.5 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle focus:bg-surface focus:border-primary text-text-primary outline-hidden transition-all ${
                esMiCuenta || esInstitucion ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {(isEdit
                ? rolesOpciones
                : rolesOpciones.filter((r) => r.value !== "institucion")
              ).map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {esMiCuenta && (
              <p className="text-[10px] text-text-muted m-0">
                No podés modificar el rol de tu propia cuenta administradora.
              </p>
            )}
            {esInstitucion && (
              <p className="text-[10px] text-text-muted m-0">
                Las cuentas institucionales no admiten cambio de rol directo para preservar la
                trazabilidad de los reclamos asignados.
              </p>
            )}
            {!isEdit && (
              <p className="text-[10px] text-text-muted m-0 leading-relaxed">
                El alta de instituciones se realiza mediante el{" "}
                <a
                  href="/register/institution"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  registro institucional
                </a>{" "}
                o la gestión de{" "}
                <a
                  href="/admin/solicitudes"
                  className="text-primary hover:underline font-semibold"
                >
                  solicitudes
                </a>{" "}
                para asegurar su asignación territorial y datos requeridos.
              </p>
            )}
          </div>

          {/* Estado Operativo */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Estado de la Cuenta <span className="text-rose-500">*</span>
            </label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              disabled={esMiCuenta}
              className={`w-full text-xs py-2.5 px-3.5 rounded-xl bg-surface-subtle border border-border-subtle focus:bg-surface focus:border-primary text-text-primary outline-hidden transition-all ${
                esMiCuenta ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <option value="activo">Activo (Habilitado)</option>
              <option value="inactivo">Inactivo (Deshabilitado)</option>
            </select>
            {esMiCuenta && (
              <p className="text-[10px] text-text-muted m-0">
                No podés inhabilitar tu propia cuenta administradora.
              </p>
            )}
          </div>
        </div>

        {/* Acciones de Guardar / Cancelar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/users")}
            disabled={loading || uploadingFoto}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={loading || uploadingFoto}
            leftIcon={
              loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )
            }
          >
            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </div>
      </form>
    </div>
  );
}
