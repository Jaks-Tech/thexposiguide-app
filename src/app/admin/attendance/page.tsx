"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, Radio, PlusCircle, ChevronDown, Clock, BarChart3, ExternalLink, Trash2 } from "lucide-react";

export default function CreateSessionPage() {
  const router = useRouter();

  // Form States
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Active Session State
  const [activeSession, setActiveSession] = useState<{
    id: string;
    code: string;
    expiresAt: string;
  } | null>(null);

  const [timeLeft, setTimeLeft] = useState<string>("");

  // 1. Check for existing session on load
  useEffect(() => {
    const saved = localStorage.getItem("active_attendance_session");
    if (saved) {
      const parsed = JSON.parse(saved);
      const expiryDate = new Date(parsed.expiresAt);
      
      if (expiryDate > new Date()) {
        setActiveSession(parsed);
      } else {
        localStorage.removeItem("active_attendance_session");
      }
    }
  }, []);

  // 2. Countdown Timer & Auto-disappear Logic
  useEffect(() => {
    if (!activeSession) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiryTime = new Date(activeSession.expiresAt).getTime();
      const distance = expiryTime - now;

      if (distance <= 0) {
        // AUTO DISAPPEAR: Clear session when time is up
        setActiveSession(null);
        localStorage.removeItem("active_attendance_session");
        clearInterval(timer);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  const handleCreate = async () => {
    if (!year || !semester || !startTime || !endTime || !email) {
      setStatus("⚠️ Please fill all fields");
      return;
    }

    setLoading(true);
    setStatus("📍 Getting location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch("/api/attendance/create-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              year, semester, classStartTime: startTime,
              classEndTime: endTime, lecturerEmail: email,
              latitude, longitude,
            }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          const sessionData = { id: data.id, code: data.code, expiresAt: data.expiresAt };
          
          // Save to LocalStorage for persistence
          localStorage.setItem("active_attendance_session", JSON.stringify(sessionData));
          setActiveSession(sessionData);

          // Redirect to Live View
          router.push(`/admin/attendance/live?session=${data.id}&code=${data.code}&expires=${data.expiresAt}`);
        } catch (err: any) {
          setStatus(`❌ ${err.message || "Error"}`);
        } finally {
          setLoading(false);
        }
      },
      () => { setLoading(false); setStatus("❌ Location denied"); },
      { enableHighAccuracy: true }
    );
  };

  // UI for Active Session (Persistence Card)
  if (activeSession) {
    return (
      <div className="mt-[10vh] px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col gap-6 w-full max-w-lg mx-auto p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Active Now
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs font-mono bg-slate-50 px-3 py-1 rounded-lg">
              <Clock size={12} /> {timeLeft}
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attendance Code</p>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">{activeSession.code}</h1>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push(`/admin/attendance/live?session=${activeSession.id}&code=${activeSession.code}&expires=${activeSession.expiresAt}`)}
              className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
            >
              <ExternalLink size={18} /> Live View
            </button>
            <button
              // FIXED: Uses query parameter ?session= to match Report Page logic
              onClick={() => router.push(`/admin/attendance/report?session=${activeSession.id}`)}
              className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95"
            >
              <BarChart3 size={18} /> Report
            </button>
          </div>

          <button 
            onClick={() => { if(confirm("End this session?")) { localStorage.removeItem("active_attendance_session"); setActiveSession(null); } }}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1"
          >
            <Trash2 size={12} /> Clear session and create new
          </button>
        </div>
      </div>
    );
  }

  // UI for Creation Form (Visible when no active session exists)
  return (
    <div className="mt-[10vh] px-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-8 w-full max-w-lg mx-auto p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition-transform hover:scale-105 duration-300">
              <Radio size={32} className={loading ? "animate-pulse" : ""} />
            </div>
            {!loading && (
              <div className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white"></span>
              </div>
            )}
          </div>
          <div className="space-y-2 px-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Initialize Live Attendance
            </h2>
            <p className="text-[14px] text-slate-500 leading-relaxed max-w-[280px] mx-auto">
              Configure your class parameters. Your <strong>current coordinates</strong> will be used as the geofence center.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Year</label>
              <div className="relative">
                <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer text-slate-900">
                  <option value="" disabled>Select Year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Semester</label>
              <div className="relative">
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer text-slate-900">
                  <option value="" disabled>Select Sem</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-slate-100"></div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap">Select Class Session</p>
            <div className="h-[1px] flex-1 bg-slate-100"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 ml-1 block">Start Time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-900" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 ml-1 block">End Time</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-900" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Lecturer Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="lecturer@uni.edu" className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-900" />
          </div>
        </div>

        <div className="space-y-4">
          <button onClick={handleCreate} disabled={loading} className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-5 text-base font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-[0.97] disabled:bg-slate-100 disabled:text-slate-400">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><PlusCircle size={20} /> <span>Start Session</span></>}
          </button>
          {status && <div className={`text-center py-3 px-4 rounded-xl text-sm font-semibold animate-in fade-in zoom-in-95 ${status.startsWith("❌") || status.startsWith("⚠️") ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>{status}</div>}
        </div>
      </div>
    </div>
  );
}