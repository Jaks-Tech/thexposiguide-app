"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { GiHand, GiLeg, GiPelvisBone } from "react-icons/gi";
import { PiSparkleBold } from "react-icons/pi";
import GenerateProjectionRealtime from "@/components/GenerateProjectionRealtime";

export default function ProjectionStudioClient() {
  const searchParams = useSearchParams();
  const module =
    (searchParams.get("module") as "upper" | "lower" | "pelvic") || "upper";

  const modules = [
    { key: "upper", label: "Upper", icon: <GiHand size={18} /> },
    { key: "lower", label: "Lower", icon: <GiLeg size={18} /> },
    { key: "pelvic", label: "Pelvic", icon: <GiPelvisBone size={18} /> },
  ];

  return (
    <div className="relative min-h-screen px-2 sm:px-6 lg:px-8 py-8 sm:py-16">

      {/* Soft background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)]" />

      <div className="w-full max-w-6xl mx-auto">

        <div className="border border-slate-200 rounded-2xl sm:rounded-3xl shadow-lg bg-white/70 backdrop-blur-xl p-5 sm:p-12">

          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10 sm:mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-medium mb-4">
              <PiSparkleBold size={14} />
              Powered by XPosi AI
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-blue-700">
              Projection Studio
            </h1>

            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Instantly generate radiographic projections with structured
              positioning steps, anatomy landmarks, and exposure guidance.
            </p>
          </motion.div>


          {/* MODULE SELECTOR - Scrollable on very small screens */}
          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="flex flex-wrap sm:flex-nowrap justify-center gap-2 sm:gap-3 bg-white border rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-sm">
              {modules.map((m) => (
                <a
                  key={m.key}
                  href={`?module=${m.key}`}
                  className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    module === m.key
                      ? "bg-blue-600 text-white shadow-md"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* GENERATOR */}
          <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl shadow-md p-4 sm:p-10">
            <GenerateProjectionRealtime module={module} />
          </div>

          {/* FOOT NOTE */}
          <p className="mt-8 sm:mt-12 text-[10px] sm:text-xs text-slate-400 text-center max-w-xl mx-auto px-4">
            Projection Studio is designed for structured academic revision.
            Always verify against institutional protocols and radiographic standards.
          </p>

        </div>
      </div>
    </div>
  );
}