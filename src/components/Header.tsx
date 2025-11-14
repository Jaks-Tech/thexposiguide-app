"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Upper Extremities", href: "/upper-extremities" },
    { name: "Lower Extremities", href: "/lower-extremities" },
    { name: "Pelvic Girdle/Vertebral Column", href: "/pelvic-girdle" },
    { name: "XPosiLearn", href: "/xposilearn" },
    { name: "XPosi AI", href: "/xposi-ai" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-800 via-blue-700 to-gray-900 text-white shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <nav className="relative flex items-center justify-between w-full py-3">
          {/* LEFT: Logo + Title */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {isMounted ? (
              <Image
                src="/assets/logo.png"
                alt="The XPosiGuide logo"
                width={40}
                height={40}
                priority
                className="rounded-full shadow-sm"
              />
            ) : (
              <img
                src="/assets/logo.png"
                alt="The XPosiGuide logo"
                width={40}
                height={40}
                className="rounded-full shadow-sm"
              />
            )}
            <span
              className="text-lg sm:text-xl font-bold tracking-wide whitespace-nowrap"
              style={{ cursor: "pointer" }}
            >
              The XPosiGuide
            </span>
          </Link>

          {/* RIGHT: Desktop Nav */}
          <ul className="hidden md:flex items-center gap-4 ml-auto" key={pathname}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
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

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden ml-auto inline-flex items-center justify-center rounded-full border border-white/30 px-3 py-2 hover:bg-white/10"
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
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-gradient-to-b from-blue-800/95 to-gray-900/95 backdrop-blur-sm">
          <ul className="flex flex-col gap-2 px-4 sm:px-6 lg:px-8 py-3" key={pathname}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
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
