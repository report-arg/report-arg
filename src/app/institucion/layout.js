"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import AppShell from "@/components/layout/AppShell";
import AppSidebar from "@/components/layout/AppSidebar";
import AppNavbar from "@/components/layout/AppNavbar";
import AppBottomNav from "@/components/layout/AppBottomNav";
import apiClient from "@/services/apiClient";
import { InstitucionContext } from "@/context/InstitucionContext";
import { Home, FileText, Megaphone, Bell, Search, Map, BarChart3 } from "lucide-react";

const STORAGE_KEY_PERFIL = "reportarg_inst_perfil";

const BASE_INSTITUCION_NAVIGATION = [
  { href: "/institucion",               label: "Inicio",         icon: Home,      requiresVerification: false },
  { href: "/institucion/explorar",      label: "Explorar",       icon: Search,    requiresVerification: false },
  { href: "/institucion/reclamos",      label: "Reclamos",       icon: FileText,  requiresVerification: true },
  { href: "/institucion/informes",      label: "Informes",       icon: BarChart3, requiresVerification: true },
  { href: "/institucion/comunicados",   label: "Comunicados",    icon: Megaphone, requiresVerification: true },
  { href: "/institucion/mapa",          label: "Mapa",           icon: Map,       requiresVerification: false },
  { href: "/institucion/notificaciones",label: "Notificaciones", icon: Bell,      requiresVerification: false },
];

const RUTAS_BLOQUEADAS_SIN_VERIFICAR = [
  "/institucion/reclamos",
  "/institucion/informes",
  "/institucion/comunicados",
];

function leerPerfilCacheado() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_PERFIL);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function InstitucionLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [perfilInstitucion, setPerfilInstitucion] = useState(() => leerPerfilCacheado());
  const [loadingPerfil, setLoadingPerfil] = useState(() => !leerPerfilCacheado());

  // Determinar sincrónicamente desde el primer render si la institución no está verificada
  const noVerificada = useMemo(() => {
    if (perfilInstitucion) {
      return (
        perfilInstitucion.institucion_verificada === false ||
        Number(perfilInstitucion.institucion_verificada) === 0
      );
    }
    if (session?.user?.institucionVerificada !== undefined && session?.user?.institucionVerificada !== null) {
      return (
        session.user.institucionVerificada === false ||
        Number(session.user.institucionVerificada) === 0
      );
    }
    return false;
  }, [perfilInstitucion, session]);

  const motivoBloqueo = useMemo(() => {
    const status = perfilInstitucion?.institucion_status || session?.user?.institucionStatus;
    if (status === "rejected" || perfilInstitucion?.motivo_rechazo) {
      return "Solicitud rechazada — sin permisos operativos";
    }
    return "Pendiente de verificación";
  }, [perfilInstitucion, session]);

  const actualizarPerfilInstitucion = (nuevoPerfil) => {
    setPerfilInstitucion(nuevoPerfil);
    if (typeof window !== "undefined" && nuevoPerfil) {
      try {
        sessionStorage.setItem(STORAGE_KEY_PERFIL, JSON.stringify(nuevoPerfil));
      } catch {
        // Ignorar cuota de sessionStorage
      }
    }
  };

  useEffect(() => {
    let active = true;
    apiClient
      .get("/auth/me")
      .then((res) => {
        if (!active) return;
        const perfil = res.data?.data || res.data?.user || null;
        if (perfil) {
          actualizarPerfilInstitucion(perfil);
        }
      })
      .catch(() => {
        // Silencioso en layout
      })
      .finally(() => {
        if (active) setLoadingPerfil(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!noVerificada || !pathname) return;
    const intentaRutaRestringida = RUTAS_BLOQUEADAS_SIN_VERIFICAR.some(
      (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
    );
    if (intentaRutaRestringida) {
      router.replace("/institucion");
    }
  }, [noVerificada, pathname, router]);

  const navigationItems = useMemo(
    () =>
      BASE_INSTITUCION_NAVIGATION.map((item) => ({
        ...item,
        disabled: Boolean(noVerificada && item.requiresVerification),
        disabledReason: motivoBloqueo,
      })),
    [noVerificada, motivoBloqueo]
  );

  const sidebar = (
    <AppSidebar
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      navigation={navigationItems}
      subtitle="PORTAL INSTITUCIONAL"
      logoHref="/institucion"
      footerLinks={[{ href: "/profile", label: "Mi Institución", icon: null }]}
    />
  );

  const navbar = (
    <AppNavbar
      onMenuClick={() => setSidebarOpen(true)}
      showLocation={true}
      roleName="Institución"
      profileLink="/profile"
      notificationsLink="/institucion/notificaciones"
    />
  );

  const bottomNav = (
    <AppBottomNav
      tabs={[
        { href: "/institucion",               label: "Inicio",   icon: Home },
        {
          href: "/institucion/reclamos",
          label: "Reclamos",
          icon: FileText,
          disabled: noVerificada,
          disabledReason: motivoBloqueo,
        },
        {
          href: "/institucion/informes",
          label: "Informes",
          icon: BarChart3,
          disabled: noVerificada,
          disabledReason: motivoBloqueo,
        },
        { href: "/institucion/notificaciones", label: "Alertas", icon: Bell },
      ]}
    />
  );

  const contextValue = useMemo(
    () => ({
      perfilInstitucion,
      noVerificada,
      loadingPerfil,
      actualizarPerfilInstitucion,
    }),
    [perfilInstitucion, noVerificada, loadingPerfil]
  );

  return (
    <InstitucionContext.Provider value={contextValue}>
      <AppShell sidebar={sidebar} navbar={navbar} bottomNav={bottomNav}>
        {children}
      </AppShell>
    </InstitucionContext.Provider>
  );
}
