"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BreakReminderProps {
  durationMinutes?: number;
}

export default function BreakReminder({
  durationMinutes = 30,
}: BreakReminderProps) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const durationMs = durationMinutes * 60 * 1000;
    const startTime = Date.now();

    const timer = setTimeout(() => {
      const lastBreak = localStorage.getItem("xposi_last_break");

      if (!lastBreak || startTime - Number(lastBreak) > durationMs) {
        setShowModal(true);
        localStorage.setItem("xposi_last_break", startTime.toString());
      }
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMinutes]);

  return (
    <>
{/* Floating Button - Adjusted for visibility */}
      <div className="fixed top-24 right-6 z-[100] pointer-events-auto">
        <Link
          href="/games"
          className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-full bg-blue-700 hover:bg-blue-600 text-white transition shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] border border-blue-400/20"
        >
          🎮 Study Break → Games
        </Link>
      </div>

      {/* 30-Minute Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-blue-800 to-gray-900 border border-white/10 shadow-2xl p-8 text-white text-center">
            
            <h2 className="text-xl font-bold mb-4">
              Time for a Break?
            </h2>

            <p className="text-sm text-blue-100/80 mb-6">
              You've been reviewing for a while. A short break improves focus.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                Continue
              </button>

              <Link
                href="/games"
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 transition font-semibold"
              >
                Take a Break 🎮
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}