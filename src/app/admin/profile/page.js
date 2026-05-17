"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Camera, User, Mail, MapPin, Lock, LogOut, Save, X, Eye, EyeOff } from "lucide-react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import Breadcrumb from "@/components/admin/Breadcrumb";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const rolLabel = { admin: "Administrador", ciudadano: "Ciudadano", institucion: "Institución" };

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router   = useRouter();
  const fileRef  = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [perfil,   setPerfil]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [preview,  setPreview]  = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form,     setForm]     = useState({ nombre: "", apellido: "", email: "", provincia: "", ciudad: "", zona: "", foto: null });
  const [msg,      setMsg]      = useState({ type: "", text: "" });

  // Modal cambiar contraseña
  const [pwdModal,  setPwdModal]  = useState(false);
  const [pwd,       setPwd]       = useState({ actual: "", nueva: "", confirmar: "" });
  const [pwdVis,    setPwdVis]    = useState({ actual: false, nueva: false, confirmar: false });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg,    setPwdMsg]    = useState({ type: "", text: "" });

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) { router.push("/login"); return; }

    fetch(`${API_URL}/api/admin/usuarios/${session.user.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          const u = d.data;
          setPerfil(u);
          setPreview(u.foto || null);
          setForm({
            nombre:    u.nombre_ciudadano || u.nombre?.split(" ")[0] || "",
            apellido:  u.apellido || u.nombre?.split(" ").slice(1).join(" ") || "",
            email:     u.email || "",
            provincia: u.provincia || "",
            ciudad:    u.ciudad || "",
            zona:      u.zona || "",
            foto:      u.foto || null,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, status]);

  async function handleFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setMsg({ type: "", text: "" });
    try {
      const fd = new FormData();
      fd.append("foto", file);
      const res  = await fetch(`${API_URL}/api/admin/upload/foto`, { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.ok) {
        setForm(prev => ({ ...prev, foto: data.url }));
      } else {
        setMsg({ type: "error", text: data.mensaje || "Error al subir la imagen" });
      }
    } catch {
      setMsg({ type: "error", text: "Error de conexión al subir imagen" });
    } finally {
      setUploading(false);
    }
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const res  = await fetch(`${API_URL}/api/admin/usuarios/${session.user.id}/perfil`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg({ type: "ok", text: "Perfil actualizado correctamente" });
        setPerfil(prev => ({
          ...prev,
          nombre: `${form.nombre} ${form.apellido}`.trim(),
          email: form.email,
          foto: form.foto,
        }));
      } else {
        setMsg({ type: "error", text: data.mensaje || "Error al guardar" });
      }
    } catch {
      setMsg({ type: "error", text: "Error de conexión" });
    } finally {
      setSaving(false);
    }
  }

  function handleCancelar() {
    if (!perfil) return;
    setForm({
      nombre:    perfil.nombre_ciudadano || perfil.nombre?.split(" ")[0] || "",
      apellido:  perfil.apellido || perfil.nombre?.split(" ").slice(1).join(" ") || "",
      email:     perfil.email || "",
      provincia: perfil.provincia || "",
      ciudad:    perfil.ciudad || "",
      zona:      perfil.zona || "",
      foto:      perfil.foto || null,
    });
    setPreview(perfil.foto || null);
    setMsg({ type: "", text: "" });
  }

  async function handleCambiarPassword(e) {
    e.preventDefault();
    setPwdMsg({ type: "", text: "" });
    if (pwd.nueva !== pwd.confirmar)
      return setPwdMsg({ type: "error", text: "Las contraseñas no coinciden" });
    if (pwd.nueva.length < 8)
      return setPwdMsg({ type: "error", text: "La nueva contraseña debe tener al menos 8 caracteres" });

    setPwdSaving(true);
    try {
      const res  = await fetch(`${API_URL}/api/admin/usuarios/${session.user.id}/cambiar-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordActual: pwd.actual, passwordNueva: pwd.nueva }),
      });
      const data = await res.json();
      if (data.ok) {
        setPwdMsg({ type: "ok", text: "Contraseña actualizada correctamente" });
        setPwd({ actual: "", nueva: "", confirmar: "" });
        setTimeout(() => { setPwdModal(false); setPwdMsg({ type: "", text: "" }); }, 1500);
      } else {
        setPwdMsg({ type: "error", text: data.mensaje });
      }
    } catch {
      setPwdMsg({ type: "error", text: "Error de conexión" });
    } finally {
      setPwdSaving(false);
    }
  }

  const iniciales = (`${form.nombre} ${form.apellido}`.trim() || "?")
    .split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const idFormateado = perfil ? `ARG-${String(perfil.id).padStart(5, "0")}` : "—";

  if (loading) {
    return (
      <div className="admin-layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="admin-content">
          <Navbar section="Mi Perfil" onMenuClick={() => setSidebarOpen(true)} />
          <main className="admin-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "var(--color-muted)" }}>Cargando perfil...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Mi Perfil" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">

          {/* Encabezado */}
          <div style={{ marginBottom: 24 }}>
            <Breadcrumb items={[{ label: "ADMIN PANEL", href: "/admin" }, { label: "MI PERFIL" }]} />
            <h1 style={{ margin: "6px 0 4px", fontSize: 26, fontWeight: "bold", color: "var(--color-primary)" }}>
              Configuración de Cuenta
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
              Administrá tu información personal y mantené actualizada la seguridad de tu cuenta institucional de REPORTARG.
            </p>
          </div>

          {/* Tarjeta principal */}
          <div className="card" style={{ padding: 32, marginBottom: 20 }}>
            <form onSubmit={handleGuardar}>
              <div className="profile-main-row">

                {/* Columna izquierda — avatar + info */}
                <div className="profile-avatar-col">
                  {/* Avatar con botón de edición */}
                  <div style={{ position: "relative" }}>
                    {preview ? (
                      <img src={preview} alt="avatar"
                        style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover",
                          border: "3px solid var(--color-primary-border)" }} />
                    ) : (
                      <div style={{ width: 110, height: 110, borderRadius: "50%",
                        background: "var(--color-primary)", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 36, fontWeight: "bold" }}>
                        {iniciales}
                      </div>
                    )}
                    <button type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      style={{ position: "absolute", bottom: 4, right: 4,
                        width: 30, height: 30, borderRadius: "50%",
                        background: "var(--color-primary)", border: "2px solid #fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
                      <Camera size={14} color="#fff" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*"
                      style={{ display: "none" }} onChange={handleFoto} />
                  </div>
                  {uploading && <p style={{ margin: 0, fontSize: 11, color: "var(--color-muted)" }}>Subiendo...</p>}

                  {/* Nombre e ID */}
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "var(--color-primary)" }}>
                      {`${form.nombre} ${form.apellido}`.trim() || "—"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-muted)" }}>{idFormateado}</p>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: 20, marginTop: 4 }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 18, color: "var(--color-primary)" }}>
                        {perfil?.reportes ?? 0}
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: "var(--color-muted)", letterSpacing: 0.5 }}>REPORTES</p>
                    </div>
                  </div>
                </div>

                {/* Columna derecha — formulario */}
                <div className="profile-form-col">
                  <div className="profile-form-grid">
                    <FormField label="NOMBRE" icon={<User size={14} />}
                      value={form.nombre} onChange={v => setForm(p => ({ ...p, nombre: v }))} />
                    <FormField label="APELLIDO" icon={<User size={14} />}
                      value={form.apellido} onChange={v => setForm(p => ({ ...p, apellido: v }))} />
                    <FormField label="EMAIL" icon={<Mail size={14} />} type="email"
                      value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} />
                    <FormField label="PROVINCIA" icon={<MapPin size={14} />}
                      value={form.provincia} onChange={v => setForm(p => ({ ...p, provincia: v }))} />
                    <FormField label="CIUDAD" icon={<MapPin size={14} />}
                      value={form.ciudad} onChange={v => setForm(p => ({ ...p, ciudad: v }))} />
                    <FormField label="ZONA / BARRIO" icon={<MapPin size={14} />}
                      value={form.zona} onChange={v => setForm(p => ({ ...p, zona: v }))} />
                  </div>
                </div>
              </div>

              {/* Mensaje feedback */}
              {msg.text && (
                <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 8, fontSize: 13,
                  background: msg.type === "ok" ? "#e6f4ea" : "#fee2e2",
                  color: msg.type === "ok" ? "#1A7A3C" : "var(--color-danger)",
                  border: `1px solid ${msg.type === "ok" ? "#bbf7d0" : "#fecaca"}` }}>
                  {msg.text}
                </div>
              )}

              {/* Botones */}
              <div className="profile-form-actions">
                <button type="button" onClick={handleCancelar}
                  style={{ padding: "9px 22px", borderRadius: 8, border: "1px solid var(--color-border)",
                    background: "#fff", fontSize: 13, cursor: "pointer", color: "var(--color-text)" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: "9px 22px", borderRadius: 8, border: "none",
                    background: saving ? "#aaa" : "var(--color-primary)", color: "#fff",
                    fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 6 }}>
                  <Save size={14} />
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>

          {/* Fila inferior: Seguridad + Sesión */}
          <div className="profile-cards-row">

            {/* Seguridad de Acceso */}
            <div className="card profile-action-card" style={{ padding: "20px 24px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f0f4ff",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Lock size={18} style={{ color: "var(--color-primary)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14, color: "#333" }}>Seguridad de Acceso</p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-muted)" }}>Cambiá tu contraseña periódicamente.</p>
              </div>
              <button onClick={() => { setPwdModal(true); setPwdMsg({ type: "", text: "" }); }}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--color-primary)",
                  background: "#fff", color: "var(--color-primary)", fontSize: 12,
                  fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: 0.3 }}>
                CAMBIAR CONTRASEÑA
              </button>
            </div>

            {/* Sesión de Usuario */}
            <div className="card profile-action-card" style={{ padding: "20px 24px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff5f5",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <LogOut size={18} style={{ color: "var(--color-danger)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14, color: "#333" }}>Sesión de Usuario</p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-muted)" }}>Desconectá este dispositivo.</p>
              </div>
              <button onClick={() => signOut({ callbackUrl: "/login" })}
                style={{ padding: "8px 14px", borderRadius: 8, border: "none",
                  background: "var(--color-danger)", color: "#fff", fontSize: 12,
                  fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: 0.3 }}>
                CERRAR SESIÓN
              </button>
            </div>
          </div>

        </main>
      </div>

      {/* Modal cambiar contraseña */}
      {pwdModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: "100%", maxWidth: 420, padding: 28, margin: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#333" }}>Cambiar Contraseña</h3>
              <button onClick={() => setPwdModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCambiarPassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { key: "actual",    label: "Contraseña actual" },
                { key: "nueva",     label: "Nueva contraseña" },
                { key: "confirmar", label: "Confirmar nueva contraseña" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label style={{ fontSize: 11, color: "var(--color-label)", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>
                    {label.toUpperCase()}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={pwdVis[key] ? "text" : "password"}
                      value={pwd[key]}
                      onChange={e => setPwd(p => ({ ...p, [key]: e.target.value }))}
                      style={{ width: "100%", padding: "9px 36px 9px 12px", borderRadius: 8,
                        border: "1px solid var(--color-border)", fontSize: 13, boxSizing: "border-box",
                        outline: "none" }}
                    />
                    <button type="button"
                      onClick={() => setPwdVis(p => ({ ...p, [key]: !p[key] }))}
                      style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)" }}>
                      {pwdVis[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}

              {pwdMsg.text && (
                <div style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12,
                  background: pwdMsg.type === "ok" ? "#e6f4ea" : "#fee2e2",
                  color: pwdMsg.type === "ok" ? "#1A7A3C" : "var(--color-danger)" }}>
                  {pwdMsg.text}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button type="button" onClick={() => setPwdModal(false)}
                  style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid var(--color-border)",
                    background: "#fff", fontSize: 13, cursor: "pointer" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={pwdSaving}
                  style={{ padding: "8px 18px", borderRadius: 8, border: "none",
                    background: pwdSaving ? "#aaa" : "var(--color-primary)", color: "#fff",
                    fontSize: 13, fontWeight: 600, cursor: pwdSaving ? "not-allowed" : "pointer" }}>
                  {pwdSaving ? "Guardando..." : "Actualizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, icon, value, onChange, type = "text" }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: "var(--color-label)", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }}>
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8,
            border: "1px solid var(--color-border)", fontSize: 13, color: "var(--color-text)",
            background: "#fff", outline: "none", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
          onBlur={e => e.target.style.borderColor = "var(--color-border)"}
        />
      </div>
    </div>
  );
}


