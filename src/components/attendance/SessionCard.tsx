"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Copy, 
  Check, 
  Clock, 
  Loader2, 
  AlertCircle, 
  Activity,
  ArrowLeft,
  Mail,
  MessageCircle,
  BarChart3,
  ChevronRight
} from "lucide-react";

type Session = {
  id: string;
  code: string;
  expires_at: string;
};

export default function SessionCard() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyAll, setCopyAll] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/attendance/report/${sessionId}`);
        const data = await res.json();
        setSession(data.session);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const link = session ? `${window.location.origin}/attendance?session=${session.id}` : "";
  const shareText = session ? `Join the live attendance session.\nCode: ${session.code}\nLink: ${link}` : "";

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopyAll(true);
    setTimeout(() => setCopyAll(false), 2000);
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const shareEmail = () => {
    const url = `mailto:?subject=Attendance Session Details&body=${encodeURIComponent(shareText)}`;
    window.location.href = url;
  };

  if (!sessionId) return <ErrorState message="No session ID provided" />;
  if (loading) return <LoadingState />;
  if (!session) return <ErrorState message="Session not found" />;

  return (
    <div className="mt-[5vh] px-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-6 w-full max-w-lg mx-auto p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
        
        {/* Header: Live Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-nowrap">Live Session</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Clock size={14} />
            <span className="font-medium text-nowrap">
              Ends {new Date(session.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Big Attendance Code */}
        <div className="relative group text-center py-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Attendance Entry Code</p>
          <h1 className="text-6xl font-black tracking-[0.15em] text-slate-900 font-mono">
            {session.code}
          </h1>
        </div>

        {/* Unified Share Section */}
        <div className="space-y-4">
          <button 
            onClick={() => copyToClipboard(shareText)}
            className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-base transition-all active:scale-[0.98] shadow-lg ${
              copyAll 
                ? "bg-emerald-500 text-white shadow-emerald-100" 
                : "bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700"
            }`}
          >
            {copyAll ? <Check size={20} /> : <Copy size={20} />}
            <span>{copyAll ? "Copied to Clipboard!" : "Share the link and code"}</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity active:scale-95"
            >
              <MessageCircle size={18} />
              WhatsApp
            </button>
            <button 
              onClick={shareEmail}
              className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95"
            >
              <Mail size={18} />
              Email
            </button>
          </div>
        </div>

        {/* Navigation to Live Report */}
        <div className="pt-4 border-t border-slate-50">
          <Link 
            href={`/admin/attendance/report?session=${sessionId}`}
            className="group flex items-center justify-center gap-3 w-full py-5 bg-slate-50 text-slate-900 rounded-2xl font-black text-sm hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95"
          >
            <BarChart3 size={18} />
            <span>See Live Attendance</span>
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Info Footer */}
        <div className="pt-2 flex items-center gap-4 text-center opacity-50">
            <div className="flex-1 h-[1px] bg-slate-100" />
            <div className="flex items-center gap-2 text-slate-400">
                <Activity size={14} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Broadcasting Live</span>
            </div>
            <div className="flex-1 h-[1px] bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4 text-slate-400">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="font-bold tracking-widest uppercase text-xs animate-pulse">Syncing Session...</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-3 text-red-500">
      <AlertCircle size={40} strokeWidth={1.5} />
      <p className="font-bold">{message}</p>
      <Link href="/admin/attendance" className="text-sm font-semibold text-slate-500 hover:underline">Return to Dashboard</Link>
    </div>
  );
}