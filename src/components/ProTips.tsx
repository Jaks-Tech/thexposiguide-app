"use client";
import { useEffect, useState } from "react";

/* -------------------------------------------
   EXTENDED LEFT-SIDE TIPS  (Exposure / Technique)
--------------------------------------------- */
const tipsLeft = [
  {
    title: "EXPOSURE REMINDER",
    bar: "from-blue-500 to-cyan-400",
    text: "Always collimate tightly to reduce scatter radiation.",
  },
  {
    title: "KVP SELECTION",
    bar: "from-indigo-500 to-blue-400",
    text: "Use higher kVp for thicker anatomy to reduce patient dose.",
  },
  {
    title: "AEC TIP",
    bar: "from-sky-500 to-teal-400",
    text: "Ensure anatomy fully covers the AEC chambers for consistent exposures.",
  },
  {
    title: "SHIELDING REMINDER",
    bar: "from-blue-600 to-emerald-500",
    text: "Provide gonadal shielding where appropriate and allowed.",
  },
  {
    title: "GRID USE",
    bar: "from-emerald-500 to-green-400",
    text: "Use a grid for body parts thicker than 10 cm to reduce scatter.",
  },
  {
    title: "MOTION REDUCTION",
    bar: "from-cyan-500 to-blue-400",
    text: "Increase mA and reduce exposure time to minimize motion blur.",
  },
  {
    title: "PAEDIATRIC TIP",
    bar: "from-pink-500 to-rose-400",
    text: "Remove the grid for pediatric exams unless absolutely necessary.",
  },
  {
    title: "ARTEFACT CHECK",
    bar: "from-violet-500 to-purple-400",
    text: "Look for zippers, necklaces, ECG leads, and hair braids before exposure.",
  },
  {
    title: "SID CONSISTENCY",
    bar: "from-amber-500 to-yellow-400",
    text: "Always verify the SID—incorrect distance affects magnification and exposure.",
  },
  {
    title: "DR PROCESSING",
    bar: "from-sky-500 to-indigo-400",
    text: "Select the correct body-part algorithm to ensure optimal image processing.",
  },
];

/* -------------------------------------------
   EXTENDED RIGHT-SIDE TIPS (Positioning / Patient Care)
--------------------------------------------- */
const tipsRight = [
  {
    title: "POSITIONING TIP",
    bar: "from-cyan-400 to-emerald-400",
    text: "Ensure patient comfort and stability before exposure.",
  },
  {
    title: "MARKER RULE",
    bar: "from-purple-500 to-pink-400",
    text: "Always place anatomical markers BEFORE exposure.",
  },
  {
    title: "ROTATION CHECK",
    bar: "from-amber-500 to-yellow-400",
    text: "Check symmetry and equal distances to avoid rotation.",
  },
  {
    title: "CR ALIGNMENT",
    bar: "from-teal-500 to-cyan-400",
    text: "Keep the CR perpendicular to the joint space for accurate visualization.",
  },
  {
    title: "3D VISUALIZATION",
    bar: "from-blue-500 to-indigo-500",
    text: "Visualize the anatomy in 3D before positioning the patient.",
  },
  {
    title: "LATERAL VIEW TIP",
    bar: "from-green-500 to-emerald-400",
    text: "Ensure shoulders, hips, and knees are aligned for true laterals.",
  },
  {
    title: "TRAUMA SAFETY",
    bar: "from-red-500 to-orange-400",
    text: "Never move trauma patients without clearance—modify your projections instead.",
  },
  {
    title: "COMMUNICATION",
    bar: "from-blue-600 to-purple-500",
    text: "Explain each step clearly—patients stay still when they feel informed.",
  },
  {
    title: "PATIENT SUPPORT",
    bar: "from-lime-500 to-green-400",
    text: "Use sponges and supports to maintain positioning without manual holding.",
  },
  {
    title: "TRUE AP/PA CHECK",
    bar: "from-sky-500 to-cyan-300",
    text: "Check for equal iliac wing or clavicle spacing to verify true AP/PA.",
  },
];

export default function ProTips() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % tipsLeft.length);
    }, 5000);

    return () => clearInterval(id);
  }, []);

  const left = tipsLeft[index];
  const right = tipsRight[index];

  return (
    <section className="mt-14 mb-10 flex flex-col sm:flex-row gap-8 justify-center">
      {/* LEFT CARD */}
      <div
        key={left.title}
        className="
          w-full sm:w-[330px] 
          h-[150px]
          rounded-2xl bg-white/90 border border-blue-100 
          shadow-md px-8 py-5 
          animate-fadeIn
          flex flex-col items-center justify-between text-center
          transition-all duration-500
        "
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400">{left.title}</p>
        <div className={`h-[4px] w-10 bg-gradient-to-r ${left.bar} rounded-full`} />
        <p className="text-[15px] text-neutral-500 leading-snug">{left.text}</p>
      </div>

      {/* RIGHT CARD */}
      <div
        key={right.title}
        className="
          w-full sm:w-[330px] 
          h-[150px]
          rounded-2xl bg-white/90 border border-blue-100 
          shadow-md px-8 py-5 
          animate-fadeIn
          flex flex-col items-center justify-between text-center
          transition-all duration-500
        "
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400">{right.title}</p>
        <div className={`h-[4px] w-10 bg-gradient-to-r ${right.bar} rounded-full`} />
        <p className="text-[15px] text-neutral-500 leading-snug">{right.text}</p>
      </div>
    </section>
  );
}
