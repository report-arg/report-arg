"use client";

import { useState } from "react";
import { ShieldCheck, FileText, Users, BarChart2, Settings } from "lucide-react";
import { btnStyles } from "@/utils/styles";

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

      {/* Lista de roles — desktop: columna, mobile: tabs */}
      <div className="roles-list">
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid var(--color-border)", padding: 16 }}>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>ROLES ACTIVOS</p>
          <div className="roles-tabs">
            {roles.map(rol => {
              const Icon = rol.icon;
              const activo = rolActivo.id === rol.id;
              return (
                <div key={rol.id} className="roles-tab-item" onClick={() => setRolActivo(rol)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 8, marginBottom: 6,
                    background: activo ? "var(--color-primary-light)" : "#fff",
                    border: activo ? "1px solid var(--color-primary-border)" : "1px solid transparent",
                    cursor: "pointer",
                  }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: activo ? "var(--color-primary)" : "var(--color-primary-light)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon size={16} color={activo ? "#fff" : rol.color} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: "bold", color: activo ? "var(--color-primary)" : "#333", whiteSpace: "nowrap" }}>{rol.nombre}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#aaa", whiteSpace: "nowrap" }}>{rol.descripcion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Configuración del rol */}
      <div className="roles-config">
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid var(--color-border)", padding: 24 }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 16, color: "var(--color-primary)", borderLeft: "3px solid var(--color-accent)", paddingLeft: 10 }}>
            Configuración del Rol: {rolActivo.nombre}
          </h2>

          {/* Nombre y categoría */}
          <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>NOMBRE DEL ROL</label>
              <input defaultValue={rolActivo.nombre} key={rolActivo.id}
                style={{ display: "block", width: "100%", marginTop: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, background: "var(--color-bg)", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>CATEGORÍA</label>
              <select style={{ display: "block", width: "100%", marginTop: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, background: "var(--color-bg)", outline: "none", boxSizing: "border-box" }}>
                <option>Gestión de Contenido</option>
                <option>Administración</option>
                <option>Solo Lectura</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>DESCRIPCIÓN DEL ROL</label>
            <textarea rows={3} key={rolActivo.id}
              defaultValue="Responsable de validar reportes ciudadanos, gestionar estados de incidencias y moderar comentarios en la plataforma pública."
              style={{ display: "block", width: "100%", marginTop: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, background: "var(--color-bg)", outline: "none", resize: "none", boxSizing: "border-box" }} />
          </div>

          {/* Matriz de permisos — desktop */}
          <div>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>MATRIZ DE PERMISOS</p>

            {/* Tabla desktop */}
            <div className="user-table-wrapper">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: "#888", fontWeight: 600 }}>MÓDULO</th>
                    {permisosLabels.map(p => (
                      <th key={p} style={{ padding: "10px 14px", textAlign: "center", color: "#888", fontWeight: 600 }}>{p}</th>
                    ))}
                    <th style={{ padding: "10px 14px", textAlign: "center", color: "#888", fontWeight: 600 }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {modulosPermisos.map((modulo, i) => {
                    const Icon = modulo.icon;
                    const permisosRol = permisos[rolActivo.id][modulo.nombre] ?? [];
                    return (
                      <tr key={modulo.nombre} style={{ borderBottom: "1px solid var(--color-border)", background: i % 2 === 0 ? "#fff" : "var(--color-bg)" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Icon size={15} color="var(--color-accent)" />
                            <span style={{ color: "#333", fontWeight: 500 }}>{modulo.nombre}</span>
                          </div>
                        </td>
                        {permisosLabels.map(permiso => (
                          <td key={permiso} style={{ padding: "12px 14px", textAlign: "center" }}>
                            <input type="checkbox"
                              checked={permisosRol.includes(permiso)}
                              onChange={() => togglePermiso(modulo.nombre, permiso)}
                              style={{ width: 16, height: 16, accentColor: "var(--color-primary)", cursor: "pointer" }} />
                          </td>
                        ))}
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            <button onClick={() => seleccionarTodo(modulo.nombre)} style={btnStyles.small.todo}>Todo</button>
                            <button onClick={() => limpiarModulo(modulo.nombre)} style={btnStyles.small.limpiar}>Limpiar</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards mobile */}
            <div className="user-cards">
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
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => seleccionarTodo(modulo.nombre)} style={btnStyles.small.todo}>Todo</button>
                        <button onClick={() => limpiarModulo(modulo.nombre)} style={btnStyles.small.limpiar}>Limpiar</button>
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
          <div style={{ marginTop: 20, padding: 16, background: "var(--color-warning-bg, #fffbe6)", border: "1px solid var(--color-warning)", borderRadius: 8 }}>
            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: "bold", color: "#7a6000" }}>⚠ Nota de Seguridad</p>
            <p style={{ margin: 0, fontSize: 13, color: "#7a6000" }}>
              Los cambios en los permisos de los roles activos se aplicarán de forma inmediata a todos los usuarios vinculados.
            </p>
          </div>

          {/* Botones */}
         <div className="btn-group" style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
            <button style={btnStyles.secondary}>Descartar Cambios</button>
            <button style={btnStyles.primary}>Guardar Cambios</button>
          </div>
        </div>
      </div>

    </div>
  );
}