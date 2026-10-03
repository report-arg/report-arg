"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import AppSidebar from "@/components/layout/AppSidebar";
import AppNavbar from "@/components/layout/AppNavbar";
import AppBottomNav from "@/components/layout/AppBottomNav";
import { Home, Search, FileText, Map, Bell, PlusSquare } from "lucide-react";
import { ReportProblemIcon } from "@/components/brand/icons";

const CITIZEN_NAVIGATION = [
  { href: "/ciudadano",               label: "Inicio",         icon: Home },
  { href: "/ciudadano/explorar",      label: "Explorar",       icon: Search },
  { href: "/ciudadano/reclamos",      label: "Mis Reclamos",   icon: FileText },
  { href: "/ciudadano/mapa",          label: "Mapa",           icon: Map },
  { href: "/ciudadano/notificaciones",label: "Notificaciones", icon: Bell },
];

export default function CiudadanoLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const sidebar = (
    <AppSidebar
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      navigation={CITIZEN_NAVIGATION}
      subtitle="EXPERIENCIA CIUDADANA"
      logoHref="/ciudadano"
    />
  );

  const navbar = (
    <AppNavbar
      onMenuClick={() => setSidebarOpen(true)}
      showLocation={true}
      roleName="Ciudadano"
      profileLink="/profile"
      notificationsLink="/ciudadano/notificaciones"
    />
  );

  const bottomNav = (
    <AppBottomNav
      tabs={[
        { href: "/ciudadano",               label: "Inicio",         icon: Home },
        { href: "/ciudadano/explorar",      label: "Explorar",       icon: Search },
        { href: "/ciudadano/reclamos",      label: "Mis Reclamos",   icon: FileText },
        { href: "/ciudadano/mapa",          label: "Mapa",           icon: Map },
        { href: "/ciudadano/notificaciones",label: "Notificaciones", icon: Bell },
      ]}
    />
  );

  return (
    <AppShell sidebar={sidebar} navbar={navbar} bottomNav={bottomNav}>
      {children}
    </AppShell>
  );
}
