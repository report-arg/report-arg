"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, HelpCircle, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

const resultadosMock = [
  { tipo: "Usuario",  label: "Mateo Sánchez",       sub: "mateo.sanchez@provincia.gob.ar", href: "/admin/users/1/edit" },
  { tipo: "Usuario",  label: "Lucía Fernández",      sub: "l.fernandez@gmail.com",          href: "/admin/users/2/edit" },
  { tipo: "Usuario",  label: "Agustín Valenzuela",   sub: "agustin.val@outlook.com",        href: "/admin/users/3/edit" },
  { tipo: "Usuario",  label: "Sofía Martínez",       sub: "sofi.martinez@gmail.com",        href: "/admin/users/4/edit" },
  { tipo: "Rol",      label: "Super Admin",          sub: "Acceso total",                   href: "/admin/roles" },
  { tipo: "Rol",      label: "Moderador",            sub: "Control de contenido",           href: "/admin/roles" },
  { tipo: "Rol",      label: "Editor",               sub: "Gestión de reportes",            href: "/admin/roles" },
  { tipo: "Reporte",  label: "Bache en Av. Corrientes 1240",   sub: "Abierto · San Martín",  href: "/admin" },
  { tipo: "Reporte",  label: "Luminaria apagada — Belgrano 450", sub: "En proceso · Centro", href: "/admin" },
  { tipo: "Reporte",  label: "Contenedor de basura desbordado",  sub: "Abierto · Palermo",   href: "/admin" },
  { tipo: "Sección",  label: "Usuarios",             sub: "Gestión de usuarios",            href: "/admin/users" },
  { tipo: "Sección",  label: "Configuración",        sub: "Parámetros del sistema",         href: "/admin/settings" },
  { tipo: "Sección",  label: "Roles y Permisos",     sub: "Gestión de roles",               href: "/admin/roles" },
];

const tipoBadgeStyle = {
  Usuario:  { background: "#E6F1FB", color: "#0C447C" },
  Rol:      { background: "#EEEDFE", color: "#3C3489" },
  Reporte:  { background: "#EAF3DE", color: "#27500A" },
  Sección:  { background: "#F1EFE8", color: "#444441" },
};

