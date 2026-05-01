"use client";

import { useState } from "react";
import { ShieldCheck, FileText, Users, BarChart2, Settings } from "lucide-react";

const rolesIniciales = [
  { id: 1, nombre: "Super Admin",  descripcion: "Acceso Total",              icon: ShieldCheck, color: "#2D3A8C" },
  { id: 2, nombre: "Moderador",    descripcion: "Control de contenido",      icon: ShieldCheck, color: "#5BAAE8" },
  { id: 3, nombre: "Editor",       descripcion: "Gestión de Reportes",       icon: FileText,    color: "#F5C842" },
  { id: 4, nombre: "Ciudadano",    descripcion: "Solo Lectura/Creación",     icon: Users,       color: "#aaa"    },
];

const modulosPermisos = [
  { nombre: "Reportes",      icon: FileText   },
  { nombre: "Usuarios",      icon: Users      },
  { nombre: "Estadísticas",  icon: BarChart2  },
  { nombre: "Configuración", icon: Settings   },
];

const permisosBase = {
  1: { Reportes: ["Ver","Crear","Editar","Borrar","Admin"], Usuarios: ["Ver","Crear","Editar","Borrar","Admin"], Estadísticas: ["Ver","Crear","Editar","Borrar","Admin"], Configuración: ["Ver","Crear","Editar","Borrar","Admin"] },
  2: { Reportes: ["Ver","Crear","Editar"], Usuarios: ["Ver"], Estadísticas: ["Ver"], Configuración: [] },
  3: { Reportes: ["Ver","Crear"],          Usuarios: [],      Estadísticas: ["Ver"], Configuración: [] },
  4: { Reportes: ["Ver"],                  Usuarios: [],      Estadísticas: [],      Configuración: [] },
};

const permisosLabels = ["Ver", "Crear", "Editar", "Borrar", "Admin"];

const coloresRol = ["#2D3A8C","#5BAAE8","#F5C842","#aaa","#1D9E75","#D85A30","#7F77DD","#D4537E"];
const iconosRol  = [ShieldCheck, FileText, Users, BarChart2, Settings];

