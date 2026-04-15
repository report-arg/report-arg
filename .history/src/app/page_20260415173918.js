"use client";

import { useAuth } from "@/hooks/useAuth";
import { PERMISOS } from "@/lib/roles";

export default function Home() {
  const { usuario, login, logout, rol, estaLogueado, puede } = useAuth();

  const rolColor = {
    ciudadano: "#5BAAE8",
    institucion: "#2D3A8C",
    admin: "#1a2460",
  };

  return (
    <main style={{ fontFamily: "Arial", maxWidth: 720, margin: "40px auto", padding: "0 20px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, borderBottom: "2px solid #5BAAE8", paddingBottom: 20 }}>
        <img src="/logo.png" alt="ReportARG" style={{ height: 70, width: "auto" }} />
        <div>
          <p style={{ margin: 0, fontSize: 13, color: "#5BAAE8", fontWeight: "bold", letterSpacing: 1 }}>SPRINT 1</p>
          <p style={{ margin: 0, fontSize: 13, color: "#888" }}>HU-09 — Gestión de Roles y Permisos</p>
        </div>
      </div>

      {/* Selector de rol */}
      <div style={{ background: "#f0f6ff", border: "1px solid #c8dff7", padding: 20, borderRadius: 10, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, color: "#2D3A8C", fontSize: 16, marginBottom: 14 }}>Simular inicio de sesión</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => login("ciudadano")}
            style={{ padding: "9px 20px", background: "#5BAAE8", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
            Ciudadano
          </button>
          <button onClick={() => login("institucion")}
            style={{ padding: "9px 20px", background: "#2D3A8C", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
            Institución
          </button>
          <button onClick={() => login("admin")}
            style={{ padding: "9px 20px", background: "#1a2460", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
            Administrador
          </button>
          {estaLogueado && (
            <button onClick={logout}
              style={{ padding: "9px 20px", background: "#eee", color: "#555", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
              Cerrar sesión
            </button>
          )}
        </div>
      </div>

      {/* Usuario actual */}
      {estaLogueado ? (
        <div style={{ background: "#fff", border: "1px solid #c8dff7", borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, color: "#2D3A8C", fontSize: 16, marginBottom: 14 }}>Usuario actual</h2>
          <p style={{ margin: "6px 0" }}><strong>Nombre:</strong> {usuario.nombre}</p>
          <p style={{ margin: "6px 0" }}><strong>Email:</strong> {usuario.email}</p>
          <p style={{ margin: "6px 0" }}>
            <strong>Rol:</strong>{" "}
            <span style={{ background: rolColor[rol], color: "#fff", padding: "3px 14px", borderRadius: 99, fontSize: 13, fontWeight: "bold" }}>
              {rol}
            </span>
          </p>
        </div>
      ) : (
        <div style={{ background: "#fffbe6", border: "1px solid #F5C842", borderRadius: 10, padding: 16, marginBottom: 24 }}>
          <p style={{ margin: 0, color: "#7a6000" }}>
            ⚠️ No hay usuario logueado. Seleccioná un rol arriba para ver sus permisos.
          </p>
        </div>
      )}

      {/* Tabla de permisos */}
      <div style={{ background: "#fff", border: "1px solid #c8dff7", borderRadius: 10, padding: 20 }}>
        <h2 style={{ marginTop: 0, color: "#2D3A8C", fontSize: 16, marginBottom: 14 }}>Permisos del rol actual</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#2D3A8C", color: "#fff" }}>
              <th style={{ padding: "10px 14px", textAlign: "left" }}>Permiso</th>
              <th style={{ padding: "10px 14px", textAlign: "center" }}>Acceso</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(PERMISOS).map((permiso, i) => (
              <tr key={permiso} style={{ background: i % 2 === 0 ? "#f0f6ff" : "#fff" }}>
                <td style={{ padding: "8px 14px", color: "#333", borderBottom: "1px solid #e8f0fa" }}>
                  {permiso.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                </td>
                <td style={{ padding: "8px 14px", textAlign: "center", borderBottom: "1px solid #e8f0fa" }}>
                  {estaLogueado
                    ? puede(permiso)
                      ? <span style={{ color: "#1A7A3C", fontWeight: "bold" }}>✓ Sí</span>
                      : <span style={{ color: "#C0392B" }}>✗ No</span>
                    : <span style={{ color: "#aaa" }}>—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, textAlign: "center", color: "#aaa", fontSize: 12, paddingBottom: 40 }}>
        ReportARG · Sprint 1 · HU-09 · Gestión de Roles y Permisos
      </div>

    </main>
  );
}