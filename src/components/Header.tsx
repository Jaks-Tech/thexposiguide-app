"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Upper Extremities", href: "/upper-extremities" },
    { name: "Lower Extremities", href: "/lower-extremities" },
    { name: "Pelvic Girdle", href: "/pelvic-girdle" },
    { name: "XPosiLearn", href: "/xposilearn" },
    { name: "XPosi AI", href: "/xposi-ai" }, // ✅ Added comma and correct link
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-800 via-blue-700 to-gray-800 text-white shadow-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* Logo + Site Name */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/assets/logo.png"
            alt="The XPosiGuide logo"
            width={36}
            height={36}
            className="rounded-full shadow-sm"
            priority
          />
          <span className="text-lg sm:text-xl font-bold tracking-wide">
            The XPosiGuide
          </span>
        </Link>

        {/* Desktop Links */}
        <ul
          className="hidden md:flex flex-wrap gap-3"
          key={pathname} // re-render active link
        >
          {navLinks.map((link) => {
            const isActive = mounted && pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-block rounded-full px-4 py-2 transition ${
                    isActive
                      ? "bg-white text-blue-700 shadow-md"
                      : "hover:bg-blue-600 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile Toggle */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-full border border-white/30 px-3 py-2 hover:bg-white/10"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 bg-white transition ${
              open ? "rotate-45 translate-y-1" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white my-1 transition ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white transition ${
              open ? "-rotate-45 -translate-y-1" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-gradient-to-b from-blue-800/95 to-gray-900/95 backdrop-blur-sm">
          <ul
            className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:px-6 lg:px-8 py-3"
            key={pathname}
          >
            {navLinks.map((link) => {
              const isActive = mounted && pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`block rounded-full px-4 py-2 text-center transition ${
                      isActive
                        ? "bg-white text-blue-700 shadow-md"
                        : "hover:bg-blue-600 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
