"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const rolesOpciones   = ["ciudadano", "admin", "institucion"];
const estadosOpciones = ["activo", "inactivo"];

export default function UserForm({ usuarioId = null }) {
  const router  = useRouter();
  const isEdit  = !!usuarioId;
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    nombre:   "",
    email:    "",
    password: "",
    rol:      "ciudadano",
    estado:   "activo",
    foto:     null,
  });
  const [errors, setErrors]   = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [apiError, setApiError] = useState("");
  const [uploadingFoto, setUploadingFoto] = useState(false);

  // Si es edición cargamos los datos del usuario
  useEffect(() => {
    if (!isEdit) return;
    async function cargarUsuario() {
      try {
        const res  = await fetch(`${API_URL}/api/admin/usuarios/${usuarioId}`);
        const data = await res.json();
        if (data.ok) {
          setForm(prev => ({
            ...prev,
            nombre: data.data.nombre || "",
            email:  data.data.email  || "",
            rol:    data.data.rol    || "ciudadano",
            estado: data.data.estado || "activo",
            foto:   data.data.foto   || null,
          }));
          if (data.data.foto) setPreview(data.data.foto);
        }
      } catch (err) {
        setApiError('Error al cargar datos del usuario');
      } finally {
        setLoadingData(false);
      }
    }
    cargarUsuario();
  }, [usuarioId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
    setApiError("");
  }

  async function handleFoto(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Preview inmediato
  const url = URL.createObjectURL(file);
  setPreview(url);

  // Subir a Cloudinary
  setUploadingFoto(true);
  try {
    const formData = new FormData();
    formData.append('foto', file);

    const res  = await fetch(`${API_URL}/api/admin/upload/foto`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();

    if (data.ok) {
      setForm(prev => ({ ...prev, foto: data.url }));
    } else {
      setApiError('Error al subir la imagen');
    }
  } catch (err) {
    setApiError('Error al subir la imagen');
  } finally {
    setUploadingFoto(false);
  }
}

  function validate() {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!form.email.trim())  errs.email  = "El email es obligatorio.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "El email no es válido.";
    if (!isEdit && !form.password) errs.password = "La contraseña es obligatoria.";
    if (!isEdit && form.password && form.password.length < 6)
      errs.password = "Mínimo 6 caracteres.";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");

    try {
      const url    = isEdit
        ? `${API_URL}/api/admin/usuarios/${usuarioId}`
        : `${API_URL}/api/admin/usuarios`;
      const method = isEdit ? 'PUT' : 'POST';

      const body = {
        email:  form.email,
        nombre: form.nombre,
        rol:    form.rol,
        estado: form.estado,
        foto:   form.foto
      };
      if (!isEdit) {
        body.password = form.password;
      }

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.ok) {
        setApiError(data.mensaje);
        return;
      }

      router.push('/admin/users');
    } catch (err) {
      setApiError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", padding: "9px 12px", fontSize: 13,
    border: "1px solid var(--color-border)", borderRadius: 8,
    background: "#fff", color: "#333", boxSizing: "border-box", marginTop: 6,
  };
  const labelStyle = { fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 };
  const errorStyle = { fontSize: 12, color: "var(--color-danger)", marginTop: 4 };

  if (loadingData) {
    return <p style={{ color: "#aaa", fontSize: 14 }}>Cargando datos del usuario...</p>;
  }

  return (
    <div className="card" style={{ padding: 28, maxWidth: 600 }}>

      {/* Error general API */}
      {apiError && (
        <div style={{
          background: "#FEE2E2", border: "1px solid #FCA5A5",
          borderRadius: 8, padding: "10px 14px", marginBottom: 16,
          fontSize: 13, color: "#991B1B",
        }}>
          {apiError}
        </div>
      )}

      {/* Foto de perfil */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <div
          onClick={() => fileRef.current.click()}
          style={{
            width: 72, height: 72, borderRadius: "50%", cursor: "pointer",
            background: preview ? "transparent" : "#e8eaf6",
            border: "2px dashed var(--color-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", flexShrink: 0,
          }}
        >
          {preview
            ? <img src={preview} alt="foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 11, color: "#aaa", textAlign: "center", padding: 4 }}>Subir foto</span>
          }
        </div>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "#333", fontWeight: 600 }}>Foto de perfil</p>
          <button
            onClick={() => fileRef.current.click()}
            disabled={uploadingFoto}
            style={{
              padding: "6px 14px", border: "1px solid var(--color-border)",
              borderRadius: 8, background: "#fff", fontSize: 12,
              cursor: uploadingFoto ? "not-allowed" : "pointer",
              opacity: uploadingFoto ? 0.7 : 1,
            }}
          >
          {uploadingFoto ? "Subiendo..." : preview ? "Cambiar foto" : "Seleccionar imagen"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFoto} />
        </div>
      </div>

      {/* Nombre */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>NOMBRE COMPLETO</label>
        <input
          name="nombre" value={form.nombre} onChange={handleChange}
          placeholder="Ej: Mateo Sánchez"
          style={{ ...inputStyle, borderColor: errors.nombre ? "var(--color-danger)" : "" }}
        />
        {errors.nombre && <p style={errorStyle}>{errors.nombre}</p>}
      </div>

      {/* Email */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>EMAIL</label>
        <input
          name="email" value={form.email} onChange={handleChange}
          placeholder="Ej: usuario@reportarg.gob.ar"
          style={{ ...inputStyle, borderColor: errors.email ? "var(--color-danger)" : "" }}
        />
        {errors.email && <p style={errorStyle}>{errors.email}</p>}
      </div>

      {/* Password — solo al crear */}
      {!isEdit && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>CONTRASEÑA</label>
          <input
            name="password" type="password" value={form.password} onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            style={{ ...inputStyle, borderColor: errors.password ? "var(--color-danger)" : "" }}
          />
          {errors.password && <p style={errorStyle}>{errors.password}</p>}
        </div>
      )}

      {/* Rol y Estado */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div>
          <label style={labelStyle}>ROL</label>
          <select name="rol" value={form.rol} onChange={handleChange} style={inputStyle}>
            {rolesOpciones.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>ESTADO</label>
          <select name="estado" value={form.estado} onChange={handleChange} style={inputStyle}>
            {estadosOpciones.map(e => <option key={e} value={e}>{e.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {/* Botones */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button
          onClick={() => router.push("/admin/users")}
          style={{
            padding: "10px 22px", border: "1px solid var(--color-border)",
            borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", color: "#555",
          }}
        >Cancelar</button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "10px 22px", background: loading ? "#ccc" : "var(--color-primary)",
            color: "#fff", border: "none", borderRadius: 8,
            fontSize: 13, fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear usuario"}
        </button>
      </div>

    </div>
  );
}