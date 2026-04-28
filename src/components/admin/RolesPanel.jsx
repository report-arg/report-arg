"use client";

import { useState } from "react";
import { ShieldCheck, FileText, Users, BarChart2, Settings } from "lucide-react";

const roles = [
  { id: 1, nombre: "Super Admin", descripcion: "Acceso Total", icon: ShieldCheck, color: "#2D3A8C" },
  { id: 2, nombre: "Moderador", descripcion: "Control de contenido", icon: ShieldCheck, color: "#5BAAE8" },
  { id: 3, nombre: "Editor", descripcion: "Gestión de Reportes", icon: FileText, color: "#F5C842" },
  { id: 4, nombre: "Ciudadano", descripcion: "Solo Lectura/Creación", icon: Users, color: "#aaa" },
];

const modulosPermisos = [
  { nombre: "Reportes", icon: FileText },
  { nombre: "Usuarios", icon: Users },
  { nombre: "Estadísticas", icon: BarChart2 },
  { nombre: "Configuración", icon: Settings },
];

const permisosIniciales = {
  1: { Reportes: ["Ver", "Crear", "Editar", "Borrar", "Admin"], Usuarios: ["Ver", "Crear", "Editar", "Borrar", "Admin"], Estadísticas: ["Ver", "Crear", "Editar", "Borrar", "Admin"], Configuración: ["Ver", "Crear", "Editar", "Borrar", "Admin"] },
  2: { Reportes: ["Ver", "Crear", "Editar"], Usuarios: ["Ver"], Estadísticas: ["Ver"], Configuración: [] },
  3: { Reportes: ["Ver", "Crear"], Usuarios: [], Estadísticas: ["Ver"], Configuración: [] },
  4: { Reportes: ["Ver"], Usuarios: [], Estadísticas: [], Configuración: [] },
};

const permisosLabels = ["Ver", "Crear", "Editar", "Borrar", "Admin"];

export default function RolesPanel() {
  const [rolActivo, setRolActivo] = useState(roles[1]);
  const [permisos, setPermisos] = useState(permisosIniciales);

  function togglePermiso(modulo, permiso) {
    setPermisos(prev => {
      const actuales = prev[rolActivo.id][modulo] ?? [];
      const tienePermiso = actuales.includes(permiso);
      return {
        ...prev,
        [rolActivo.id]: {
          ...prev[rolActivo.id],
          [modulo]: tienePermiso
            ? actuales.filter(p => p !== permiso)
            : [...actuales, permiso],
        },
      };
    });
  }

  function seleccionarTodo(modulo) {
    setPermisos(prev => ({
      ...prev,
      [rolActivo.id]: { ...prev[rolActivo.id], [modulo]: permisosLabels },
    }));
  }

  function limpiarModulo(modulo) {
    setPermisos(prev => ({
      ...prev,
      [rolActivo.id]: { ...prev[rolActivo.id], [modulo]: [] },
    }));
  }

  return (
    <div className="roles-layout">

      {/* Lista de roles */}
      <div className="roles-list">
        <div className="card" style={{ padding: 16 }}>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>ROLES ACTIVOS</p>
          <div className="roles-tabs">
            {roles.map(rol => {
              const Icon = rol.icon;
              const activo = rolActivo.id === rol.id;
              return (
                <div key={rol.id} className={`roles-tab-item ${activo ? "active" : ""}`} onClick={() => setRolActivo(rol)}>
                  <div className={`roles-tab-icon ${activo ? "active" : ""}`}>
                    <Icon size={16} color={activo ? "#fff" : rol.color} />
                  </div>
                  <div>
                    <p className={`roles-tab-name ${activo ? "active" : ""}`}>{rol.nombre}</p>
                    <p className="roles-tab-desc">{rol.descripcion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Configuración del rol */}
      <div className="roles-config">
        <div className="card" style={{ padding: 24 }}>
          <h2 className="roles-config-title">
            Configuración del Rol: {rolActivo.nombre}
          </h2>

          {/* Nombre y categoría */}
          <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="form-label">NOMBRE DEL ROL</label>
              <input defaultValue={rolActivo.nombre} key={rolActivo.id} className="input" style={{ display: "block", width: "100%", marginTop: 6, boxSizing: "border-box" }} />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="form-label">CATEGORÍA</label>
              <select className="select" style={{ display: "block", width: "100%", marginTop: 6, boxSizing: "border-box" }}>
                <option>Gestión de Contenido</option>
                <option>Administración</option>
                <option>Solo Lectura</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">DESCRIPCIÓN DEL ROL</label>
            <textarea rows={3} key={rolActivo.id} className="input"
              defaultValue="Responsable de validar reportes ciudadanos, gestionar estados de incidencias y moderar comentarios en la plataforma pública."
              style={{ display: "block", width: "100%", marginTop: 6, resize: "none", boxSizing: "border-box" }} />
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
                    const Icon = modulo.icon;
                    const permisosRol = permisos[rolActivo.id][modulo.nombre] ?? [];
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
                            <input type="checkbox"
                              checked={permisosRol.includes(permiso)}
                              onChange={() => togglePermiso(modulo.nombre, permiso)}
                              style={{ width: 16, height: 16, accentColor: "var(--color-primary)", cursor: "pointer" }} />
                          </td>
                        ))}
                        <td style={{ textAlign: "center" }}>
                          <div className="actions">
                            <button className="btn-small-todo" onClick={() => seleccionarTodo(modulo.nombre)}>Todo</button>
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
                const Icon = modulo.icon;
                const permisosRol = permisos[rolActivo.id][modulo.nombre] ?? [];
                return (
                  <div key={modulo.nombre} style={{ padding: "14px 0", borderBottom: "1px solid var(--color-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon size={15} color="var(--color-accent)" />
                        <span style={{ fontWeight: 600, color: "#333", fontSize: 14 }}>Módulo: {modulo.nombre}</span>
                      </div>
                      <div className="actions">
                        <button className="btn-small-todo" onClick={() => seleccionarTodo(modulo.nombre)}>Todo</button>
                        <button className="btn-small-limpiar" onClick={() => limpiarModulo(modulo.nombre)}>Limpiar</button>
                      </div>
                    </div>
                    <div className="permisos-checks">
                      {permisosLabels.map(permiso => (
                        <label key={permiso} className="permisos-check-item">
                          <input type="checkbox"
                            checked={permisosRol.includes(permiso)}
                            onChange={() => togglePermiso(modulo.nombre, permiso)}
                            style={{ width: 16, height: 16, accentColor: "var(--color-primary)", cursor: "pointer" }} />
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
          <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end", alignItems: "center" }}>
            <button style={{
              width: 160, height: 40, borderRadius: 8,
              border: "1px solid var(--color-border)",
              background: "#fff", color: "#555",
              fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxSizing: "border-box",
            }}>Descartar Cambios</button>
            <button style={{
              width: 160, height: 40, borderRadius: 8,
              border: "none",
              background: "var(--color-primary)", color: "#fff",
              fontSize: 13, fontWeight: "bold", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxSizing: "border-box",
            }}>Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
}