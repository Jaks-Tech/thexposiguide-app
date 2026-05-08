"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading receipt...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const name = searchParams.get("name");
  const admission = searchParams.get("admission");
  const time = searchParams.get("time");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-md w-full text-center border border-slate-100">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-3xl">
            OK
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Attendance Recorded
        </h2>

        <p className="text-slate-500 mb-6">
          Your attendance has been successfully submitted.
        </p>

        <div className="bg-slate-50 rounded-2xl p-4 text-left border">
          <p className="text-sm text-slate-500">Name</p>
          <p className="font-semibold text-slate-800">{name || "N/A"}</p>

          <div className="mt-3">
            <p className="text-sm text-slate-500">Admission Number</p>
            <p className="font-semibold text-slate-800">
              {admission || "N/A"}
            </p>
          </div>

          <div className="mt-3">
            <p className="text-sm text-slate-500">Time</p>
            <p className="font-semibold text-slate-800">
              {time ? new Date(Number(time)).toLocaleTimeString() : "N/A"}
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
        >
          Close
        </button>

        <p className="text-xs text-slate-400 mt-4">
          You may now close this page.
        </p>
      </div>
    </div>
  );
}
