"use client";

import { createContext, useContext, useState } from "react";
import { ROLES } from "@/lib/roles";

const AuthContext = createContext(null);

// Usuario de prueba — esto después lo reemplazamos
// con la autenticación real (JWT, NextAuth, etc.)
const USUARIOS_PRUEBA = {
  ciudadano: {
    id: 1,
    nombre: "Juan Pérez",
    email: "juan@email.com",
    rol: ROLES.CIUDADANO,
  },
  institucion: {
    id: 2,
    nombre: "Municipalidad de José C. Paz",
    email: "municipio@josecpaz.gob.ar",
    rol: ROLES.INSTITUCION,
  },
  admin: {
    id: 3,
    nombre: "Admin ReportARG",
    email: "admin@reportarg.com",
    rol: ROLES.ADMIN,
  },
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  // Simula el login — después se reemplaza con llamada a la API real
  function login(rol) {
    const usuarioPrueba = USUARIOS_PRUEBA[rol];
    if (usuarioPrueba) {
      setUsuario(usuarioPrueba);
    }
  }

  function logout() {
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  }
  return context;
}