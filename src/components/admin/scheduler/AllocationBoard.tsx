"use client";

import { useState, useEffect } from "react";

// --- 1. Data Intelligence Interfaces ---
interface Teacher {
  id: string;
  full_name: string;
  email: string;
  department: string;
}

interface Unit {
  id: string;
  name: string;
  year: string;
  semester: number;
}

interface Allocation {
  id: string;
  day_of_week: string;
  start_time: string;
  room_name: string;
  teacher_id: string;
  unit_id: string;
  teachers: { full_name: string; email: string; };
  units: { name: string; year: string; semester: number; };
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
  { label: "16:00", isBreak: false }, // ENSURED 16:00 IS PRESENT
];

export default function AllocationBoard() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentYear, setCurrentYear] = useState("Year 1"); 
  const [currentSemester, setCurrentSemester] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [filterTeacher, setFilterTeacher] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [currentYear, currentSemester]);

  async function fetchInitialData() {
    try {
      const [tRes, uRes, aRes] = await Promise.all([
        fetch("/api/admin/timeplanner/teachers"),
        fetch(`/api/admin/timeplanner/units?year=${currentYear}&semester=${currentSemester}`),
        fetch("/api/admin/timeplanner/allocations")
      ]);
      const tData = await tRes.json();
      const uData = await uRes.json();
      const aData = await aRes.json();
      
      if (tData.success) setTeachers(tData.teachers);
      if (uData.success) setUnits(uData.units);
      if (aData.success) setAllocations(aData.allocations);
    } catch (err) {
      console.error("Sync Error", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAllocate = async (day: string, time: string) => {
    if (editingId) {
      setIsProcessing(true);
      const res = await fetch(`/api/admin/timeplanner/allocate/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_of_week: day,
          start_time: time,
          teacher_id: selectedTeacher,
          unit_id: selectedUnit,
          room_name: roomName
        })
      });
      if (res.ok) { resetControls(); await fetchInitialData(); }
      setIsProcessing(false);
      return;
    }

    if (!selectedUnit || !selectedTeacher || !roomName) return alert("Select Unit, Teacher, and Room.");
    setIsProcessing(true);
    const res = await fetch("/api/admin/timeplanner/allocate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacher_id: selectedTeacher,
        unit_id: selectedUnit,
        day_of_week: day,
        start_time: time,
        room_name: roomName,
        academic_year: "2026/2027"
      })
    });
    if (res.ok) { resetControls(); await fetchInitialData(); }
    setIsProcessing(false);
  };

  const handleExecuteUpdate = async () => {
    if (!editingId) return;
    setIsProcessing(true);
    const res = await fetch(`/api/admin/timeplanner/allocate/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        teacher_id: selectedTeacher, 
        room_name: roomName, 
        unit_id: selectedUnit 
      })
    });
    if (res.ok) { resetControls(); await fetchInitialData(); }
    setIsProcessing(false);
  };

  const handleSilentDelete = async (id: string) => {
    const res = await fetch(`/api/admin/timeplanner/allocate/${id}`, { method: "DELETE" });
    if (res.ok) await fetchInitialData();
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch("/api/admin/timeplanner/publish", { method: "POST" });
      if (res.ok) {
        alert("Semester Timetable Published! Emails Dispatched. 🚀");
        await fetchInitialData();
      }
    } catch (err) {
      console.error("Publish Error:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const resetControls = () => {
    setEditingId(null); setSelectedUnit(""); setSelectedTeacher(""); setRoomName("");
  };

  const startEditing = (alloc: Allocation) => {
    setEditingId(alloc.id);
    setSelectedUnit(alloc.unit_id);
    setSelectedTeacher(alloc.teacher_id);
    setRoomName(alloc.room_name);
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse text-slate-700 uppercase text-xs">Syncing Academic Registry...</div>;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-700 max-w-full mx-auto">
      
      {/* 1. COMPACT NAV */}
      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <h3 className="text-[10px] font-black text-slate-900 uppercase">Class Selector</h3>
              <select value={currentYear} onChange={(e) => setCurrentYear(e.target.value)} className="bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-black outline-none border border-slate-300 text-slate-900">
                  <option value="Year 1">YEAR 1</option>
                  <option value="Year 2">YEAR 2</option>
                  <option value="Year 3">YEAR 3</option>
              </select>
              <select value={currentSemester} onChange={(e) => setCurrentSemester(Number(e.target.value))} className="bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-black outline-none border border-slate-300 text-slate-900">
                  <option value={1}>SEM 1</option>
                  <option value={2}>SEM 2</option>
              </select>
          </div>
          {editingId && (
              <button onClick={resetControls} className="text-[9px] font-black text-white bg-rose-600 px-4 py-1.5 rounded-lg hover:bg-rose-700 transition-all">CANCEL EDIT</button>
          )}
      </div>

      {/* 2. COMPACT EXECUTION PANEL */}
      <div className={`px-6 py-5 rounded-[1.5rem] border-2 transition-all flex flex-col lg:flex-row justify-between gap-4 items-center ${editingId ? 'bg-indigo-700 border-indigo-400' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 w-full">
              <div className="space-y-1">
                  <label className={`text-[9px] font-black uppercase ml-2 ${editingId ? 'text-indigo-100' : 'text-slate-500'}`}>Unit</label>
                  <select className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold outline-none text-slate-900" onChange={(e) => setSelectedUnit(e.target.value)} value={selectedUnit}>
                      <option value="">Select Unit...</option>
                      {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
              </div>
              <div className="space-y-1">
                  <label className={`text-[9px] font-black uppercase ml-2 ${editingId ? 'text-indigo-100' : 'text-slate-500'}`}>Lecturer</label>
                  <select className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold outline-none text-slate-900" onChange={(e) => setSelectedTeacher(e.target.value)} value={selectedTeacher}>
                      <option value="">Select Lecturer...</option>
                      {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
              </div>
              <div className="space-y-1">
                  <label className={`text-[9px] font-black uppercase ml-2 ${editingId ? 'text-indigo-100' : 'text-slate-500'}`}>Room</label>
                  <input type="text" placeholder="Room #" className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold outline-none text-slate-900" onChange={(e) => setRoomName(e.target.value)} value={roomName} />
              </div>
          </div>
          <button 
              onClick={editingId ? handleExecuteUpdate : () => {}}
              className={`px-8 py-3.5 font-black text-[10px] tracking-widest rounded-xl transition-all border-b-2 ${editingId ? 'bg-white text-indigo-700 border-indigo-300' : 'bg-slate-900 text-white border-slate-700 hover:bg-blue-700'}`}
          >
              {editingId ? (isProcessing ? "SAVING..." : "UPDATE") : "READY"}
          </button>
      </div>

      {/* 3. TIMETABLE GRID */}
      <div className="bg-white rounded-[1.5rem] border-2 border-slate-200 shadow-lg overflow-hidden border-b-8 border-b-slate-300">
          <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                  <thead>
                      <tr className="bg-slate-800">
                          <th className="p-4 text-left text-[10px] font-black text-white uppercase border-r border-slate-700">Day</th>
                          {TIME_SLOTS.map(s => <th key={s.label} className="p-4 text-center text-[10px] font-black text-white border-r border-slate-700 last:border-none">{s.label}</th>)}
                      </tr>
                  </thead>
                  <tbody>
                      {DAYS.map(day => (
                          <tr key={day} className="border-b border-slate-200 last:border-none">
                              <td className="p-4 text-[10px] font-black text-slate-900 bg-slate-50 border-r-2 border-slate-200 uppercase">{day.slice(0,3)}</td>
                              {TIME_SLOTS.map(slot => {
                                  const alloc = allocations.find(a => a.day_of_week === day && a.start_time === slot.label && a.units?.year === currentYear && a.units?.semester === currentSemester);
                                  if (slot.isBreak) return <td key={slot.label} className="p-1 bg-slate-100 border-r border-slate-200 text-center"><span className="rotate-[-90deg] inline-block text-[8px] font-black text-slate-400 tracking-tighter">{slot.title}</span></td>;
                                  return (
                                      <td key={slot.label} onClick={() => !alloc && handleAllocate(day, slot.label)} className={`p-1.5 min-w-[150px] border-r border-slate-100 last:border-none relative ${!alloc ? "cursor-crosshair hover:bg-blue-50" : ""}`}>
                                          {alloc ? (
                                              <div onClick={(e) => { e.stopPropagation(); startEditing(alloc); }} className={`p-3 rounded-xl transition-all shadow-sm min-h-[85px] flex flex-col justify-center border-b-2 ${editingId === alloc.id ? 'bg-indigo-600 text-white border-indigo-800 ring-2 ring-indigo-200' : 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800'}`}>
                                                  <p className="text-[10px] font-black leading-tight mb-1 uppercase line-clamp-2">{alloc.units?.name}</p>
                                                  <p className={`text-[8px] font-bold uppercase truncate ${editingId === alloc.id ? 'text-indigo-100' : 'text-blue-300'}`}>{alloc.teachers?.full_name}</p>
                                                  <p className="mt-1 text-[8px] font-black text-slate-400 uppercase tracking-tighter italic">{alloc.room_name}</p>
                                              </div>
                                          ) : <div className="h-16 flex items-center justify-center border border-dashed border-slate-200 bg-slate-50/30 rounded-xl"><span className="text-[8px] font-black text-slate-200 uppercase tracking-widest">Available</span></div>}
                                      </td>
                                  );
                              })}
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      {/* 4. MANAGEMENT LIST */}
      <div className="bg-white rounded-[1.5rem] border-2 border-slate-200 shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="text-[11px] font-black text-slate-900 uppercase">Active Allocations</h3>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select 
                  className="bg-white p-2.5 rounded-lg border border-slate-200 text-[10px] font-black text-slate-900 outline-none w-full md:w-48 shadow-sm"
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
                >
                  <option value="">All Lecturers</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.full_name}>{t.full_name}</option>
                  ))}
                </select>

                <button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="px-6 py-2.5 bg-emerald-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest border-b-2 border-emerald-800 hover:bg-emerald-700 disabled:bg-slate-200 transition-all shadow-md"
                >
                  {isPublishing ? "SENDING..." : "PUBLISH TIMETABLE"}
                </button>
              </div>
          </div>
          
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 bg-white">
              {allocations
                .filter(a => a.units?.year === currentYear && a.units?.semester === currentSemester)
                .filter(a => filterTeacher === "" || a.teachers?.full_name === filterTeacher)
                .map(a => (
                  <div key={a.id} className={`p-4 rounded-xl border-2 transition-all ${editingId === a.id ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-100' : 'bg-slate-50 border-slate-200 hover:border-slate-400'}`}>
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-[8px] font-black px-2 py-0.5 bg-slate-800 text-white rounded uppercase">{a.day_of_week.slice(0,3)} {a.start_time}</span>
                          <div className="flex gap-3">
                              <button onClick={() => startEditing(a)} className="text-[9px] font-black text-indigo-700 hover:scale-110 transition-transform uppercase">Edit</button>
                              <button onClick={() => handleSilentDelete(a.id)} className="text-[9px] font-black text-rose-600 hover:scale-110 transition-transform uppercase">Del</button>
                          </div>
                      </div>
                      <p className="text-[10px] font-black text-slate-900 leading-tight uppercase line-clamp-1">{a.units?.name}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{a.teachers?.full_name}</p>
                      <p className="mt-1 text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{a.room_name}</p>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}