"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GiHand, GiLeg, GiPelvisBone } from "react-icons/gi";
import { PiSparkleBold } from "react-icons/pi";
import { WandSparkles, ImagePlus, ChevronRight } from "lucide-react";

import GenerateProjectionRealtime from "@/components/GenerateProjectionRealtime";
import ProjectionVisualCreator from "@/components/ProjectionVisualCreator";

type ModuleType = "upper" | "lower" | "pelvic";
type ToolType = "lesson" | "visual";

export default function ProjectionStudioClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedModule = (searchParams.get("module") as ModuleType) || "upper";
  const [selectedTool, setSelectedTool] = useState<ToolType>("lesson");

  const modules = [
    { key: "upper", label: "Upper", icon: <GiHand /> },
    { key: "lower", label: "Lower", icon: <GiLeg /> },
    { key: "pelvic", label: "Pelvic", icon: <GiPelvisBone /> },
  ];

  const tools = [
    {
      key: "lesson" as const,
      label: "Textual Projection Generator",
      description: "Structured positioning notes",
      icon: <WandSparkles size={20} />,
      color: "blue",
    },
    {
      key: "visual" as const,
      label: "Visual Projections",
      description: "Create projection visuals",
      icon: <ImagePlus size={20} />,
      color: "cyan",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden px-4 sm:px-6 lg:px-8 py-12 bg-[#fcfdfe]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-100/40 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      <div className="w-full max-w-5xl mx-auto">
        {/* Header Section */}
        <header className="relative text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-6"
          >
            <PiSparkleBold className="text-blue-600" size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
              XPosi AI Intelligence
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-4">
            Projection <span className="text-blue-600">Studio</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg font-medium leading-relaxed">
            High-fidelity radiographic positioning tools and 
            automated lesson planning in one workspace.
          </p>
        </header>

        {/* Main Interface Card */}
        <div className="relative border border-slate-200/60 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur-xl overflow-hidden">
          {/* Module Segmented Control */}
          <div className="flex justify-center pt-8 pb-4">
            <div className="inline-flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
              {modules.map((m) => {
                const isActive = selectedModule === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => router.push(`?module=${m.key}`)}
                    className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      isActive ? "text-blue-700" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeModule"
                        className="absolute inset-0 bg-white shadow-sm rounded-xl border border-slate-200/50"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 text-lg">{m.icon}</span>
                    <span className="relative z-10">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-6 pb-10 sm:px-12">
            {/* Tool Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-3xl mx-auto">
              {tools.map((tool) => {
                const isActive = selectedTool === tool.key;
                return (
                  <motion.button
                    key={tool.key}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTool(tool.key)}
                    className={`relative group text-left p-5 rounded-3xl border-2 transition-all duration-300 ${
                      isActive
                        ? "border-blue-600 bg-blue-50/30"
                        : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl transition-colors ${
                        isActive ? "bg-blue-600 text-white" : "bg-white text-slate-400 group-hover:text-blue-500 shadow-sm"
                      }`}>
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-sm font-bold ${isActive ? "text-blue-900" : "text-slate-700"}`}>
                          {tool.label}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {tool.description}
                        </p>
                      </div>
                      {isActive && <ChevronRight size={16} className="text-blue-400" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Active Workspace */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTool + selectedModule}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-10"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-8 w-1.5 bg-blue-600 rounded-full" />
                  <div>
                    <h2 className="text-centertext-2xl font-black text-slate-900 tracking-tight">
                      {selectedTool === "lesson" ? "Text to Projection" : "Text to Visual"}
                    </h2>

                  </div>
                </div>

                {selectedTool === "lesson" ? (
                  <GenerateProjectionRealtime module={selectedModule} />
                ) : (
                  <ProjectionVisualCreator />
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}