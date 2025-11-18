"use client";
import type { JSX } from "react";
import Link from "next/link";
import {
  GiHand,
  GiLeg,
  GiPelvisBone,
} from "react-icons/gi";
import { MdMenuBook } from "react-icons/md";
import { PiRobotBold } from "react-icons/pi";
import { HiClipboardList } from "react-icons/hi";

// Icon map
const icons: Record<string, JSX.Element> = {
  "Upper Extremities": <GiHand size={28} className="text-blue-600 animate-float" />,
  "Lower Extremities": <GiLeg size={28} className="text-emerald-600 animate-float" />,
  "Pelvic Girdle": <GiPelvisBone size={28} className="text-orange-500 animate-float" />,
  XPosiLearn: <MdMenuBook size={28} className="text-indigo-600 animate-float" />,
  "XPosi AI": <PiRobotBold size={28} className="text-purple-600 animate-float" />,
  Assignments: <HiClipboardList size={28} className="text-pink-600 animate-float" />,
};

export default function DownwardRoadmap() {
  return (
    <section className="w-full py-20 bg-white relative overflow-hidden">

      {/* HEADER */}
      <div className="text-center max-w-xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-blue-700">
          Downward Learning Roadmap
        </h2>
        <p className="mt-3 text-sm sm:text-base text-neutral-600">
          Follow a structured, step-by-step progression from projections to study tools & AI support.
        </p>
      </div>

      {/* VERTICAL LINE */}
      <div
        className="
          absolute left-1/2 top-[260px]
          -translate-x-1/2
          w-[3px] 
          h-[calc(100%-320px)]
          bg-gradient-to-b
          from-blue-200 via-blue-300 to-blue-200
        "
      />

      {/* STEPS CONTAINER */}
      <div className="relative max-w-xl mx-auto mt-16 space-y-20 px-4">

        <RoadmapStep
          title="Upper Extremities"
          text="Hand, wrist, elbow, humerus & shoulder projections."
          href="/upper-extremities"
          showDot
        />

        <RoadmapStep
          title="Lower Extremities"
          text="Foot, ankle, knee & femur positioning."
          href="/lower-extremities"
        />

        <RoadmapStep
          title="Pelvic Girdle"
          text="Pelvis, hip & spine projections, trauma views & more."
          href="/pelvic-girdle"
        />

        <RoadmapStep
          title="XPosiLearn"
          text="Notes, past papers & structured study guides."
          href="/xposilearn"
        />

        <RoadmapStep
          title="XPosi AI"
          text="Ask questions & get AI explanations of projections."
          href="/xposi-ai"
        />

        <RoadmapStep
          title="Assignments"
          text="Practice coursework-style positioning tasks."
          href="/assignments"
        />

      </div>


    </section>
  );
}

/* ------------------------------------------ */
/* REUSABLE ROADMAP STEP COMPONENT */
/* ------------------------------------------ */

function RoadmapStep({
  title,
  text,
  href,
  showDot,
}: {
  title: string;
  text: string;
  href: string;
  showDot?: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center animate-fadeUp">

      {/* Connector Dot */}
      {showDot && (
        <div
          className="
            absolute -top-10
            w-6 h-6
            bg-blue-600 rounded-full
            border-4 border-white
            shadow-lg
            animate-pulseDot
            z-10
          "
        />
      )}

      {/* Card */}
      <div
        className="
          w-full max-w-[420px]
          bg-white 
          rounded-2xlA
          p-6
          shadow-lg border border-blue-100
          text-center
          transition-all
          hover:shadow-xl hover:-translate-y-1
        "
      >
        <div className="flex justify-center mb-3">
          {icons[title]}
        </div>

        <h3 className="text-blue-700 font-bold text-lg sm:text-xl">{title}</h3>

        <p className="text-neutral-600 text-sm mt-2 leading-snug">{text}</p>

        <Link
          href={href}
          className="
            text-blue-600 
            text-sm 
            font-semibold 
            mt-3 
            inline-block 
            hover:underline
          "
        >
          Explore →
        </Link>
      </div>
    </div>
  );
}
