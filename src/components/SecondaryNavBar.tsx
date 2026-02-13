"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { FaFlask } from "react-icons/fa";
import { GiHand, GiLeg, GiPelvisBone } from "react-icons/gi";
import { MdMenuBook, MdHome } from "react-icons/md";
import { PiRobotBold } from "react-icons/pi";

function NavItem({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 ${
        isActive
          ? "bg-white text-blue-700"
          : "hover:bg-white/15"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function Dropdown({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024) {
      timeoutRef.current = setTimeout(() => {
        setOpen(false);
      }, 150); // small delay prevents flicker
    }
  };

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/15 transition"
      >
        {icon}
        {label}
        <FiChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-xl py-2 z-50">
          {children}
        </div>
      )}
    </div>
  );
}

export default function SecondaryNavBar() {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex justify-center items-center gap-10 py-3 text-sm sm:text-base font-medium">

          {/* Home */}
          <NavItem href="/" icon={<MdHome size={18} />}>
            Home
          </NavItem>

          {/* Explore Projections */}
          <Dropdown
            label="Explore Projections"
            icon={<GiPelvisBone size={18} />}
          >
            <Link
              href="/upper-extremities"
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50"
            >
              <GiHand size={18} className="text-teal-600" />
              Upper Extremities
            </Link>

            <Link
              href="/lower-extremities"
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50"
            >
              <GiLeg size={18} className="text-green-600" />
              Lower Extremities
            </Link>

            <Link
              href="/pelvic-girdle"
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50"
            >
              <GiPelvisBone size={18} className="text-orange-600" />
              Pelvic Girdle
            </Link>


          </Dropdown>

          {/* Home */}
          <NavItem href="/projections-studio" icon={<FaFlask size={18} />}>
            Generate Your Projections
          </NavItem>

          {/* Learning Tools */}
          <Dropdown
            label="Learning Tools"
            icon={<MdMenuBook size={18} />}
          >
            <Link
              href="/xposilearn"
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50"
            >
              <MdMenuBook size={18} className="text-indigo-600" />
              XPosiLearn
            </Link>

            <Link
              href="/xposi-ai"
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50"
            >
              <PiRobotBold size={18} className="text-purple-600" />
              XPosi AI
            </Link>

            <Link
              href="/pdf-ai"
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50"
            >
              <PiRobotBold size={18} className="text-pink-600" />
              Chat-Your-PDF
            </Link>
          </Dropdown>

        </nav>
      </div>
    </div>
  );
}
