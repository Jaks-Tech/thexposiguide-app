"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Upper Extremities", href: "/upper-extremities" },
    { name: "Lower Extremities", href: "/lower-extremities" },
    { name: "Pelvic Girdle", href: "/pelvic-girdle" },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-800 via-blue-700 to-gray-800 text-white sticky top-0 z-50 shadow-lg">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
        {/* Logo + Title */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/assets/logo.png"
            alt="The XPosiGuide logo"
            width={40}
            height={40}
            className="rounded-full shadow-sm"
            priority
          />
          <span className="text-2xl font-bold tracking-wide">
            The XPosiGuide
          </span>
        </Link>

        {/* Navigation Links */}
        <ul className="flex flex-wrap gap-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`
                    inline-block px-4 py-2 rounded-full border border-transparent transition-all duration-300
                    ${isActive
                      ? "bg-white text-blue-700 shadow-md"
                      : "hover:bg-blue-600 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)]"}
                  `}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