export default function RolesPanel({modalAbierto, setModalAbierto}) {
  const [roles, setRoles]           = useState(rolesIniciales);
  const [permisos, setPermisos]     = useState(permisosBase);
  const [rolActivo, setRolActivo]   = useState(rolesIniciales[1]);

  // Estado editable del formulario (separado del guardado)
  const [formRol, setFormRol] = useState({
    nombre:      rolesIniciales[1].nombre,
    descripcion: "Responsable de validar reportes ciudadanos, gestionar estados de incidencias y moderar comentarios en la plataforma pública.",
    categoria:   "Gestión de Contenido",
  });
  const [permisosEditados, setPermisosEditados] = useState(permisosBase);
  const [hayCambios, setHayCambios] = useState(false);

  // Modal nuevo rol
  const [nuevoRol, setNuevoRol] = useState({ nombre: "", descripcion: "", categoria: "Gestión de Contenido" });
  const [nuevoRolError, setNuevoRolError] = useState("");
  const [confirmDeleteRol, setConfirmDeleteRol] = useState(null);

  function seleccionarRol(rol) {
    if (hayCambios) {
      // Si hay cambios sin guardar, descartarlos al cambiar de rol
      setPermisosEditados(permisos);
      setHayCambios(false);
    }
    setRolActivo(rol);
    setFormRol({
      nombre:      rol.nombre,
      descripcion: rol.descripcion || "",
      categoria:   "Gestión de Contenido",
    });
  }


  function togglePermiso(modulo, permiso) {
    setPermisosEditados(prev => {
      const actuales = prev[rolActivo.id]?.[modulo] ?? [];
      const tiene    = actuales.includes(permiso);
      return {
        ...prev,
        [rolActivo.id]: {
          ...prev[rolActivo.id],
          [modulo]: tiene ? actuales.filter(p => p !== permiso) : [...actuales, permiso],
        },
      };
    });
    setHayCambios(true);
  }

  function seleccionarTodo(modulo) {
    setPermisosEditados(prev => ({
      ...prev,
      [rolActivo.id]: { ...prev[rolActivo.id], [modulo]: permisosLabels },
    }));
    setHayCambios(true);
  }

  function limpiarModulo(modulo) {
    setPermisosEditados(prev => ({
      ...prev,
      [rolActivo.id]: { ...prev[rolActivo.id], [modulo]: [] },
    }));
    setHayCambios(true);
  }

  function guardarCambios() {
    setPermisos(permisosEditados);
    setRoles(prev => prev.map(r =>
      r.id === rolActivo.id ? { ...r, nombre: formRol.nombre, descripcion: formRol.descripcion } : r
    ));
    setRolActivo(prev => ({ ...prev, nombre: formRol.nombre, descripcion: formRol.descripcion }));
    setHayCambios(false);
  }

  function descartarCambios() {
    setPermisosEditados(permisos);
    setFormRol({
      nombre:      rolActivo.nombre,
      descripcion: rolActivo.descripcion || "",
      categoria:   "Gestión de Contenido",
    });
    setHayCambios(false);
  }

  function handleFormChange(e) {
    setFormRol(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setHayCambios(true);
  }

  function crearRol() {
    if (!nuevoRol.nombre.trim()) { setNuevoRolError("El nombre es obligatorio."); return; }
    const nuevoId = Math.max(...roles.map(r => r.id)) + 1;
    const IconAleatorio = iconosRol[nuevoId % iconosRol.length];
    const colorAleatorio = coloresRol[nuevoId % coloresRol.length];
    const rolNuevo = {
      id: nuevoId,
      nombre: nuevoRol.nombre.trim(),
      descripcion: nuevoRol.descripcion.trim() || "Sin descripción",
      icon: IconAleatorio,
      color: colorAleatorio,
    };
    setRoles(prev => [...prev, rolNuevo]);
    setPermisos(prev => ({
      ...prev,
      [nuevoId]: { Reportes: [], Usuarios: [], Estadísticas: [], Configuración: [] },
    }));
    setPermisosEditados(prev => ({
      ...prev,
      [nuevoId]: { Reportes: [], Usuarios: [], Estadísticas: [], Configuración: [] },
    }));
    setModalAbierto(false);
    setNuevoRol({ nombre: "", descripcion: "", categoria: "Gestión de Contenido" });
    setNuevoRolError("");
    // Seleccionar el nuevo rol automáticamente
    setRolActivo(rolNuevo);
    setFormRol({ nombre: rolNuevo.nombre, descripcion: rolNuevo.descripcion, categoria: "Gestión de Contenido" });
    setHayCambios(false);
  }

  const inputStyle = {
    display: "block", width: "100%", marginTop: 6,
    padding: "8px 12px", fontSize: 13,
    border: "1px solid var(--color-border)", borderRadius: 8,
    background: "#fff", color: "#333", boxSizing: "border-box",
  };

  return (
    <>
      {/* Modal nuevo rol */}
      {modalAbierto && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 28,
            maxWidth: 420, width: "90%", border: "1px solid var(--color-border)",
          }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, color: "#333" }}>Nuevo Rol</h3>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>NOMBRE DEL ROL</label>
              <input
                style={{ ...inputStyle, borderColor: nuevoRolError ? "var(--color-danger)" : "" }}
                placeholder="Ej: Supervisor"
                value={nuevoRol.nombre}
                onChange={e => { setNuevoRol(p => ({ ...p, nombre: e.target.value })); setNuevoRolError(""); }}
              />
              {nuevoRolError && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: "4px 0 0" }}>{nuevoRolError}</p>}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>DESCRIPCIÓN</label>
              <input
                style={inputStyle}
                placeholder="Ej: Supervisa reportes de su zona"
                value={nuevoRol.descripcion}
                onChange={e => setNuevoRol(p => ({ ...p, descripcion: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>CATEGORÍA</label>
              <select style={inputStyle} value={nuevoRol.categoria} onChange={e => setNuevoRol(p => ({ ...p, categoria: e.target.value }))}>
                <option>Gestión de Contenido</option>
                <option>Administración</option>
                <option>Solo Lectura</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => { setModalAbierto(false); setNuevoRolError(""); }} style={{
                padding: "9px 20px", border: "1px solid var(--color-border)",
                borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer",
              }}>Cancelar</button>
              <button onClick={crearRol} style={{
                padding: "9px 20px", background: "var(--color-primary)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: "bold", cursor: "pointer",
              }}>Crear Rol</button>
            </div>
          </div>
        </div>
      )}
      {confirmDeleteRol && (
       <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
       }}>
        <div style={{
          background: "#fff", borderRadius: 12, padding: 28,
          maxWidth: 380, width: "90%", border: "1px solid var(--color-border)",
       }}>
         <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#333" }}>¿Eliminar rol?</h3>
         <p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>
           Esta acción no se puede deshacer. Se eliminará el rol <strong>{confirmDeleteRol.nombre}</strong>.
         </p>
         <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setConfirmDeleteRol(null)} style={{
             padding: "8px 18px", border: "1px solid var(--color-border)",
             borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer",
            }}>Cancelar</button>
            <button onClick={() => {
              const nuevosRoles = roles.filter(r => r.id !== confirmDeleteRol.id);
              setRoles(nuevosRoles);
              if (rolActivo.id === confirmDeleteRol.id) {
                setRolActivo(nuevosRoles[0]);
                setFormRol({ nombre: nuevosRoles[0].nombre, descripcion: nuevosRoles[0].descripcion || "", categoria: "Gestión de Contenido" });
              }
              setConfirmDeleteRol(null);
              }} style={{
               padding: "8px 18px", background: "var(--color-danger)",
               color: "#fff", border: "none", borderRadius: 8,
               fontSize: 13, fontWeight: "bold", cursor: "pointer",
              }}>Eliminar</button>
            </div>
          </div>
        </div>
)}
      <div className="roles-layout">

        {/* Lista de roles */}
        <div className="roles-list">
          <div className="card" style={{ padding: 16 }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ margin: 0, fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>ROLES ACTIVOS</p>
            </div>

            <div className="roles-tabs">
              {roles.map(rol => {
                const Icon   = rol.icon;
                const activo = rolActivo.id === rol.id;
                return (
                  <div key={rol.id} className={`roles-tab-item ${activo ? "active" : ""}`} onClick={() => seleccionarRol(rol)}>
                    <div className={`roles-tab-icon ${activo ? "active" : ""}`}>
                      <Icon size={16} color={activo ? "#fff" : rol.color} />
                    </div>
                    <div>
                      <p className={`roles-tab-name ${activo ? "active" : ""}`}>{rol.nombre}</p>
                      <p className="roles-tab-desc">{rol.descripcion}</p>
                    </div>
                    {/* Botón eliminar — solo si no es el rol activo o hay más de 1 */}
                    {roles.length > 1 && (
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmDeleteRol(rol); }}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: activo ? "#E24B4A" : "#E24B4A", fontSize: 16, padding: "0 4px",
                          lineHeight: 1, flexShrink: 0,
                       }}
                      >×</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Configuración del rol */}
        <div className="roles-config">
          <div className="card" style={{ padding: 24 }}>

            {hayCambios && (
              <div style={{
                background: "#FFF8E1", border: "1px solid #F5C842",
                borderRadius: 8, padding: "10px 14px", marginBottom: 16,
                fontSize: 13, color: "#7a6000",
              }}>
                Tenés cambios sin guardar en este rol.
              </div>
            )}

            <h2 className="roles-config-title">
              Configuración del Rol: {rolActivo.nombre}
            </h2>

            {/* Nombre y categoría */}
            <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label className="form-label">NOMBRE DEL ROL</label>
                <input
                  name="nombre"
                  value={formRol.nombre}
                  onChange={handleFormChange}
                  className="input"
                  style={{ display: "block", width: "100%", marginTop: 6, boxSizing: "border-box" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label className="form-label">CATEGORÍA</label>
                <select
                  name="categoria"
                  value={formRol.categoria}
                  onChange={handleFormChange}
                  className="select"
                  style={{ display: "block", width: "100%", marginTop: 6, boxSizing: "border-box" }}
                >
                  <option>Gestión de Contenido</option>
                  <option>Administración</option>
                  <option>Solo Lectura</option>
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">DESCRIPCIÓN DEL ROL</label>
              <textarea
                rows={3}
                name="descripcion"
                value={formRol.descripcion}
                onChange={handleFormChange}
                className="input"
                style={{ display: "block", width: "100%", marginTop: 6, resize: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Matriz de permisos */}
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>MATRIZ DE PERMISOS</p>

              {/* Tabla desktop */}
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>MÓDULO</th>
                      {permisosLabels.map(p => <th key={p} style={{ textAlign: "center" }}>{p}</th>)}
                      <th style={{ textAlign: "center" }}>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modulosPermisos.map((modulo, i) => {
                      const Icon        = modulo.icon;
                      const permisosRol = permisosEditados[rolActivo.id]?.[modulo.nombre] ?? [];
                      return (
                        <tr key={modulo.nombre} className={i % 2 === 0 ? "row" : "row alt"}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Icon size={15} color="var(--color-accent)" />
                              <span style={{ color: "#333", fontWeight: 500 }}>{modulo.nombre}</span>
                            </div>
                          </td>
                          {permisosLabels.map(permiso => (
                            <td key={permiso} style={{ textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={permisosRol.includes(permiso)}
                                onChange={() => togglePermiso(modulo.nombre, permiso)}
                                style={{ width: 16, height: 16, accentColor: "var(--color-primary)", cursor: "pointer" }}
                              />
                            </td>
                          ))}
                          <td style={{ textAlign: "center" }}>
                            <div className="actions">
                              <button className="btn-small-todo"    onClick={() => seleccionarTodo(modulo.nombre)}>Todo</button>
                              <button className="btn-small-limpiar" onClick={() => limpiarModulo(modulo.nombre)}>Limpiar</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cards mobile */}
              <div className="cards">
                {modulosPermisos.map((modulo) => {
                  const Icon        = modulo.icon;
                  const permisosRol = permisosEditados[rolActivo.id]?.[modulo.nombre] ?? [];
                  return (
                    <div key={modulo.nombre} style={{ padding: "14px 0", borderBottom: "1px solid var(--color-border)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Icon size={15} color="var(--color-accent)" />
                          <span style={{ fontWeight: 600, color: "#333", fontSize: 14 }}>Módulo: {modulo.nombre}</span>
                        </div>
                        <div className="actions">
                          <button className="btn-small-todo"    onClick={() => seleccionarTodo(modulo.nombre)}>Todo</button>
                          <button className="btn-small-limpiar" onClick={() => limpiarModulo(modulo.nombre)}>Limpiar</button>
                        </div>
                      </div>
                      <div className="permisos-checks">
                        {permisosLabels.map(permiso => (
                          <label key={permiso} className="permisos-check-item">
                            <input
                              type="checkbox"
                              checked={permisosRol.includes(permiso)}
                              onChange={() => togglePermiso(modulo.nombre, permiso)}
                              style={{ width: 16, height: 16, accentColor: "var(--color-primary)", cursor: "pointer" }}
                            />
                            {permiso}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nota de seguridad */}
            <div className="security-note">
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: "bold", color: "#7a6000" }}>⚠ Nota de Seguridad</p>
              <p style={{ margin: 0, fontSize: 13, color: "#7a6000" }}>
                Los cambios en los permisos de los roles activos se aplicarán de forma inmediata a todos los usuarios vinculados.
              </p>
            </div>

            {/* Botones */}
            <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
              <button
                onClick={descartarCambios}
                disabled={!hayCambios}
                style={{
                  width: 160, height: 40, borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  background: "#fff", color: hayCambios ? "#555" : "#ccc",
                  fontSize: 13, cursor: hayCambios ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >Descartar Cambios</button>
              <button
                onClick={guardarCambios}
                disabled={!hayCambios}
                style={{
                  width: 160, height: 40, borderRadius: 8, border: "none",
                  background: hayCambios ? "var(--color-primary)" : "#ccc",
                  color: "#fff", fontSize: 13, fontWeight: "bold",
                  cursor: hayCambios ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >Guardar Cambios</button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}