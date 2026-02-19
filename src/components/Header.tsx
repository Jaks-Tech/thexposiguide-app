"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ActiveUsersBadge from "./ActiveUsersBadge";
import { PiRobotBold } from "react-icons/pi";

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    loadUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full shadow-2xl">
      
      {/* Main Blue Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-800 via-blue-700 to-gray-900" />

      {/* Subtle Glow Overlay */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)] opacity-40 pointer-events-none" />

      {/* Shimmer Accent Line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-70" />

      <div className="w-full px-6 lg:px-10">
        <nav className="flex items-center justify-between py-4">

          {/* LEFT LOGO */}
          <Link
            href="/"
            className="group flex items-center gap-3 transition-all duration-300"
          >
            <div className="relative">
              <Image
                src="/assets/logo.png"
                alt="The XPosiGuide logo"
                width={44}
                height={44}
                className="rounded-full shadow-lg transition-transform duration-300 group-hover:scale-105"
              />

              {/* Soft Hover Glow */}
              <div className="absolute inset-0 rounded-full bg-blue-400/30 blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                The XPosiGuide
              </span>
              <span className="text-[10px] uppercase tracking-[0.35em] text-blue-200/70">
                Precision Radiography
              </span>
            </div>
          </Link>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            {/* AI Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs text-blue-100 shadow-inner">
              <PiRobotBold className="text-blue-300" size={14} />
              <span className="tracking-wide">AI Powered</span>
            </div>

            {/* Active Users */}
            <div className="transition-all duration-300 hover:scale-105">
              <ActiveUsersBadge />
            </div>

          </div>
        </nav>
      </div>
    </header>
  );
}
