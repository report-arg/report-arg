"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  UserPlus,
  Shield,
  MapPin,
} from "lucide-react";
import apiClient from "@/services/apiClient";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import UsuarioPhotoUpload from "./UsuarioPhotoUpload";

const OPCIONES_ROL = [
  { value: "ciudadano", label: "Ciudadano (Acceso comunitario regular)" },
  { value: "admin", label: "Administrador (Acceso total a la plataforma)" },
];

const OPCIONES_ESTADO = [
  { value: "activo", label: "Activo (Habilitado)" },
  { value: "inactivo", label: "Inactivo (Deshabilitado)" },
];

export default function UsuarioForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "ciudadano",
    id_ciudad: "",
    estado: "activo",
    foto: null,
  });

  const [ciudades, setCiudades] = useState([]);
  const [loadingCiudades, setLoadingCiudades] = useState(true);

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [uploadingFoto, setUploadingFoto] = useState(false);

  // Cargar catálogo de ciudades activas
  useEffect(() => {
    let isMounted = true;
    async function cargarCiudades() {
      try {
        const res = await apiClient.get("/ciudades");
        if (res.data?.ok && isMounted) {
          const lista = Array.isArray(res.data.data) ? res.data.data : [];
          setCiudades(lista);
          // Si hay ciudades y el usuario no seleccionó, predeterminar la primera
          if (lista.length > 0 && !form.id_ciudad) {
            setForm((prev) => ({ ...prev, id_ciudad: String(lista[0].id || lista[0].id_ciudad) }));
          }
        }
      } catch (err) {
        console.error("Error al cargar localidades para alta de usuario:", err);
      } finally {
        if (isMounted) setLoadingCiudades(false);
      }
    }

    cargarCiudades();
    return () => {
      isMounted = false;
    };
  }, []);

  function handleInputChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setApiError("");
    setInfoMessage("");
  }

  function validate() {
    const errs = {};
    if (!form.nombre.trim()) {
      errs.nombre = "El nombre completo es obligatorio.";
    } else if (form.nombre.trim().length < 2) {
      errs.nombre = "El nombre debe tener al menos 2 caracteres.";
    }

    if (!form.email.trim()) {
      errs.email = "El correo electrónico es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Ingresá un formato de correo electrónico válido.";
    }

    if (!form.password) {
      errs.password = "La contraseña es obligatoria para nuevos usuarios.";
    } else if (form.password.length < 6) {
      errs.password = "La contraseña debe tener al menos 6 caracteres.";
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
        setInfoMessage("Foto cargada correctamente. Al crear el usuario se confirmará la asignación.");
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
        password: form.password,
        rol: form.rol,
        estado: form.estado,
        foto: form.foto,
        id_ciudad: form.id_ciudad ? parseInt(form.id_ciudad, 10) : null,
      };

      const res = await apiClient.post(`/admin/usuarios`, payload);

      if (res.data?.ok) {
        router.push("/admin/users");
      } else {
        setApiError(res.data?.mensaje || "No se pudo registrar el usuario.");
      }
    } catch (err) {
      setApiError(
        err.response?.data?.mensaje ||
          "Ocurrió un error al procesar el alta de usuario en el servidor."
      );
    } finally {
      setLoading(false);
    }
  }

  const opcionesCiudades = [
    { value: "", label: "Sin ciudad predeterminada (Asignar luego)" },
    ...ciudades.map((c) => ({
      value: String(c.id || c.id_ciudad),
      label: c.provincia ? `${c.nombre} (${c.provincia})` : c.nombre,
    })),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Alertas informativas y de error */}
      {apiError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertTriangle size={16} className="shrink-0 text-rose-600" />
          <span>{apiError}</span>
        </div>
      )}

      {infoMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Formulario */}
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
              Alta de Nuevo Usuario
            </h2>
            <p className="text-xs text-text-secondary m-0 mt-0.5">
              Completá los datos para registrar un nuevo ciudadano o administrador y vincular su localidad de origen.
            </p>
          </div>
        </div>

        {/* Campos principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nombre Completo */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Nombre Completo <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              placeholder="Ej: Laura Gómez"
              error={errors.nombre}
              className="text-xs"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Correo Electrónico <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="usuario@ejemplo.com"
              error={errors.email}
              className="text-xs"
            />
          </div>

          {/* Contraseña Inicial */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Contraseña Inicial <span className="text-rose-500">*</span>
            </label>
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Mínimo 6 caracteres"
              error={errors.password}
              className="text-xs"
            />
          </div>

          {/* Rol del Usuario */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Rol de Acceso <span className="text-rose-500">*</span>
            </label>
            <Select
              value={form.rol}
              onChange={(val) => handleInputChange("rol", val)}
              options={OPCIONES_ROL}
            />
            <p className="text-[10px] text-text-muted m-0 leading-relaxed pt-1">
              El alta de cuentas institucionales se canaliza mediante el padrón formal para asegurar su asignación territorial y datos fiscales.
            </p>
          </div>

          {/* Ciudad / Localidad de Origen */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Localidad de Residencia
            </label>
            <Select
              value={form.id_ciudad}
              onChange={(val) => handleInputChange("id_ciudad", val)}
              options={opcionesCiudades}
              disabled={loadingCiudades}
              placeholder={loadingCiudades ? "Cargando localidades..." : "Seleccionar localidad"}
            />
            <p className="text-[10px] text-text-muted m-0 leading-relaxed pt-1">
              Vincula la comunidad local del usuario para su experiencia ciudadana.
            </p>
          </div>

          {/* Estado Inicial */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Estado Inicial de la Cuenta <span className="text-rose-500">*</span>
            </label>
            <Select
              value={form.estado}
              onChange={(val) => handleInputChange("estado", val)}
              options={OPCIONES_ESTADO}
            />
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
                <UserPlus size={15} />
              )
            }
          >
            {loading ? "Creando usuario..." : "Crear usuario"}
          </Button>
        </div>
      </form>
    </div>
  );
}
