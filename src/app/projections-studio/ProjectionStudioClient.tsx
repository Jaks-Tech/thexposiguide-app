"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { GiHand, GiLeg, GiPelvisBone } from "react-icons/gi";
import { PiSparkleBold } from "react-icons/pi";
import { FaFlask } from "react-icons/fa";
import { MdOutlineAutoAwesome } from "react-icons/md";
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
    <div className="relative min-h-screen px-4 sm:px-6 lg:px-8 py-16">

      {/* Soft background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)]" />

      <div className="w-full px-2 sm:px-6 lg:px-12">

        <div className="border border-slate-200 rounded-3xl shadow-lg bg-white/70 backdrop-blur-xl p-8 sm:p-12">

          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium mb-4">
              <PiSparkleBold size={16} />
              Powered by XPosi AI
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-blue-700">
              Projection Studio
            </h1>

            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Instantly generate missing radiographic projections with structured
              positioning steps, anatomy landmarks, and exposure guidance.
            </p>
          </motion.div>

          {/* FEATURE STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <Feature
              icon={<FaFlask className="text-blue-600" size={18} />}
              title="On-Demand Generation"
              text="Create rare, trauma, or exam-specific projections instantly."
            />
            <Feature
              icon={<MdOutlineAutoAwesome className="text-indigo-500" size={18} />}
              title="Structured Output"
              text="Receive clean, exam-ready positioning steps and anatomy breakdown."
            />
            <Feature
              icon={<PiSparkleBold className="text-purple-500" size={18} />}
              title="AI Enhanced"
              text="Smart formatting with clinical reasoning and positioning tips."
            />
          </div>

          {/* MODULE SELECTOR */}
          <div className="flex justify-center mb-10">
            <div className="flex gap-3 bg-white border rounded-2xl p-2 shadow-sm">
              {modules.map((m) => (
                <a
                  key={m.key}
                  href={`?module=${m.key}`}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                    module === m.key
                      ? "bg-blue-600 text-white shadow-md"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {m.icon}
                  {m.label}
                </a>
              ))}
            </div>
          </div>

          {/* GENERATOR */}
          <div className="bg-white border rounded-3xl shadow-md p-6 sm:p-10">
            <GenerateProjectionRealtime module={module} />
          </div>

          {/* FOOT NOTE */}
          <p className="mt-12 text-xs text-slate-400 text-center max-w-xl mx-auto">
            Projection Studio is designed for structured academic revision.
            Always verify against institutional protocols and radiographic standards.
          </p>

        </div>
      </div>
    </div>
  );
}

/* Feature Card */
function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 font-semibold text-gray-800 mb-1">
        {icon}
        {title}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">
        {text}
      </p>
    </div>
  );
}
