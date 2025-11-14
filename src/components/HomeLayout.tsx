"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

import {
  FiHome,
  FiArrowUpCircle,
  FiArrowDownCircle,
  FiCpu,
  FiBookOpen,
  FiAperture,
  FiMenu,
  FiX,
} from "react-icons/fi";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/", icon: <FiHome size={20} className="text-blue-600" /> },
    { name: "Upper Extremities", href: "/upper-extremities", icon: <FiArrowUpCircle size={20} className="text-emerald-600" /> },
    { name: "Lower Extremities", href: "/lower-extremities", icon: <FiArrowDownCircle size={20} className="text-rose-600" /> },
    { name: "Pelvic Girdle/Vertebral Column", href: "/pelvic-girdle", icon: <FiAperture size={20} className="text-purple-600" /> },
    { name: "XPosiLearn", href: "/xposilearn", icon: <FiBookOpen size={20} className="text-amber-600" /> },
    { name: "XPosi AI", href: "/xposi-ai", icon: <FiCpu size={20} className="text-cyan-600" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 text-slate-900">
      
      {/* █████ MOBILE MENU BUTTON (CSS auto spacing) █████ */}
      <button
        className="md:hidden fixed left-4 z-50 bg-white p-2 rounded-lg shadow-md border border-slate-200 transition-all"
        style={{ top: "var(--header-space)" }}  // 👈 CSS variable handles spacing
        onClick={() => setMobileOpen(true)}
      >
        <FiMenu size={22} className="text-blue-700" />
      </button>

      {/* █████ MOBILE SIDEBAR █████ */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white w-72 border-r shadow-lg z-50 p-4 transform md:hidden transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between mb-4">
          <span className="text-lg font-bold text-blue-700">XPosiGuide</span>
          <button onClick={() => setMobileOpen(false)}>
            <FiX size={22} />
          </button>
        </div>

        <nav className="space-y-3">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                pathname === item.href
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-blue-50 text-slate-700"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* █████ DESKTOP SIDEBAR █████ */}
      <aside
        className={`hidden md:flex flex-col bg-white/80 border-r shadow-lg ${
          collapsed ? "w-20" : "w-72"
        } transition-all`}
      >
        <div className="px-4 py-4 flex justify-between items-center border-b">
          <div className="flex items-center gap-3">
            <Image src="/assets/logo.png" width={40} height={40} alt="logo" />
            {!collapsed && <span className="font-bold text-blue-700">The XPosiGuide</span>}
          </div>

        <button onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        <nav className="px-2 py-4 space-y-3">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                pathname === item.href
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-blue-50 text-slate-700"
              }`}
            >
              {item.icon}
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* █████ MAIN CONTENT █████ */}
      <main className="flex-1 px-6 lg:px-10 py-10 mx-auto max-w-5xl">
        {children}
      </main>
    </div>
  );
}
