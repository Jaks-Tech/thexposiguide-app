"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ActiveUsersBadge from "./ActiveUsersBadge";
import { FiMenu, FiChevronDown } from "react-icons/fi";

import { MdHome, MdMenuBook } from "react-icons/md";
import { PiRobotBold } from "react-icons/pi";
import { GiHand, GiLeg, GiPelvisBone } from "react-icons/gi";
import { FaUserCircle } from "react-icons/fa";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<any>(null);

  // 🔹 Load Supabase Auth User
  useEffect(() => {
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Loads the currently authenticated user from Supabase
 * and sets the user state with the fetched user data.
 * @returns {Promise<void>} Resolves when the user is loaded.
 */
/*******  c00f928d-b1e9-4e80-a0e8-54bbceb28e4f  *******/
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    loadUser();
  }, []);

  // 🔹 MODULE LINKS
  const moduleLinks = [
    {
      name: "Upper Extremities",
      href: "/upper-extremities",
      icon: <GiHand size={20} className="text-teal-600" />,
    },
    {
      name: "Lower Extremities",
      href: "/lower-extremities",
      icon: <GiLeg size={20} className="text-green-600" />,
    },
    {
      name: "Pelvic Girdle / Vertebral Column",
      href: "/pelvic-girdle",
      icon: <GiPelvisBone size={20} className="text-orange-600" />,
    },
  ];

  const topLinks = [
    {
      name: "Home",
      href: "/",
      icon: <MdHome size={20} className="text-blue-600" />,
    },
  ];

  // Close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setModulesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
    setModulesOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-800 via-blue-700 to-gray-900 text-white shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between w-full py-3">

          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/logo.png"
              alt="The XPosiGuide logo"
              width={40}
              height={40}
              className="rounded-full shadow-sm"
            />
            <span className="text-lg font-bold tracking-wide">The XPosiGuide</span>
          </Link>

          {/* RIGHT SIDE: PROFILE + MENU */}
          <div className="flex items-center gap-4">
            
          {/* ACTIVE USERS BADGE */}
          <ActiveUsersBadge />

           {/* DROPDOWN MENU BUTTON */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-full hover:bg-white/10 transition"
              >
                <FiMenu size={24} />
              </button>

              {/* ▼ Dropdown ▼ */}
              {open && (
                <div className="
                  absolute right-0 mt-3 w-72 bg-white text-slate-800 shadow-xl 
                  rounded-xl border border-slate-200 py-2
                ">
                  {topLinks.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-4 py-2 text-sm rounded-lg
                          ${active ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-blue-50"}
                        `}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    );
                  })}

                  {/* EXPLORE PROJECTIONS */}
                  <button
                    onClick={() => setModulesOpen(!modulesOpen)}
                    className="
                      flex items-center justify-between w-full px-4 py-2 mt-1 mb-1 text-sm rounded-lg
                      hover:bg-blue-50 transition
                    "
                  >
                    <div className="flex items-center gap-3">
                      <GiPelvisBone size={20} className="text-blue-700" />
                      Explore Projections
                    </div>
                    <FiChevronDown
                      className={`transition-transform ${modulesOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {modulesOpen && (
                    <div className="pl-8 pr-4 py-1 space-y-1">
                      {moduleLinks.map((item) => {
                        const active = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`
                              flex items-center gap-2 px-3 py-1.5 text-sm rounded-md
                              ${active ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-blue-50"}
                            `}
                          >
                            {item.icon}
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* XPosiLearn */}
                  <Link
                    href="/xposilearn"
                    className={`
                      flex items-center gap-3 px-4 py-2 text-sm rounded-lg mt-1
                      ${pathname === "/xposilearn" ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-blue-50"}
                    `}
                  >
                    <MdMenuBook size={20} className="text-indigo-600" />
                    XPosiLearn
                  </Link>

                  {/* XPosi AI */}
                  <Link
                    href="/xposi-ai"
                    className={`
                      flex items-center gap-3 px-4 py-2 text-sm rounded-lg
                      ${pathname === "/xposi-ai" ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-blue-50"}
                    `}
                  >
                    <PiRobotBold size={20} className="text-purple-600" />
                    XPosi AI
                  </Link>
                </div>
              )}
            </div>

          </div>
        </nav>
      </div>
    </header>
  );
}
