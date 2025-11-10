"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Home,
  Hand,
  Footprints,
  Bone,
  BookOpen,
  Brain,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Upper Extremities", href: "/upper-extremities", icon: <Hand className="w-5 h-5" /> },
    { name: "Lower Extremities", href: "/lower-extremities", icon: <Footprints className="w-5 h-5" /> },
    { name: "Pelvic Girdle", href: "/pelvic-girdle", icon: <Bone className="w-5 h-5" /> },
    { name: "XPosiLearn", href: "/xposilearn", icon: <BookOpen className="w-5 h-5" /> },
    { name: "XPosi AI", href: "/xposi-ai", icon: <Brain className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-700 text-white p-2 rounded-md shadow-md hover:bg-blue-800 transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-900 via-blue-700 to-gray-900 text-white transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out shadow-xl`}
      >
        <div className="p-5 flex items-center justify-between md:justify-center border-b border-white/10">
          <h2 className="text-xl font-bold tracking-wide">Navigation</h2>
          <button
            className="md:hidden text-white hover:text-blue-200"
            onClick={() => setOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-4 flex flex-col space-y-2 px-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 rounded-md font-medium text-white/90 hover:bg-white/10 hover:text-white transition"
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
