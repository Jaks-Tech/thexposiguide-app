"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface FilterProps {
  years: string[];
  sems: (string | number)[];
  units: string[];
}

export default function PaperFilters({ years, sems, units }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Removes the 'file' param if filtering to avoid viewing a doc that might not match
    params.delete("file"); 
    router.push(`/xposi-ai?${params.toString()}`);
  };

  const currentYear = searchParams.get("year") || "";
  const currentSem = searchParams.get("sem") || "";
  const currentUnit = searchParams.get("unit") || "";

  const selectStyles = "bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-slate-300 transition-all";

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 p-2 bg-slate-100/50 rounded-2xl border border-slate-200 w-fit">
      {/* Year Filter */}
      <select
        value={currentYear}
        onChange={(e) => updateFilter("year", e.target.value)}
        className={selectStyles}
      >
        <option value="">All Years</option>
        {years.map((y) => (
          <option key={y} value={y}>{y?.replace("year-", "Year ")}</option>
        ))}
      </select>

      {/* Semester Filter */}
      <select
        value={currentSem}
        onChange={(e) => updateFilter("sem", e.target.value)}
        className={selectStyles}
      >
        <option value="">All Semesters</option>
        {sems.map((s) => (
          <option key={s} value={String(s)}>Semester {s}</option>
        ))}
      </select>

      {/* Course Filter */}
      <select
        value={currentUnit}
        onChange={(e) => updateFilter("unit", e.target.value)}
        className={`${selectStyles} max-w-[200px]`}
      >
        <option value="">All Courses</option>
        {units.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>

      {(currentYear || currentSem || currentUnit) && (
        <button
          onClick={() => router.push("/xposi-ai")}
          className="text-xs text-blue-600 font-bold px-3 hover:underline"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}