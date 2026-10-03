"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell, MapPin, ChevronDown, Settings, LogOut, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import apiClient from "@/services/apiClient";
import Image from "next/image";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function AppNavbar({
  onMenuClick = () => {},
  showLocation = true,
  roleName = "Usuario",
  profileLink = "/perfil",
  notificationsLink = "/notificaciones",
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const profileRef = useRef(null);

  const [perfil, setPerfil] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!session?.user?.id) return;
    apiClient.get(`/auth/me`)
      .then(r => r.data)
      .then(d => { if (d.ok) setPerfil(d.data); })
      .catch(() => {});
  }, [session?.user?.id]);

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const nombreMostrado = perfil?.nombre || session?.user?.name || roleName;
  const fotoUrl = perfil?.foto || session?.user?.foto || null;
  const iniciales = nombreMostrado
    .split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const ciudad = perfil?.ciudad_activa || perfil?.ciudad_declarada || null;
  const provincia = perfil?.provincia_activa || perfil?.provincia_declarada || null;
  const ubicacionTexto = ciudad
    ? `${ciudad}${provincia ? `, ${provincia}` : ""}`
    : (provincia || null);

  return (
    <header className="home-navbar">
      {/* Hamburger — solo mobile */}
      <button className="home-hamburger" onClick={onMenuClick} aria-label="Abrir menú">
        <Menu size={22} />
      </button>

      <div className="home-navbar-search opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto invisible">
        {/* Espacio reservado para buscador en el futuro */}
      </div>

      <div className="home-navbar-right">
        {/* Contexto Territorial Dinámico */}
        {showLocation && ubicacionTexto && (
          <div className="home-location-badge hidden sm:flex" title="Ubicación">
            <MapPin size={14} className="pin-icon" />
            <span>{ubicacionTexto}</span>
          </div>
        )}

        {/* Notificaciones funcionales con badge y dropdown (HU-22) */}
        {notificationsLink && (
          <NotificationBell notificationsLink={notificationsLink} />
        )}

        {/* Dropdown de perfil */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            onClick={() => setProfileOpen(prev => !prev)}
          >
            <div className="home-profile-text hidden sm:block" style={{ textAlign: "right", lineHeight: 1.3 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#ffffff" }}>
                {nombreMostrado}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "#60a5fa", fontWeight: 600 }}>
                {roleName}
              </p>
            </div>

            <div className="home-avatar" style={{ position: "relative" }}>
              {fotoUrl
                ? <Image src={fotoUrl} alt="avatar" fill unoptimized style={{ objectFit: "cover" }} />
                : iniciales}
            </div>

            <ChevronDown
              size={14}
              style={{
                color: "#cbd5e1",
                transition: "transform 0.2s",
                transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>

          {profileOpen && (
            <div className="home-profile-dropdown">
              <div className="home-profile-dropdown-header">
                <p className="home-profile-dropdown-name">{nombreMostrado}</p>
                <p className="home-profile-dropdown-email">{session?.user?.email}</p>
              </div>

              <div className="home-profile-dropdown-body">
{/* Apariencia switch temporarily removed because it is broken */}

                {profileLink && (
                  <button
                    onClick={() => { setProfileOpen(false); router.push(profileLink); }}
                    className="home-profile-dropdown-item"
                  >
                    <Settings size={15} style={{ color: "var(--home-primary)" }} />
                    Perfil
                  </button>
                )}

                <div className="home-profile-dropdown-divider" />

                <button
                  onClick={async () => {
                    await signOut({ redirect: false });
                    window.location.href = "/login";
                  }}
                  className="home-profile-dropdown-item danger"
                >
                  <LogOut size={15} />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
