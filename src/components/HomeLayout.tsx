"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";

// Colored Icons
import {
  FiHome,
  FiArrowUpCircle,
  FiArrowDownCircle,
  FiCpu,
  FiBookOpen,
  FiAperture,
} from "react-icons/fi";

// Import dynamic header height
import { useHeaderHeight } from "@/contexts/HeaderHeightContext";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const headerHeight = useHeaderHeight(); // 🔥 read dynamic header height
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

      {/* █████ MOBILE MENU BUTTON (auto-positioned below header) █████ */}
      <button
        className="md:hidden fixed left-4 z-50 bg-white p-2 rounded-lg shadow-md border border-slate-200 transition-all"
        style={{ top: headerHeight + 12 }} 
        onClick={() => setMobileOpen(true)}
      >
        <FiMenu size={22} className="text-blue-700" />
      </button>

      {/* MOBILE OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity md:hidden ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      ></div>

      {/* MOBILE SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white shadow-xl border-r border-slate-200 z-50
          p-4 w-72 transform transition-transform md:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Mobile Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-blue-700 text-xl">XPosiGuide</span>
          <button onClick={() => setMobileOpen(false)}>
            <FiX size={22} className="text-slate-600" />
          </button>
        </div>

        {/* Mobile Nav Links */}
        <nav className="space-y-2">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
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
        className={`hidden md:flex flex-col backdrop-blur-xl
          ${collapsed ? "w-20" : "w-72"}
          bg-white/80 border-r border-slate-200 shadow-lg sticky top-0 h-screen
          transition-all duration-300 ease-in-out`}
      >
        {/* Desktop Logo Row */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo.png"
              width={40}
              height={40}
              alt="XPosiGuide logo"
              className="rounded-full shadow-sm"
            />
            {!collapsed && (
              <span className="font-bold text-blue-700 text-lg">The XPosiGuide</span>
            )}
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-500 hover:text-blue-600 text-xl"
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          {navLinks.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium border-l-4
                  ${
                    active
                      ? "bg-blue-100/70 border-blue-600 text-blue-700 shadow-inner"
                      : "border-transparent text-slate-600 hover:bg-white/70 hover:shadow-sm"
                  }`}
              >
                {item.icon}
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* █████ MAIN CONTENT █████ */}
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-10 max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  );
}