function FaqItem({ item, last }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div
      onClick={() => setAbierto(prev => !prev)}
      style={{
        padding: "10px 16px", cursor: "pointer",
        borderBottom: last ? "none" : "1px solid var(--color-border)",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#f9f9f9"}
      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#333", fontWeight: 500 }}>{item.pregunta}</p>
        <span style={{ color: "#aaa", fontSize: 16, flexShrink: 0 }}>{abierto ? "−" : "+"}</span>
      </div>
      {abierto && (
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#666", lineHeight: 1.5 }}>{item.resp}</p>
      )}
    </div>
  );
}

export default function Navbar({ section = "Dashboard", onMenuClick }) {
  const router = useRouter();
  const [query, setQuery]           = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef                   = useRef(null);

  const resultados = query.trim().length >= 1
    ? resultadosMock.filter(r =>
        r.label.toLowerCase().includes(query.toLowerCase()) ||
        r.sub.toLowerCase().includes(query.toLowerCase())  ||
        r.tipo.toLowerCase().includes(query.toLowerCase())
      )
    : [];
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);
    const notificaciones = [
      { id: 1, titulo: "Nuevo reporte creado",          sub: "Bache en Av. Corrientes 1240",     tiempo: "Hace 12 min", leida: false },
      { id: 2, titulo: "Reporte actualizado",           sub: "Luminaria apagada — Belgrano 450", tiempo: "Hace 1h",     leida: false },
      { id: 3, titulo: "Usuario registrado",            sub: "sofi.martinez@gmail.com",          tiempo: "Hace 3h",     leida: false },
      { id: 4, titulo: "Reporte resuelto",              sub: "Árbol caído sobre vereda",         tiempo: "Ayer, 18:40", leida: true  },
      { id: 5, titulo: "Cambio de rol aplicado",        sub: "Agustín Valenzuela → Moderador",   tiempo: "Ayer, 14:15", leida: true  },
    ];
    const [notifs, setNotifs] = useState(notificaciones);
    const noLeidas = notifs.filter(n => !n.leida).length;
    const [helpOpen, setHelpOpen] = useState(false);
    const helpRef = useRef(null);


  // Cerrar al hacer click afuera
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(e.target)) {
        setHelpOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function irA(href) {
    setQuery("");
    setSearchOpen(false);
    router.push(href);
  }

  return (
    <header className="navbar">

      {/* Izquierda */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="navbar-hamburger" onClick={onMenuClick}>
          <Menu size={22} />
        </button>
        <div className="navbar-breadcrumb">
          <span className="hide-mobile">ADMIN PANEL</span>
          <span className="hide-mobile">›</span>
          <span className="navbar-section">{section.toUpperCase()}</span>
        </div>
      </div>

      {/* Centro — búsqueda */}
      <div ref={searchRef} className="navbar-search-wrapper hide-mobile" style={{ position: "relative" }}>
        <Search size={14} className="navbar-search-icon" />
        <input
          type="text"
          placeholder="Buscar usuarios, roles, reportes..."
          className="navbar-search"
          value={query}
          onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
        />
        {query && (
          <X
            size={14}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#aaa" }}
            onClick={() => { setQuery(""); setSearchOpen(false); }}
          />
        )}

        {/* Dropdown resultados */}
        {searchOpen && query.trim().length >= 1 && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
            background: "#fff", border: "1px solid var(--color-border)",
            borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            zIndex: 999, maxHeight: 320, overflowY: "auto",
          }}>
            {resultados.length === 0 ? (
              <p style={{ padding: "14px 16px", fontSize: 13, color: "#aaa", margin: 0 }}>
                Sin resultados para "{query}"
              </p>
            ) : (
              resultados.map((r, i) => (
                <div
                  key={i}
                  onClick={() => irA(r.href)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", cursor: "pointer",
                    borderBottom: i < resultados.length - 1 ? "1px solid var(--color-border)" : "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f9f9f9"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    ...tipoBadgeStyle[r.tipo],
                    flexShrink: 0,
                  }}>{r.tipo}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: "#333", fontWeight: 500 }}>{r.label}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{r.sub}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Derecha */}
       <div className="navbar-right">

      {/* Campanita */}
       <div ref={notifRef} style={{ position: "relative" }}>
        <div onClick={() => setNotifOpen(prev => !prev)} style={{ position: "relative", cursor: "pointer" }}>
        <Bell size={18} style={{ color: noLeidas > 0 ? "var(--color-primary)" : "#aaa" }} />
         {noLeidas > 0 && (
        <span style={{
          position: "absolute", top: -5, right: -5,
          background: "var(--color-danger)", color: "#fff",
          fontSize: 9, fontWeight: "bold", borderRadius: "50%",
          width: 14, height: 14, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>{noLeidas}</span>
       )}
    </div>

    {notifOpen && (
      <div style={{
        position: "absolute", top: "calc(100% + 12px)", right: 0,
        width: 320, background: "#fff",
        border: "1px solid var(--color-border)", borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)", zIndex: 999,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 16px", borderBottom: "1px solid var(--color-border)",
        }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: "bold", color: "#333" }}>
            Notificaciones {noLeidas > 0 && <span style={{ color: "var(--color-danger)" }}>({noLeidas})</span>}
          </p>
          {noLeidas > 0 && (
            <button
              onClick={() => setNotifs(prev => prev.map(n => ({ ...n, leida: true })))}
              style={{ fontSize: 11, color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer" }}
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          {notifs.length === 0 ? (
            <p style={{ padding: "20px 16px", fontSize: 13, color: "#aaa", margin: 0, textAlign: "center" }}>
              Sin notificaciones
            </p>
          ) : (
            notifs.map((n, i) => (
              <div
                key={n.id}
                onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, leida: true } : x))}
                style={{
                  display: "flex", gap: 10, padding: "12px 16px", cursor: "pointer",
                  background: n.leida ? "#fff" : "#f0f4ff",
                  borderBottom: i < notifs.length - 1 ? "1px solid var(--color-border)" : "none",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f9f9f9"}
                onMouseLeave={e => e.currentTarget.style.background = n.leida ? "#fff" : "#f0f4ff"}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                  background: n.leida ? "transparent" : "var(--color-primary)",
                }} />
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 13, color: "#333", fontWeight: n.leida ? 400 : 600 }}>{n.titulo}</p>
                  <p style={{ margin: "0 0 2px", fontSize: 12, color: "#666" }}>{n.sub}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{n.tiempo}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )}
  </div>

  {/* Ayuda */}
  <div ref={helpRef} style={{ position: "relative" }} className="hide-mobile">
  <HelpCircle
    size={18}
    style={{ cursor: "pointer", color: helpOpen ? "var(--color-primary)" : "#aaa" }}
    onClick={() => setHelpOpen(prev => !prev)}
  />

  {helpOpen && (
    <div style={{
      position: "absolute", top: "calc(100% + 12px)", right: 0,
      width: 340, background: "#fff",
      border: "1px solid var(--color-border)", borderRadius: 10,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)", zIndex: 999,
    }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: "bold", color: "#333" }}>Centro de Ayuda</p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#aaa" }}>Preguntas frecuentes y soporte</p>
      </div>

      <div style={{ padding: "8px 0" }}>
        {[
          { pregunta: "¿Cómo creo un nuevo usuario?",         resp: "Ir a Usuarios › + Crear Usuario y completar el formulario." },
          { pregunta: "¿Cómo cambio los permisos de un rol?", resp: "Ir a Roles y Permisos, seleccionar el rol y modificar la matriz de permisos." },
          { pregunta: "¿Cómo resuelvo un reporte?",           resp: "Desde el Dashboard, hacer click en el reporte y cambiar su estado a Resuelto." },
          { pregunta: "¿Cómo configuro notificaciones?",      resp: "Ir a Configuración › Notificaciones y activar las que necesitás." },
          { pregunta: "¿Cómo cambio el logo del sistema?",    resp: "Ir a Configuración › Parámetros generales y subir una nueva imagen." },
        ].map((item, i, arr) => (
          <FaqItem key={i} item={item} last={i === arr.length - 1} />
        ))}
      </div>

      <div style={{
        padding: "12px 16px", borderTop: "1px solid var(--color-border)",
        display: "flex", justifyContent: "center",
      }}>
        <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>
          ¿Necesitás más ayuda? Escribinos a{" "}
          <span
            style={{ color: "var(--color-primary)", cursor: "pointer" }}
            onClick={() => window.open("mailto:soporte@reportarg.gob.ar", "_blank")}
          >
            soporte@reportarg.gob.ar
          </span>
        </p>
      </div>
    </div>
  )}
</div>

  <div className="navbar-user">
    <div className="navbar-user-info hide-mobile">
      <p className="navbar-user-name">Admin Root</p>
      <p className="navbar-user-role">Super Administrador</p>
    </div>
    <div className="navbar-avatar">A</div>
  </div>

</div>
  </header>
  );
}