"use client";

import Link from "next/link";
import { GiHand, GiLeg, GiPelvisBone } from "react-icons/gi";
import { MdMenuBook } from "react-icons/md";
import { PiRobotBold } from "react-icons/pi";
import { HiClipboardList } from "react-icons/hi";

// Animation classes (global styles included)
const animationStyles = `
@keyframes floatUpDown {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes breathe {
  0%,100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

@keyframes pulseRing {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(1.15); opacity: 0; }
}
`;

export default function CircularRoadmap() {
  return (
    <>
      {/* Inject animations */}
      <style>{animationStyles}</style>

      <div className="relative w-full max-w-3xl mx-auto h-[700px] sm:h-[800px] md:h-[900px]">

        {/* OUTER GLOW CIRCLE */}
        <div className="absolute inset-0 rounded-full bg-blue-50 opacity-70 blur-2xl"></div>

        {/* PULSE RING ANIMATION */}
        <div
          className="
            absolute inset-0 rounded-full border-[2px] border-blue-300/40 
            animate-[pulseRing_3.5s_ease-out_infinite]
          "
        ></div>

        {/* GUIDELINE CIRCLE */}
        <div className="absolute inset-0 rounded-full border-[2px] border-blue-200/40 scale-110"></div>

        {/* CENTER CARD (breathing animation) */}
        <div
          className="
            absolute left-1/2 top-1/2 
            -translate-x-1/2 -translate-y-1/2 
            bg-gradient-to-br from-blue-600 to-blue-700 
            text-white text-center 
            rounded-2xl shadow-xl 
            px-10 py-10 w-[260px]
            animate-[breathe_6s_ease-in-out_infinite]
          "
        >
          <p className="text-sm tracking-wide opacity-80">START HERE</p>

          <h3 className="text-xl font-bold mt-1 leading-tight">
            Radiographic <br /> Positioning Journey
          </h3>

          <p className="text-sm mt-3 opacity-90 leading-snug">
            Move from core projections to study tools, assignments, & AI support.
          </p>
        </div>

        {/* ---------- Animated Nodes ---------- */}

        <RoadmapNode
          title="Upper Extremities"
          text="Hand, wrist, elbow, humerus & shoulder projections."
          href="/upper-extremities"
          icon={<GiHand className="text-blue-600" size={22} />}
          className="-top-6 left-1/2 -translate-x-1/2"
        />

        <RoadmapNode
          title="Lower Extremities"
          text="Foot, ankle, knee & femur positioning."
          href="/lower-extremities"
          icon={<GiLeg className="text-emerald-600" size={22} />}
          className="top-[28%] -right-8"
        />

        <RoadmapNode
          title="Pelvic Girdle"
          text="Pelvis, hip & spine projections and trauma views."
          href="/pelvic-girdle"
          icon={<GiPelvisBone className="text-orange-500" size={22} />}
          className="bottom-[18%] right-0"
        />

        <RoadmapNode
          title="XPosiLearn"
          text="Notes, past papers & structured study guides."
          href="/xposilearn"
          icon={<MdMenuBook className="text-indigo-600" size={22} />}
          className="bottom-0 left-1/2 -translate-x-1/2"
        />

        <RoadmapNode
          title="XPosi AI"
          text="Ask questions & get AI explanations of projections."
          href="/xposi-ai"
          icon={<PiRobotBold className="text-purple-600" size={22} />}
          className="bottom-[18%] left-0"
        />

        <RoadmapNode
          title="Assignments"
          text="Practice tasks & coursework-style positioning cases."
          href="/assignments"
          icon={<HiClipboardList className="text-pink-600" size={22} />}
          className="top-[28%] -left-8"
        />
      </div>
    </>
  );
}

/* ------------------------------------------ */
/* Reusable Node Component with animations */
/* ------------------------------------------ */
function RoadmapNode({
  title,
  text,
  href,
  icon,
  className,
}: {
  title: string;
  text: string;
  href: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        absolute ${className}
        w-[210px] sm:w-[230px]
        bg-white 
        rounded-2xl 
        shadow-lg 
        border border-blue-100
        p-4 text-left
        transition-all
        animate-[floatUpDown_5s_ease-in-out_infinite]
        hover:shadow-xl hover:-translate-y-2 
        hover:border-blue-300
      `}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="text-blue-700 font-semibold text-lg">{title}</h4>
      </div>

      <p className="text-sm text-neutral-600 mt-1 leading-snug">{text}</p>

      <Link
        href={href}
        className="text-blue-600 text-sm font-medium mt-2 inline-block hover:underline"
      >
        Explore →
      </Link>
    </div>
  );
}
