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

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    loadUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-800 via-blue-700 to-gray-900 text-white shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between w-full py-3">

          {/* LEFT LOGO */}
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

          {/* RIGHT AREA */}
          <div className="flex items-center gap-3 sm:gap-4">



            {/* Active Users Badge */}
            <ActiveUsersBadge />

          </div>
        </nav>
      </div>
    </header>
  );
}