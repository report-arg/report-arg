"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const rolColor    = { admin: "role-admin", moderador: "role-moderator", ciudadano: "role-user" };
const estadoColor = { activo: "status-active", inactivo: "status-inactive" };

function Avatar({ nombre, foto }) {
  if (foto) return <img src={foto} alt={nombre} className="avatar" style={{ objectFit: "cover" }} />;
  const iniciales = (nombre || "?").split(" ").map(n => n[0]).slice(0, 2).join("");
  return <div className="avatar">{iniciales}</div>;
}

export default function UserTable() {
  const router = useRouter();
  const [usuarios, setUsuarios]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [busqueda, setBusqueda]         = useState("");
  const [filtroRol, setFiltroRol]       = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingId, setDeletingId]     = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, [busqueda, filtroRol, filtroEstado]);

  async function fetchUsuarios() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (busqueda)                params.append('busqueda', busqueda);
      if (filtroRol !== 'Todos')   params.append('rol', filtroRol);
      if (filtroEstado !== 'Todos') params.append('estado', filtroEstado);

      const res  = await fetch(`${API_URL}/api/admin/usuarios?${params}`);
      const data = await res.json();
      if (data.ok) {
        setUsuarios(data.data);
      } else {
        setError('Error al cargar usuarios');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  async function eliminar(id) {
    setDeletingId(id);
    try {
      const res  = await fetch(`${API_URL}/api/admin/usuarios/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setUsuarios(prev => prev.filter(u => u.id !== id));
      } else {
        setError(data.mensaje);
      }
    } catch (err) {
      setError('Error al eliminar usuario');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
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
            background: "#fff", borderRadius: 12, padding: 28,
            maxWidth: 380, width: "90%", border: "1px solid var(--color-border)",
          }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#333" }}>¿Eliminar usuario?</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>
              Esta acción no se puede deshacer. Se eliminará a <strong>{confirmDelete.nombre}</strong>.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  padding: "8px 18px", border: "1px solid var(--color-border)",
                  borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer",
                }}
              >Cancelar</button>
              <button
                onClick={() => eliminar(confirmDelete.id)}
                disabled={!!deletingId}
                style={{
                  padding: "8px 18px", background: "var(--color-danger)",
                  color: "#fff", border: "none", borderRadius: 8,
                  fontSize: 13, fontWeight: "bold",
                  cursor: deletingId ? "not-allowed" : "pointer",
                  opacity: deletingId ? 0.7 : 1,
                }}
              >
                {deletingId ? "Eliminando..." : "Eliminar"}
              </button>
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
          <option value="admin">Admin</option>
          <option value="ciudadano">Ciudadano</option>
          <option value="institucion">Institución</option>
        </select>
        <select className="select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="Todos">Estado: Todos</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <p style={{ textAlign: "center", color: "var(--color-danger)", padding: "16px 0", fontSize: 13 }}>
          {error}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <p style={{ textAlign: "center", color: "#aaa", padding: "32px 0", fontSize: 14 }}>
          Cargando usuarios...
        </p>
      )}

      {/* Sin resultados */}
      {!loading && !error && usuarios.length === 0 && (
        <p style={{ textAlign: "center", color: "#aaa", padding: "32px 0", fontSize: 14 }}>
          No se encontraron usuarios con esos criterios.
        </p>
      )}

      {/* Tabla desktop */}
      {!loading && usuarios.length > 0 && (
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
              {usuarios.map((u, i) => (
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
                  <td>
                    <span className={`badge ${rolColor[u.rol] || "role-user"}`}>
                      {u.rol?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${estadoColor[u.estado] || "status-inactive"}`}>
                      <span className="dot" />{u.estado?.toUpperCase()}
                    </span>
                  </td>
                  <td className="muted">{u.ultimoLogin || "Nunca"}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => router.push(`/admin/users/${u.id}/edit`)}
                      >Editar</button>
                      <button
                        className="btn-danger"
                        onClick={() => setConfirmDelete(u)}
                      >Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards mobile */}
      {!loading && usuarios.length > 0 && (
        <div className="cards">
          {usuarios.map(u => (
            <div key={u.id} className="card-user">
              <div className="row-top">
                <div className="user">
                  <Avatar nombre={u.nombre} foto={u.foto} />
                  <div>
                    <p className="name">{u.nombre}</p>
                    <p className="email">{u.email}</p>
                  </div>
                </div>
                <span className={`status ${estadoColor[u.estado] || "status-inactive"}`}>
                  <span className="dot" />{u.estado?.toUpperCase()}
                </span>
              </div>
              <div className="row-bottom">
                <span className={`badge ${rolColor[u.rol] || "role-user"}`}>
                  {u.rol?.toUpperCase()}
                </span>
                <span className="muted">{u.ultimoLogin || "Nunca"}</span>
                <div className="actions">
                  <button
                    className="btn-edit"
                    onClick={() => router.push(`/admin/users/${u.id}/edit`)}
                  >Editar</button>
                  <button
                    className="btn-danger"
                    onClick={() => setConfirmDelete(u)}
                  >Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}