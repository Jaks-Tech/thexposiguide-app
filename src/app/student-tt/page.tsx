"use client";

import { useState, useEffect } from "react";

interface Allocation {
  id: string;
  day_of_week: string;
  start_time: string;
  room_name: string;
  teachers?: { full_name: string };
  units?: { name: string; year: string; semester: number };
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TIME_SLOTS = [
  { label: "08:00", isBreak: false },
  { label: "09:00", isBreak: false },
  { label: "10:00", isBreak: true, title: "TEA" },
  { label: "10:30", isBreak: false },
  { label: "11:30", isBreak: false },
  { label: "12:30", isBreak: true, title: "LUNCH" },
  { label: "14:00", isBreak: false },
  { label: "15:00", isBreak: false },
  { label: "16:00", isBreak: false },
];

export default function StudentTimetablePage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewYear, setViewYear] = useState("Year 1");
  const [viewSemester, setViewSemester] = useState(1);

  useEffect(() => {
    fetchStudentData();
  }, [viewYear, viewSemester]);

  async function fetchStudentData() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/student/timetable?year=${viewYear}&semester=${viewSemester}`
      );
      const data = await res.json();
      if (data.success) setAllocations(data.allocations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ PRINT WITH NAME
  function handlePrint() {
    const originalTitle = document.title;
    document.title = `Timetable-${viewYear.replace(" ", "")}-Sem${viewSemester}`;
    window.print();
    document.title = originalTitle;
  }

  return (
    <div className="min-h-screen bg-slate-200 p-4 md:p-6 font-sans text-slate-900">

      <div className="max-w-[1400px] mx-auto space-y-4">

        {/* HEADER */}
        <div className="no-print bg-white p-5 rounded-[1.5rem] shadow border-l-[10px] border-blue-700 flex flex-col md:flex-row justify-between items-center gap-4">

          <div>
            <h1 className="text-2xl font-[900] uppercase">
              Academic Timetable
            </h1>
            <p className="text-blue-700 text-xs uppercase tracking-widest">
              {viewYear} • Semester {viewSemester}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">

            <select
              value={viewYear}
              onChange={(e) => setViewYear(e.target.value)}
              className="p-2 text-xs font-bold border border-slate-900 rounded-lg"
            >
              <option value="Year 1">YEAR 1</option>
              <option value="Year 2">YEAR 2</option>
              <option value="Year 3">YEAR 3</option>
            </select>

            <select
              value={viewSemester}
              onChange={(e) => setViewSemester(Number(e.target.value))}
              className="p-2 text-xs font-bold border border-slate-900 rounded-lg"
            >
              <option value={1}>SEM 1</option>
              <option value={2}>SEM 2</option>
            </select>

            <button
              onClick={handlePrint}
              className="bg-blue-700 text-white px-3 py-2 rounded text-xs font-bold hover:bg-blue-800"
            >
              Print / PDF
            </button>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="text-center py-20 font-bold">
            Loading timetable...
          </div>
        ) : (
          <div className="print-area bg-white rounded-[1.5rem] border-[3px] border-slate-900 overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                {/* HEAD */}
                <thead>
                  <tr className="bg-slate-900">
                    <th className="p-3 text-[9px] text-white uppercase">
                      Day
                    </th>
                    {TIME_SLOTS.map((s) => (
                      <th key={s.label} className="p-3 text-[9px] text-white uppercase">
                        {s.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* BODY */}
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day} className="border-b">

                      <td className="p-3 text-[12px] font-bold text-white bg-slate-800 text-center">
                        {day.slice(0, 3)}
                      </td>

                      {TIME_SLOTS.map((slot) => {
                        const alloc = allocations.find(
                          (a) =>
                            a.day_of_week === day &&
                            a.start_time === slot.label
                        );

                        if (slot.isBreak) {
                          return (
                            <td key={slot.label} className="bg-slate-200 text-center">
                              <span className="text-[9px] font-bold text-slate-500 uppercase [writing-mode:vertical-lr] rotate-180">
                                {slot.title}
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={slot.label} className="p-1.5 min-w-[120px]">

                            {alloc ? (
                              <div className="p-2 rounded-lg border border-slate-900 min-h-[70px] flex flex-col">

                                <p className="text-[11px] font-bold uppercase leading-tight">
                                  {alloc.units?.name || "Unit"}
                                </p>

                                <p className="text-[9px] text-blue-700 uppercase">
                                  {alloc.teachers?.full_name}
                                </p>

                                <span className="mt-auto bg-slate-900 text-white text-[8px] px-2 py-[2px] rounded">
                                  {alloc.room_name}
                                </span>
                              </div>
                            ) : (
                              <div className="min-h-[70px] flex items-center justify-center border border-dashed rounded-lg text-[9px] text-slate-400">
                                Free
                              </div>
                            )}

                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        )}
      </div>

      {/* STYLES */}
      <style jsx global>{`
        /* PRINT */
        @media print {
          body {
            background: white;
          }

          .no-print {
            display: none;
          }

          .print-area {
            width: 100%;
            border: none;
          }

          table {
            font-size: 10px;
          }
        }

        /* MOBILE */
        @media (max-width: 640px) {
          table {
            font-size: 8px;
          }

          th, td {
            padding: 4px !important;
          }

          td div {
            min-height: 60px !important;
            padding: 4px !important;
          }
        }
      `}</style>
    </div>
  );
}