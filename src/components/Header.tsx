"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-800 via-blue-700 to-gray-900 text-white shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between w-full py-3">

          {/* LEFT: Logo + Brand */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/logo.png"
              alt="The XPosiGuide logo"
              width={40}
              height={40}
              priority
              className="rounded-full shadow-sm"
            />

            <span className="text-lg sm:text-xl font-bold tracking-wide whitespace-nowrap">
              The XPosiGuide
            </span>
          </Link>

          {/* RIGHT (OPTIONAL ACTION ICONS) */}
          <div className="flex items-center gap-4">
            {/* Example placeholder icons you can customize later */}
            <button className="hidden sm:inline-flex p-2 rounded-full hover:bg-white/10 transition">
              🔍
            </button>

            <button className="hidden sm:inline-flex p-2 rounded-full hover:bg-white/10 transition">
              💬
            </button>

            <button className="hidden sm:inline-flex p-2 rounded-full hover:bg-white/10 transition">
              ⚙️
            </button>
          </div>

        </nav>
      </div>
    </header>
  );
}
