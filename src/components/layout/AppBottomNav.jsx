"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AppBottomNav({ tabs = [], cta = null }) {
  const pathname = usePathname();
  const router   = useRouter();

  return (
    <nav className="home-bottom-nav">
      <div className="home-bottom-nav-items">
        {tabs.map((tab, i) => {
          if (tab === null) {
            // Render the CTA slot
            if (!cta) return <div key="empty-cta" />;
            const { href, label, icon: Icon } = cta;
            return (
              <button
                key="cta"
                className="home-bottom-cta"
                onClick={() => router.push(href)}
                title={label}
              >
                {Icon && <Icon size={22} />}
                <span>{label}</span>
              </button>
            );
          }

          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`home-bottom-nav-item ${isActive ? "active" : ""}`}
            >
              {tab.icon && <tab.icon size={20} />}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
