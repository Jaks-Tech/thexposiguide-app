"use client";

import Link from "next/link";
import {
  GiHand,
  GiLeg,
  GiPelvisBone,
} from "react-icons/gi";
import { MdMenuBook } from "react-icons/md";
import { PiRobotBold } from "react-icons/pi";
import { HiClipboardList } from "react-icons/hi";

const roadmapItems = [
  {
    id: "upper",
    label: "Upper Extremities",
    href: "/upper-extremities",
    description: "Hand, wrist, elbow, humerus & shoulder projections.",
    icon: <GiHand className="text-blue-600" size={22} />,
    positionClass:
      "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
  },
  {
    id: "lower",
    label: "Lower Extremities",
    href: "/lower-extremities",
    description: "Foot, ankle, knee & femur positioning.",
    icon: <GiLeg className="text-emerald-600" size={22} />,
    positionClass:
      "top-1/4 right-0 translate-x-1/2 -translate-y-1/2",
  },
  {
    id: "pelvic",
    label: "Pelvic Girdle",
    href: "/pelvic-girdle",
    description: "Pelvis, hip & spine projections and trauma views.",
    icon: <GiPelvisBone className="text-orange-500" size={22} />,
    positionClass:
      "bottom-1/4 right-0 translate-x-1/2 translate-y-1/2",
  },
  {
    id: "xposilearn",
    label: "XPosiLearn",
    href: "/xposilearn",
    description: "Notes, past papers & structured study guides.",
    icon: <MdMenuBook className="text-indigo-600" size={22} />,
    positionClass:
      "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
  },
  {
    id: "xposi-ai",
    label: "XPosi AI",
    href: "/xposi-ai",
    description: "Ask questions & get AI explanations of projections.",
    icon: <PiRobotBold className="text-purple-600" size={22} />,
    positionClass:
      "bottom-1/4 left-0 -translate-x-1/2 translate-y-1/2",
  },
  {
    id: "assignments",
    label: "Assignments",
    href: "/xposilearn#assignments",
    description: "Practice tasks & coursework-style positioning cases.",
    icon: <HiClipboardList className="text-pink-600" size={22} />,
    positionClass:
      "top-1/4 left-0 -translate-x-1/2 -translate-y-1/2",
  },
];

export default function CircularRoadmap() {
  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">

          <p className="mt-3 text-sm sm:text-base text-neutral-600">

          </p>
        </div>

        {/* Desktop / Tablet: circular roadmap */}
        <div className="hidden md:flex justify-center mt-12">
          <div className="relative h-[420px] w-[420px] sm:h-[460px] sm:w-[460px]">

            {/* Glow + ring */}
            <div className="absolute inset-10 rounded-full bg-gradient-to-br from-blue-500/10 via-cyan-400/10 to-indigo-500/10 blur-2xl" />
            <div className="absolute inset-10 rounded-full border border-blue-200/60" />
            <div className="absolute inset-16 rounded-full border border-blue-100/60 border-dashed" />

            {/* Center node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-6 py-4 shadow-xl flex flex-col items-center justify-center text-center">
                <span className="text-xs uppercase tracking-wide text-blue-100/90">
                  Start Here
                </span>
                <p className="mt-1 font-semibold">
                  Radiographic Positioning Journey
                </p>
                <p className="mt-2 text-xs text-blue-50/90 max-w-xs">
                  Move from core projections to revision resources and AI support.
                </p>
              </div>
            </div>

            {/* Roadmap nodes around the circle */}
            {roadmapItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  absolute ${item.positionClass}
                  group
                `}
              >
                <div
                  className="
                    w-44 max-w-[180px]
                    rounded-2xl bg-white shadow-md
                    border border-blue-100
                    px-4 py-3
                    flex flex-col gap-1
                    hover:-translate-y-1 hover:shadow-lg
                    transition-all duration-200
                  "
                >
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-[13px] font-semibold text-blue-700">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-snug mt-1">
                    {item.description}
                  </p>
                  <span className="mt-1 text-[11px] font-semibold text-blue-500 group-hover:text-blue-600 flex items-center gap-1">
                    Explore <span>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile: stacked roadmap cards */}
        <div className="mt-10 md:hidden space-y-4">
          {roadmapItems.map((item) => (
            <Link
              href={item.href}
              key={item.id}
              className="
                block rounded-2xl bg-white shadow-sm
                border border-blue-100 px-4 py-3
                hover:shadow-md hover:-translate-y-[1px]
                transition-all
              "
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <div>
                  <p className="text-sm font-semibold text-blue-700">
                    {item.label}
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    {item.description}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-500 font-semibold">
                   Explore →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
