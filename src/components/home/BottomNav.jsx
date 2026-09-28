"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, FileText, Activity, Megaphone, Shield } from "lucide-react";
import { ReportProblemIcon } from "@/components/brand/icons";

export default function BottomNav({ role = "ciudadano" }) {
  const pathname = usePathname();
  const router   = useRouter();

  // Botón central diferente por rol
  const ctaHref =
    role === "admin"       ? "/admin"                              :
    role === "institucion" ? "/home/institucion/comunicados/nuevo" :
                             "/home/reclamos/nuevo";

  const CtaIcon =
    role === "admin"       ? Shield            :
    role === "institucion" ? Megaphone         :
                             ReportProblemIcon;

  const ctaLabel =
    role === "admin"       ? "Admin"      :
    role === "institucion" ? "Comunicado" :
                             "Reportar";

  const tabs = [
    { href: "/home",          label: "Inicio",    icon: Home     },
    { href: "/home/explorar", label: "Explorar",  icon: Search   },
    null, // hueco para el CTA central
    { href: "/home/reclamos", label: "Reclamos",  icon: FileText },
    { href: "/home/actividad",label: "Actividad", icon: Activity },
  ];

  return (
    <nav className="home-bottom-nav">
      <div className="home-bottom-nav-items">
        {tabs.map((tab, i) =>
          tab === null ? (
            <button
              key="cta"
              className="home-bottom-cta"
              onClick={() => router.push(ctaHref)}
              title={ctaLabel}
            >
              <CtaIcon size={22} />
              <span>{ctaLabel}</span>
            </button>
          ) : (
            <Link
              key={tab.href}
              href={tab.href}
              className={`home-bottom-nav-item ${pathname === tab.href ? "active" : ""}`}
            >
              <tab.icon size={20} />
              {tab.label}
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
