"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const rolesOpciones   = ["ADMIN", "MODERADOR", "CIUDADANO"];
const estadosOpciones = ["ACTIVO", "INACTIVO"];

export default function UserForm({ usuario = null }) {
  const router  = useRouter();
  const isEdit  = !!usuario;
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    nombre:  usuario?.nombre  || "",
    email:   usuario?.email   || "",
    rol:     usuario?.rol     || "CIUDADANO",
    estado:  usuario?.estado  || "ACTIVO",
    foto:    usuario?.foto    || null,
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(usuario?.foto || null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  }

  function handleFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setForm(prev => ({ ...prev, foto: url }));
  }

  function validate() {
    const errs = {};
    if (!form.nombre.trim())  errs.nombre = "El nombre es obligatorio.";
    if (!form.email.trim())   errs.email  = "El email es obligatorio.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "El email no es válido.";
    return errs;
  }

  function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    // Acá iría el llamado a la API
    console.log(isEdit ? "Editando:" : "Creando:", form);
    router.push("/admin/users");
  }

  const inputStyle = {
    width: "100%", padding: "9px 12px", fontSize: 13,
    border: "1px solid var(--color-border)", borderRadius: 8,
    background: "#fff", color: "#333", boxSizing: "border-box",
    marginTop: 6,
  };

  const labelStyle = {
    fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1,
  };

  const errorStyle = { fontSize: 12, color: "var(--color-danger)", marginTop: 4 };

  return (
    <div className="card" style={{ padding: 28, maxWidth: 600 }}>

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
            style={{
              padding: "6px 14px", border: "1px solid var(--color-border)",
              borderRadius: 8, background: "#fff", fontSize: 12, cursor: "pointer",
            }}
          >
            {preview ? "Cambiar foto" : "Seleccionar imagen"}
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

      {/* Rol y Estado */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div>
          <label style={labelStyle}>ROL</label>
          <select name="rol" value={form.rol} onChange={handleChange} style={inputStyle}>
            {rolesOpciones.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>ESTADO</label>
          <select name="estado" value={form.estado} onChange={handleChange} style={inputStyle}>
            {estadosOpciones.map(e => <option key={e} value={e}>{e}</option>)}
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
          style={{
            padding: "10px 22px", background: "var(--color-primary)",
            color: "#fff", border: "none", borderRadius: 8,
            fontSize: 13, fontWeight: "bold", cursor: "pointer",
          }}
        >{isEdit ? "Guardar cambios" : "Crear usuario"}</button>
      </div>

    </div>
  );
}