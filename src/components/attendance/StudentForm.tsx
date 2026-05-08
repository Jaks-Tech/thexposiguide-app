"use client";

import { useState } from "react";
import { ArrowRight, Loader2, GraduationCap } from "lucide-react";

type Props = {
  onSubmit: (data: { name: string; admissionNumber: string }) => void;
  loading?: boolean;
};

export default function StudentForm({ onSubmit, loading }: Props) {
  const [name, setName] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isFormValid =
    name.trim().length > 2 && admissionNumber.trim().length > 2;

  const handleSubmit = () => {
    if (loading || submitted || !isFormValid) return;

    setSubmitted(true);
    onSubmit({
      name: name.trim(),
      admissionNumber: admissionNumber.trim(),
    });
  };

  return (
    <div className="mt-[10vh] px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-8 w-full max-w-sm mx-auto p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-2">
            <GraduationCap size={32} strokeWidth={1.5} />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Student Details
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Verify your identity to complete records
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            disabled={loading || submitted}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-900 placeholder:text-slate-400 font-medium disabled:opacity-60"
          />

          <input
            type="text"
            placeholder="Admission Number"
            value={admissionNumber}
            disabled={loading || submitted}
            onChange={(e) => setAdmissionNumber(e.target.value)}
            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-900 placeholder:text-slate-400 font-medium disabled:opacity-60"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || submitted || !isFormValid}
          className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-5 text-base font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-[0.97] disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed"
        >
          {loading || submitted ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>Submit Attendance</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}