"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const usuariosIniciales = [
  { id: 1, nombre: "Mateo Sánchez",      email: "mateo.sanchez@provincia.gob.ar", rol: "ADMIN",      estado: "ACTIVO",   ultimoLogin: "Hoy, 09:42",   foto: null },
  { id: 2, nombre: "Lucía Fernández",    email: "l.fernandez@gmail.com",          rol: "MODERADOR",  estado: "ACTIVO",   ultimoLogin: "24 oct, 2023", foto: null },
  { id: 3, nombre: "Agustín Valenzuela", email: "agustin.val@outlook.com",        rol: "CIUDADANO",  estado: "INACTIVO", ultimoLogin: "Nunca",        foto: null },
  { id: 4, nombre: "Sofía Martínez",     email: "sofi.martinez@gmail.com",        rol: "CIUDADANO",  estado: "ACTIVO",   ultimoLogin: "Hace 2 días",  foto: null },
];

const rolColor   = { ADMIN: "role-admin", MODERADOR: "role-moderator", CIUDADANO: "role-user" };
const estadoColor = { ACTIVO: "status-active", INACTIVO: "status-inactive" };

function Avatar({ nombre, foto }) {
  if (foto) return <img src={foto} alt={nombre} className="avatar" style={{ objectFit: "cover" }} />;
  const iniciales = nombre.split(" ").map(n => n[0]).slice(0, 2).join("");
  return <div className="avatar">{iniciales}</div>;
}

export default function UserTable() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState(usuariosIniciales);
  const [busqueda, setBusqueda]   = useState("");
  const [filtroRol, setFiltroRol] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtrados = usuarios.filter(u => {
    const matchBusqueda = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          u.email.toLowerCase().includes(busqueda.toLowerCase());
    const matchRol    = filtroRol    === "Todos" || u.rol    === filtroRol;
    const matchEstado = filtroEstado === "Todos" || u.estado === filtroEstado;
    return matchBusqueda && matchRol && matchEstado;
  });

  function eliminar(id) {
    setUsuarios(prev => prev.filter(u => u.id !== id));
    setConfirmDelete(null);
  }

  return (
    <div className="card">

      {/* Modal confirmar eliminación */}
      {confirmDelete && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 28, maxWidth: 380, width: "90%",
            border: "1px solid var(--color-border)",
          }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#333" }}>¿Eliminar usuario?</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>
              Esta acción no se puede deshacer. Se eliminará permanentemente a <strong>{confirmDelete.nombre}</strong>.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                padding: "8px 18px", border: "1px solid var(--color-border)",
                borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer",
              }}>Cancelar</button>
              <button onClick={() => eliminar(confirmDelete.id)} style={{
                padding: "8px 18px", background: "var(--color-danger)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: "bold", cursor: "pointer",
              }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="table-filters">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          className="input"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select className="select" value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
          <option value="Todos">Rol: Todos</option>
          <option value="ADMIN">Admin</option>
          <option value="MODERADOR">Moderador</option>
          <option value="CIUDADANO">Ciudadano</option>
        </select>
        <select className="select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="Todos">Estado: Todos</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
      </div>

      {filtrados.length === 0 && (
        <p style={{ textAlign: "center", color: "#aaa", padding: "32px 0", fontSize: 14 }}>
          No se encontraron usuarios con esos criterios.
        </p>
      )}

      {/* Tabla desktop */}
      {filtrados.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Último acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u, i) => (
                <tr key={u.id} className={i % 2 === 0 ? "row" : "row alt"}>
                  <td>
                    <div className="user">
                      <Avatar nombre={u.nombre} foto={u.foto} />
                      <div>
                        <p className="name">{u.nombre}</p>
                        <p className="email">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${rolColor[u.rol]}`}>{u.rol}</span></td>
                  <td>
                    <span className={`status ${estadoColor[u.estado]}`}>
                      <span className="dot" />{u.estado}
                    </span>
                  </td>
                  <td className="muted">{u.ultimoLogin}</td>
                  <td>
                    <div className="actions">
                      <button className="btn-edit"    onClick={() => router.push(`/admin/users/${u.id}/edit`)}>Editar</button>
                      <button className="btn-danger"  onClick={() => setConfirmDelete(u)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards mobile */}
      {filtrados.length > 0 && (
        <div className="cards">
          {filtrados.map(u => (
            <div key={u.id} className="card-user">
              <div className="row-top">
                <div className="user">
                  <Avatar nombre={u.nombre} foto={u.foto} />
                  <div>
                    <p className="name">{u.nombre}</p>
                    <p className="email">{u.email}</p>
                  </div>
                </div>
                <span className={`status ${estadoColor[u.estado]}`}>
                  <span className="dot" />{u.estado}
                </span>
              </div>
              <div className="row-bottom">
                <span className={`badge ${rolColor[u.rol]}`}>{u.rol}</span>
                <span className="muted">{u.ultimoLogin}</span>
                <div className="actions">
                  <button className="btn-edit"   onClick={() => router.push(`/admin/users/${u.id}/edit`)}>Editar</button>
                  <button className="btn-danger" onClick={() => setConfirmDelete(u)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}