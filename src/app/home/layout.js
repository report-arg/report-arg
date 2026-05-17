"use client";

import { useState } from "react";
import HomeSidebar    from "@/components/home/HomeSidebar";
import HomeNavbar     from "@/components/home/HomeNavbar";
import TrendingSidebar from "@/components/home/TrendingSidebar";
import BottomNav      from "@/components/home/BottomNav";

export default function HomeLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="home-layout">
      <HomeSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="home-main">
        <HomeNavbar onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </div>
      <TrendingSidebar />
      <BottomNav />
    </div>
  );
}
