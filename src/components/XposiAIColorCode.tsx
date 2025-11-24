"use client";

import React from "react";

/** 🎨 Color presets for each UNIT (customize freely) */
export const UNIT_COLORS: Record<string, string> = {
  "Anatomy & Physiology": "bg-red-100 text-red-700",
  "Imaging & Therapeutic Modalities I": "bg-indigo-100 text-indigo-700",
  "Imaging & Therapeutic Modalities II": "bg-indigo-100 text-indigo-700",
  "Imaging & Therapeutic Modalities III": "bg-indigo-100 text-indigo-700",
  "Imaging & Therapeutic Modalities IV": "bg-indigo-100 text-indigo-700",
  "Imaging & Therapeutic Modalities V": "bg-indigo-100 text-indigo-700",

  "Imaging Processing Technology I": "bg-yellow-100 text-yellow-700",
  "Imaging Processing Technology II": "bg-yellow-100 text-yellow-700",
  "Imaging Processing Technology III": "bg-yellow-100 text-yellow-700",
  "Imaging Processing Technology IV": "bg-yellow-100 text-yellow-700",

  "Medical Physics & Chemistry I": "bg-green-100 text-green-700",
  "Medical Physics & Chemistry II": "bg-green-100 text-green-700",

  "Radiographic Anatomy I": "bg-blue-100 text-blue-700",
  "Radiographic Anatomy II": "bg-blue-100 text-blue-700",
  "Radiographic Anatomy III": "bg-blue-100 text-blue-700",

  "Patient Care": "bg-rose-100 text-rose-700",
  "Human Psychology": "bg-orange-100 text-orange-700",
  "HIV/AIDS": "bg-lime-100 text-lime-700",
  "Communication Skills": "bg-fuchsia-100 text-fuchsia-700",

  "First Aid": "bg-purple-100 text-purple-700",
  "Nursing & Hospital Experience": "bg-teal-100 text-teal-700",

  "Biostatistics": "bg-emerald-100 text-emerald-700",
  "Biostatistics I": "bg-emerald-100 text-emerald-700",

  "Research Methodology": "bg-cyan-100 text-cyan-700",
  "Research Project I": "bg-cyan-100 text-cyan-700",

  "Radiographic Pathology I": "bg-pink-100 text-pink-700",
  "Radiographic Pathology II": "bg-pink-100 text-pink-700",

  "Radiopharmacology": "bg-violet-100 text-violet-700",
  "Pharmacology": "bg-violet-100 text-violet-700",

  "Community Health System": "bg-stone-100 text-stone-700",

  // ⭐ DEFAULT for unmatched units
  "DEFAULT": "bg-gray-100 text-gray-700",
};

/** Returns proper color class */
export function getUnitColor(unit: string | null | undefined): string {
  if (!unit) return UNIT_COLORS["DEFAULT"];
  return UNIT_COLORS[unit] || UNIT_COLORS["DEFAULT"];
}

/** 🏷️ Ready-to-use Unit Badge Component */
export function UnitBadge({ name }: { name: string | null }) {
  if (!name) return null;

  const color = getUnitColor(name);

  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${color}`}>
      {name}
    </span>
  );
}

export default UnitBadge;
