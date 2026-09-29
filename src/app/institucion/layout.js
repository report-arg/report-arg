"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import AppSidebar from "@/components/layout/AppSidebar";
import AppNavbar from "@/components/layout/AppNavbar";
import AppBottomNav from "@/components/layout/AppBottomNav";
import { Home, FileText, Megaphone, Bell, PlusSquare, Search, Map } from "lucide-react";

const INSTITUCION_NAVIGATION = [
  { href: "/institucion",              label: "Inicio",         icon: Home },
  { href: "/institucion/explorar",     label: "Explorar",       icon: Search },
  { href: "/institucion/reclamos",     label: "Reclamos",       icon: FileText },
  { href: "/institucion/mapa",         label: "Mapa",           icon: Map },
  { href: "/institucion/comunicados",  label: "Comunicados",    icon: Megaphone },
  { href: "/institucion/notificaciones",label: "Notificaciones",icon: Bell },
];

export default function InstitucionLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const sidebar = (
    <AppSidebar
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      navigation={INSTITUCION_NAVIGATION}
      subtitle="PORTAL INSTITUCIONAL"
      logoHref="/institucion"
      footerLinks={[{ href: "/institucion/perfil", label: "Mi Institución", icon: null }]} // Opciones específicas del footer si las hay
    />
  );

  const navbar = (
    <AppNavbar
      onMenuClick={() => setSidebarOpen(true)}
      showLocation={true}
      roleName="Institución"
      profileLink="/institucion/perfil"
      notificationsLink="/institucion/notificaciones"
    />
  );

  const bottomNav = (
    <AppBottomNav
      tabs={[
        { href: "/institucion",              label: "Inicio",         icon: Home },
        { href: "/institucion/explorar",     label: "Explorar",       icon: Search },
        { href: "/institucion/reclamos",     label: "Reclamos",       icon: FileText },
        { href: "/institucion/mapa",         label: "Mapa",           icon: Map },
        { href: "/institucion/comunicados",  label: "Comunicados",    icon: Megaphone },
        { href: "/institucion/notificaciones",label: "Alertas",       icon: Bell },
      ]}
    />
  );

  return (
    <AppShell sidebar={sidebar} navbar={navbar} bottomNav={bottomNav}>
      {children}
    </AppShell>
  );
}
