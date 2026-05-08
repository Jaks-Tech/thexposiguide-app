"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Users, 
  Calendar, 
  Clock, 
  FileDown, 
  RefreshCcw, 
  ArrowLeft, 
  Search,
  UserCheck,
  CheckCircle2,
  Loader2,
  Wifi
} from "lucide-react";
import Link from "next/link";

type Record = {
  name: string;
  admission_number: string;
  timestamp: string;
};

type Session = {
  year: string;
  semester: string;
  class_start_time: string;
  class_end_time: string;
};

export default function ReportPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ReportContent />
    </Suspense>
  );
}

function ReportContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  const [records, setRecords] = useState<Record[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReport = useCallback(async (showRefreshIcon = false) => {
    if (!sessionId) return;
    if (showRefreshIcon) setIsRefreshing(true);
    
    try {
      const res = await fetch(`/api/attendance/report/${sessionId}`, {
        cache: 'no-store' // Ensure we don't get cached data
      });
      const data = await res.json();
      
      // Only update state if the data has actually changed to prevent unnecessary re-renders
      setRecords(data.records || []);
      setSession(data.session);
      setCount(data.count || 0);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      if (showRefreshIcon) setIsRefreshing(false);
      setLoading(false);
    }
  }, [sessionId]);

  // 1. Initial Load
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // 2. LIVE POLLING: Fetch data every 5 seconds
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(() => {
      fetchReport(false); // Fetch silently in the background
    }, 5000); 

    return () => clearInterval(interval);
  }, [sessionId, fetchReport]);

  if (!sessionId) return <ErrorState message="No session ID provided" />;
  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 animate-in fade-in duration-500">
      {/* Header / Nav */}
      <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/admin/attendance" className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all font-bold text-sm">
            <div className="p-1.5 rounded-lg group-hover:bg-blue-50 transition-colors">
                <ArrowLeft size={16} />
            </div>
            <span>Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                <Wifi size={14} className="text-blue-600 animate-pulse" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Live Sync</span>
            </div>

            <button 
              onClick={() => fetchReport(true)}
              className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              title="Manual Refresh"
            >
              <RefreshCcw size={18} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => window.open(`/api/attendance/pdf/${sessionId}`, "_blank")}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20"
            >
              <FileDown size={18} />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 mt-10 space-y-8">
        {/* Top Info & Stats */}
        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Attendance Report</h1>
            <p className="text-slate-500 font-medium italic">Data updates automatically every 5s</p>
          </div>
          
          <div className="w-full md:w-auto bg-white border border-slate-200 p-2 rounded-[2rem] flex items-center gap-2 pr-6 shadow-sm">
            <div className="h-14 w-14 bg-blue-600 rounded-[1.4rem] flex items-center justify-center text-white shadow-lg shadow-blue-200 transition-transform duration-500">
                <Users size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Students Present</p>
                <p className="text-2xl font-black text-slate-900 tabular-nums">
                    {count}
                </p>
            </div>
          </div>
        </div>

        {/* ... rest of the metadata cards and table remain the same ... */}
        {/* Metadata Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoTile icon={<Calendar size={20}/>} label="Academic Year" value={`Year ${session?.year}`} color="text-amber-600" bg="bg-amber-50" />
          <InfoTile icon={<UserCheck size={20}/>} label="Semester" value={`Semester ${session?.semester}`} color="text-purple-600" bg="bg-purple-50" />
          <InfoTile icon={<Clock size={20}/>} label="Class Window" value={`${session?.class_start_time} - ${session?.class_end_time}`} color="text-blue-600" bg="bg-blue-50" />
        </div>

        {/* The List */}
        <div className="bg-white border border-slate-200/60 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Admission No.</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Signed In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records.length > 0 ? (
                records.map((r, index) => (
                  <tr key={index} className="group hover:bg-slate-50/50 transition-all duration-300 animate-in slide-in-from-left-2 fade-in">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          {index + 1}
                        </div>
                        <span className="font-bold text-slate-900">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{r.admission_number}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-sm font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                        {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyState />
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

// ... Utility components (InfoTile, LoadingState, ErrorState, EmptyState) ...
function InfoTile({ icon, label, value, color, bg }: any) {
    return (
      <div className="bg-white border border-slate-200/60 p-5 rounded-3xl flex items-center gap-4 transition-transform hover:scale-[1.02]">
        <div className={`p-3 ${bg} ${color} rounded-2xl`}>{icon}</div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
          <p className="text-sm font-bold text-slate-900">{value}</p>
        </div>
      </div>
    );
  }
  
  function LoadingState() {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 text-slate-400 bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="font-bold tracking-widest uppercase text-xs">Compiling Report...</p>
      </div>
    );
  }
  
  function ErrorState({ message }: { message: string }) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-white">
        <div className="h-20 w-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center">
          <Search size={40} />
        </div>
        <h2 className="text-xl font-black text-slate-900">{message}</h2>
        <Link href="/admin/attendance" className="text-blue-600 font-bold hover:underline">Return to Dashboard</Link>
      </div>
    );
  }
  
  function EmptyState() {
    return (
      <tr>
        <td colSpan={3} className="py-32">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-16 w-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} strokeWidth={1} />
            </div>
            <p className="text-slate-400 font-medium italic">Waiting for students to check in...</p>
          </div>
        </td>
      </tr>
    );
  }