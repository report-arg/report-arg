"use client";

import { useAuthContext } from "@/context/authContext";
import { tienePermiso, puedeAccederRuta } from "@/lib/roles";

export function useAuth() {
  const { usuario, login, logout } = useAuthContext();

  return {
    usuario,
    login,
    logout,
    rol: usuario?.rol ?? null,
    estaLogueado: !!usuario,
    esCiudadano: usuario?.rol === "ciudadano",
    esInstitucion: usuario?.rol === "institucion",
    esAdmin: usuario?.rol === "admin",

    // Verifica si el usuario actual tiene un permiso específico
    // Uso: puede("CREAR_RECLAMO")
    puede: (permiso) => tienePermiso(usuario?.rol, permiso),

    // Verifica si el usuario puede acceder a una ruta
    // Uso: puedeVerRuta("/dashboard/admin")
    puedeVerRuta: (ruta) => puedeAccederRuta(usuario?.rol, ruta),
  };
}