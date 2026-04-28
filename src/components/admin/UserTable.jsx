"use client";



const usuarios = [
  { id: 1, nombre: "Mateo Sánchez", email: "mateo.sanchez@provincia.gob.ar", rol: "ADMIN", estado: "ACTIVO", ultimoLogin: "Hoy, 09:42" },
  { id: 2, nombre: "Lucía Fernández", email: "l.fernandez@gmail.com", rol: "MODERADOR", estado: "ACTIVO", ultimoLogin: "24 oct, 2023" },
  { id: 3, nombre: "Agustín Valenzuela", email: "agustin.val@outlook.com", rol: "CIUDADANO", estado: "INACTIVO", ultimoLogin: "Nunca" },
  { id: 4, nombre: "Sofía Martínez", email: "sofi.martinez@gmail.com", rol: "CIUDADANO", estado: "ACTIVO", ultimoLogin: "Hace 2 días" },
];

const rolColor = {
  ADMIN: "role-admin",
  MODERADOR: "role-moderator",
  CIUDADANO: "role-user",
};

const estadoColor = {
  ACTIVO: "status-active",
  INACTIVO: "status-inactive",
};

function Avatar({ nombre }) {
  const iniciales = nombre.split(" ").map(n => n[0]).slice(0, 2).join("");

  return (
    <div className="avatar">
      {iniciales}
    </div>
  );
}

function RolBadge({ rol }) {
  return <span className={`badge ${rolColor[rol]}`}>{rol}</span>;
}

function EstadoBadge({ estado }) {
  return (
    <span className={`status ${estadoColor[estado]}`}>
      <span className="dot" />
      {estado}
    </span>
  );
}

export default function UserTable() {
  return (
    <div className="card">

      {/* FILTROS */}
      <div className="table-filters">
        <input type="text" placeholder="Buscar por nombre o email..." className="input" />

        <select className="select">
          <option>Rol: Todos</option>
          <option>Admin</option>
          <option>Moderador</option>
          <option>Ciudadano</option>
        </select>

        <select className="select">
          <option>Estado: Todos</option>
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
      </div>

      {/* TABLE DESKTOP */}
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
                    <Avatar nombre={u.nombre} />
                    <div>
                      <p className="name">{u.nombre}</p>
                      <p className="email">{u.email}</p>
                    </div>
                  </div>
                </td>

                <td><RolBadge rol={u.rol} /></td>
                <td><EstadoBadge estado={u.estado} /></td>
                <td className="muted">{u.ultimoLogin}</td>

                <td>
                  <div className="actions">
                    <button className="btn-edit">Editar</button>
                    <button className="btn-danger">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="cards">
        {usuarios.map(u => (
          <div key={u.id} className="card-user">

            <div className="row-top">
              <div className="user">
                <Avatar nombre={u.nombre} />
                <div>
                  <p className="name">{u.nombre}</p>
                  <p className="email">{u.email}</p>
                </div>
              </div>

              <EstadoBadge estado={u.estado} />
            </div>

            <div className="row-bottom">
              <RolBadge rol={u.rol} />
              <span className="muted">{u.ultimoLogin}</span>

              <div className="actions">
                <button className="btn-edit">Editar</button>
                <button className="btn-danger">Eliminar</button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}