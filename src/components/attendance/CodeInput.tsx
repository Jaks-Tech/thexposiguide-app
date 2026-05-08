"use client";

import { useState, ChangeEvent } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

type Props = {
  onSubmit: (code: string) => void;
  loading?: boolean;
};

export default function CodeInput({ onSubmit, loading }: Props) {
  const [code, setCode] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(val);
  };

  const isReady = code.length === 6;

  return (
    /* mt-[10vh] ensures it sits perfectly below a top header without being cramped */
    <div className="mt-[10vh] px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-8 w-full max-w-sm mx-auto p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-blue-900/5">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-2">
            <ShieldCheck size={32} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Attendance Code
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed px-4">
              Enter the 6-digit code provided by your lecturer to mark your attendance.
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="relative group">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={code}
            onChange={handleChange}
            disabled={loading}
            className="w-full text-center text-4xl font-mono tracking-[0.4em] py-6 border-2 border-slate-100 bg-slate-50/50 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all outline-none placeholder:opacity-0"
          />

        </div>

        {/* Action Button */}
        <div className="space-y-4">
          <button
            onClick={() => onSubmit(code)}
            disabled={loading || !isReady}
            className="relative flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 py-5 text-base font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-[0.97] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              "Confirm Attendance"
            )}
          </button>
          
          <div className="flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Code expires in 10 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}