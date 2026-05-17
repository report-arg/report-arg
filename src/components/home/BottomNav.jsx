"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, FileText, Bell } from "lucide-react";

const tabs = [
  { href: "/home",          label: "Inicio",    icon: Home     },
  { href: "/home/explorar", label: "Explorar",  icon: Search   },
  { href: "/home/reclamos", label: "Reclamos",  icon: FileText },
  { href: "/home/alertas",  label: "Alertas",   icon: Bell     },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="home-bottom-nav">
      <div className="home-bottom-nav-items">
        {tabs.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`home-bottom-nav-item ${pathname === href ? "active" : ""}`}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
