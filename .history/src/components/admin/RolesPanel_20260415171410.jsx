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
  {
    nombre: "Reportes",
    icon: FileText,
    permisos: ["Ver", "Crear", "Editar", "Borrar", "Admin"],
  },
  {
    nombre: "Usuarios",
    icon: Users,
    permisos: ["Ver", "Crear", "Editar", "Borrar", "Admin"],
  },
  {
    nombre: "Estadísticas",
    icon: BarChart2,
    permisos: ["Ver", "Crear", "Editar", "Borrar", "Admin"],
  },
  {
    nombre: "Configuración",
    icon: Settings,
    permisos: ["Ver", "Crear", "Editar", "Borrar", "Admin"],
  },
];

const permisosIniciales = {
  1: { Reportes: ["Ver", "Crear", "Editar", "Borrar", "Admin"], Usuarios: ["Ver", "Crear", "Editar", "Borrar", "Admin"], Estadísticas: ["Ver", "Crear", "Editar", "Borrar", "Admin"], Configuración: ["Ver", "Crear", "Editar", "Borrar", "Admin"] },
  2: { Reportes: ["Ver", "Crear", "Editar"], Usuarios: ["Ver"], Estadísticas: ["Ver"], Configuración: [] },
  3: { Reportes: ["Ver", "Crear"], Usuarios: [], Estadísticas: ["Ver"], Configuración: [] },
  4: { Reportes: ["Ver"], Usuarios: [], Estadísticas: [], Configuración: [] },
};

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
      [rolActivo.id]: {
        ...prev[rolActivo.id],
        [modulo]: modulosPermisos.find(m => m.nombre === modulo).permisos,
      },
    }));
  }

  function limpiarModulo(modulo) {
    setPermisos(prev => ({
      ...prev,
      [rolActivo.id]: { ...prev[rolActivo.id], [modulo]: [] },
    }));
  }

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

      {/* Lista de roles */}
      <div style={{ width: 220, background: "#fff", borderRadius: 10, border: "1px solid #e8f0fa", padding: 16, flexShrink: 0 }}>
        <p style={{ margin: "0 0 14px", fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>ROLES ACTIVOS</p>
        {roles.map(rol => {
          const Icon = rol.icon;
          const activo = rolActivo.id === rol.id;
          return (
            <div key={rol.id} onClick={() => setRolActivo(rol)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8, marginBottom: 6,
                background: activo ? "#f0f6ff" : "#fff",
                border: activo ? "1px solid #c8dff7" : "1px solid transparent",
                cursor: "pointer",
              }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: activo ? "#2D3A8C" : "#f0f6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} color={activo ? "#fff" : rol.color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: "bold", color: activo ? "#2D3A8C" : "#333" }}>{rol.nombre}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{rol.descripcion}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuración del rol */}
      <div style={{ flex: 1, background: "#fff", borderRadius: 10, border: "1px solid #e8f0fa", padding: 24 }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 16, color: "#2D3A8C", borderLeft: "3px solid #5BAAE8", paddingLeft: 10 }}>
          Configuración del Rol: {rolActivo.nombre}
        </h2>

        {/* Nombre y categoría */}
        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>NOMBRE DEL ROL</label>
            <input defaultValue={rolActivo.nombre}
              style={{ display: "block", width: "100%", marginTop: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid #e8f0fa", fontSize: 13, background: "#f7faff", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>CATEGORÍA</label>
            <select style={{ display: "block", width: "100%", marginTop: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid #e8f0fa", fontSize: 13, background: "#f7faff", outline: "none", boxSizing: "border-box" }}>
              <option>Gestión de Contenido</option>
              <option>Administración</option>
              <option>Solo Lectura</option>
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>DESCRIPCIÓN DEL ROL</label>
          <textarea rows={3}
            defaultValue="Responsable de validar reportes ciudadanos, gestionar estados de incidencias y moderar comentarios en la plataforma pública."
            style={{ display: "block", width: "100%", marginTop: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid #e8f0fa", fontSize: 13, background: "#f7faff", outline: "none", resize: "none", boxSizing: "border-box" }} />
        </div>

        {/* Matriz de permisos */}
        <div>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>MATRIZ DE PERMISOS</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f7faff", borderBottom: "1px solid #e8f0fa" }}>
                <th style={{ padding: "10px 14px", textAlign: "left", color: "#888", fontWeight: 600 }}>MÓDULO / SECCIÓN</th>
                {["Ver", "Crear", "Editar", "Borrar", "Admin"].map(p => (
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
                  <tr key={modulo.nombre} style={{ borderBottom: "1px solid #e8f0fa", background: i % 2 === 0 ? "#fff" : "#f7faff" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon size={15} color="#5BAAE8" />
                        <span style={{ color: "#333", fontWeight: 500 }}>{modulo.nombre}</span>
                      </div>
                    </td>
                    {["Ver", "Crear", "Editar", "Borrar", "Admin"].map(permiso => (
                      <td key={permiso} style={{ padding: "12px 14px", textAlign: "center" }}>
                        <input type="checkbox"
                          checked={permisosRol.includes(permiso)}
                          onChange={() => togglePermiso(modulo.nombre, permiso)}
                          style={{ width: 16, height: 16, accentColor: "#2D3A8C", cursor: "pointer" }} />
                      </td>
                    ))}
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                        <button onClick={() => seleccionarTodo(modulo.nombre)}
                          style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid #c8dff7", background: "#f0f6ff", color: "#2D3A8C", cursor: "pointer" }}>
                          Todo
                        </button>
                        <button onClick={() => limpiarModulo(modulo.nombre)}
                          style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid #fee2e2", background: "#fff5f5", color: "#C0392B", cursor: "pointer" }}>
                          Limpiar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Nota de seguridad */}
        <div style={{ marginTop: 20, padding: 16, background: "#fffbe6", border: "1px solid #F5C842", borderRadius: 8 }}>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: "bold", color: "#7a6000" }}>⚠ Nota de Seguridad</p>
          <p style={{ margin: 0, fontSize: 13, color: "#7a6000" }}>
            Los cambios en los permisos de los roles activos se aplicarán de forma inmediata a todos los usuarios vinculados.
          </p>
        </div>

        {/* Botones */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
          <button style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #e8f0fa", background: "#fff", color: "#555", fontSize: 13, cursor: "pointer" }}>
            Descartar Cambios
          </button>
          <button style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#2D3A8C", color: "#fff", fontSize: 13, fontWeight: "bold", cursor: "pointer" }}>
            Guardar Cambios
          </button>
        </div>
      </div>

    </div>
  );
}