"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { FaFlask } from "react-icons/fa";
import { GiHand, GiLeg, GiPelvisBone } from "react-icons/gi";
import { MdMenuBook, MdHome, MdSportsEsports } from "react-icons/md";
import { PiRobotBold } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";

function NavItem({
  href,
  children,
  icon,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 w-full lg:w-auto ${
        isActive
          ? "bg-white text-blue-700 shadow-md font-bold"
          : "hover:bg-white/10 text-white font-medium"
      }`}
    >
      {icon}
      <span>{children}</span>
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

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024) {
      timeoutRef.current = setTimeout(() => setOpen(false), 150);
    }
  };

  return (
    <div
      className="relative w-full lg:w-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between lg:justify-start gap-2 w-full lg:w-auto px-4 py-2.5 rounded-xl hover:bg-white/10 transition text-white font-medium"
      >
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>
        <FiChevronDown className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 mt-1 lg:mt-2 w-full lg:w-64 bg-white text-slate-800 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden lg:overflow-visible"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SecondaryNavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 shadow-lg sticky top-0 z-[100] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between lg:justify-center py-3">
          
          {/* Brand for Mobile */}
          <div className="lg:hidden flex items-center gap-2 text-white font-black tracking-tight">
          </div>

          {/* Hamburger Button */}
          <button 
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>

          {/* Navigation links wrapper */}
          <nav className="hidden lg:flex items-center gap-6 text-sm">
            <NavContent setIsMenuOpen={setIsMenuOpen} />
          </nav>
        </div>
      </div>

      {/* Mobile Collapsible Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-white/10 bg-blue-700 overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              <NavContent setIsMenuOpen={setIsMenuOpen} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavContent({ setIsMenuOpen }: { setIsMenuOpen: (o: boolean) => void }) {
  const close = () => setIsMenuOpen(false);

  return (
    <>
      <NavItem href="/" icon={<MdHome size={18} />} onClick={close}>
        Home
      </NavItem>


      <Dropdown label="Explore Projections" icon={<GiPelvisBone size={18} />}>
        <div className="flex flex-col">
          <Link href="/upper-extremities" onClick={close} className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors">
            <GiHand size={20} className="text-teal-600" /> 
            <span className="font-medium">Upper Extremities</span>
          </Link>
          <Link href="/lower-extremities" onClick={close} className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors">
            <GiLeg size={20} className="text-green-600" /> 
            <span className="font-medium">Lower Extremities</span>
          </Link>
          <Link href="/pelvic-girdle" onClick={close} className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors">
            <GiPelvisBone size={20} className="text-orange-600" /> 
            <span className="font-medium">Pelvic Girdle</span>
          </Link>
          
          <Link href="/revision-workspace" onClick={close} className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors">
            <MdMenuBook size={20} className="text-orange-600" /> 
            <span className="font-medium">Generated-Projections</span>
          </Link>
        </div>
      </Dropdown>

      <NavItem href="/projections-studio" icon={<FaFlask size={18} />} onClick={close}>
        Generate Projections
      </NavItem>

      <Dropdown label="Learning Hub" icon={<MdMenuBook size={18} />}>
        <div className="flex flex-col">
          <Link href="/xposilearn" onClick={close} className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50">
            <MdMenuBook size={20} className="text-indigo-600" /> 
            <span className="font-medium">XPosiLearn</span>
          </Link>
          <Link href="/xposi-ai" onClick={close} className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50">
            <PiRobotBold size={20} className="text-purple-600" /> 
            <span className="font-medium">XPosi AI</span>
          </Link>
          <Link href="/pdf-ai" onClick={close} className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50">
            <PiRobotBold size={20} className="text-pink-600" /> 
            <span className="font-medium">Chat-Your-PDF</span>
          </Link>
        </div>
      </Dropdown>

      <NavItem href="/games" icon={<MdSportsEsports size={18} />} onClick={close}>
        Game Retreat
      </NavItem>
    </>
  );
}