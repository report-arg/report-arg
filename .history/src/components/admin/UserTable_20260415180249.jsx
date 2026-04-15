"use client";

import { btnStyles } from "@/utils/styles";

const usuarios = [
  { id: 1, nombre: "Mateo Sánchez", email: "mateo.sanchez@provincia.gob.ar", rol: "ADMIN", estado: "ACTIVO", ultimoLogin: "Hoy, 09:42" },
  { id: 2, nombre: "Lucía Fernández", email: "l.fernandez@gmail.com", rol: "MODERADOR", estado: "ACTIVO", ultimoLogin: "24 oct, 2023" },
  { id: 3, nombre: "Agustín Valenzuela", email: "agustin.val@outlook.com", rol: "CIUDADANO", estado: "INACTIVO", ultimoLogin: "Nunca" },
  { id: 4, nombre: "Sofía Martínez", email: "sofi.martinez@gmail.com", rol: "CIUDADANO", estado: "ACTIVO", ultimoLogin: "Hace 2 días" },
];

const rolColor = {
  ADMIN: { bg: "#dbeafe", color: "#1e40af" },
  MODERADOR: { bg: "#fef9c3", color: "#854d0e" },
  CIUDADANO: { bg: "#dcfce7", color: "#166534" },
};

const estadoColor = {
  ACTIVO: "#1A7A3C",
  INACTIVO: "#C0392B",
};

function Avatar({ nombre }) {
  const iniciales = nombre.split(" ").map(n => n[0]).slice(0, 2).join("");
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      background: "var(--color-accent)", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: "bold", fontSize: 13, flexShrink: 0,
    }}>
      {iniciales}
    </div>
  );
}

function RolBadge({ rol }) {
  return (
    <span style={{
      background: rolColor[rol]?.bg ?? "#eee",
      color: rolColor[rol]?.color ?? "#555",
      padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: "bold",
    }}>
      {rol}
    </span>
  );
}

function EstadoBadge({ estado }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6, color: estadoColor[estado], fontWeight: "bold", fontSize: 13 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: estadoColor[estado], display: "inline-block" }}></span>
      {estado}
    </span>
  );
}

export default function UserTable() {
  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid var(--color-border)", overflow: "hidden" }}>

      {/* Filtros */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          style={{
            flex: 1, minWidth: 180, padding: "8px 14px", borderRadius: 8,
            border: "1px solid var(--color-border)", fontSize: 13,
            background: "var(--color-bg)", outline: "none",
          }}
        />
        <select style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, background: "var(--color-bg)", color: "#555" }}>
          <option>Rol: Todos</option>
          <option>Admin</option>
          <option>Moderador</option>
          <option>Ciudadano</option>
        </select>
        <select style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, background: "var(--color-bg)", color: "#555" }}>
          <option>Estado: Todos</option>
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
      </div>

      {/* Tabla — solo desktop */}
      <div className="user-table-wrapper">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
              <th style={{ padding: "12px 20px", textAlign: "left", color: "#888", fontWeight: 600 }}>NOMBRE</th>
              <th style={{ padding: "12px 20px", textAlign: "left", color: "#888", fontWeight: 600 }}>ROL</th>
              <th style={{ padding: "12px 20px", textAlign: "left", color: "#888", fontWeight: 600 }}>ESTADO</th>
              <th style={{ padding: "12px 20px", textAlign: "left", color: "#888", fontWeight: 600 }}>ÚLTIMO ACCESO</th>
              <th style={{ padding: "12px 20px", textAlign: "left", color: "#888", fontWeight: 600 }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border)", background: i % 2 === 0 ? "#fff" : "var(--color-bg)" }}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar nombre={u.nombre} />
                    <div>
                      <p style={{ margin: 0, fontWeight: "bold", color: "var(--color-primary)" }}>{u.nombre}</p>
                      <p style={{ margin: 0, color: "#aaa", fontSize: 12 }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 20px" }}><RolBadge rol={u.rol} /></td>
                <td style={{ padding: "14px 20px" }}><EstadoBadge estado={u.estado} /></td>
                <td style={{ padding: "14px 20px", color: "#888", fontSize: 13 }}>{u.ultimoLogin}</td>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={btnStyles.edit}>Editar</button>
                    <button style={btnStyles.danger}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — solo mobile */}
      <div className="user-cards">
        {usuarios.map((u) => (
          <div key={u.id} style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--color-border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar nombre={u.nombre} />
                <div>
                  <p style={{ margin: 0, fontWeight: "bold", color: "var(--color-primary)", fontSize: 14 }}>{u.nombre}</p>
                  <p style={{ margin: 0, color: "#aaa", fontSize: 12 }}>{u.email}</p>
                </div>
              </div>
              <EstadoBadge estado={u.estado} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <RolBadge rol={u.rol} />
                <span style={{ fontSize: 12, color: "#aaa" }}>{u.ultimoLogin}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={btnStyles.edit}>Editar</button>
                <button style={btnStyles.danger}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div style={{ padding: "14px 20px", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#888", flexWrap: "wrap", gap: 10 }}>
        <span>Mostrando 1 a 4 de 12.482 usuarios</span>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, "...", 1248].map((p, i) => (
            <button key={i} style={{
              width: 32, height: 32, borderRadius: 6,
              border: "1px solid var(--color-border)",
              background: p === 1 ? "var(--color-primary)" : "#fff",
              color: p === 1 ? "#fff" : "#555",
              fontSize: 13, cursor: "pointer",
            }}>
              {p}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}