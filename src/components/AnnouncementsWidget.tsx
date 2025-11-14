"use client";
import { useEffect, useState } from "react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  start_time: string;
  end_time: string;
  repeat_rule?: string | null;
}

/* -------------------------------------------
   CATEGORY DETECTOR (✨NEW FEATURE)
------------------------------------------- */
function getCategory(a: Announcement) {
  const t = a.title.toLowerCase();

  if (t.includes("assignment"))
    return { icon: "📂", gradient: "from-purple-500 to-pink-400" };

  if (t.includes("exam"))
    return { icon: "📝", gradient: "from-red-500 to-orange-400" };

  if (t.includes("class") || t.includes("lecture") || t.includes("session"))
    return { icon: "🎓", gradient: "from-blue-500 to-cyan-400" };

  if (t.includes("event"))
    return { icon: "🎉", gradient: "from-emerald-500 to-green-400" };

  return { icon: "📘", gradient: "from-indigo-500 to-blue-400" };
}

/* -------------------------------------------
   ANNOUNCEMENT WIDGET
------------------------------------------- */
export default function AnnouncementsWidget() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date>(new Date());

  // 🕜 Live ticking every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔄 Fetch announcements every minute
  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const res = await fetch("/api/announcements/active?includeUpcoming=true");
        const data = await res.json();

        const combined = [
          ...(data.active || []),
          ...(data.upcoming || []),
        ] as Announcement[];

        setAnnouncements(combined);
      } catch (err) {
        console.error("❌ Failed to load announcements:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAnnouncements();
    const refreshInterval = setInterval(loadAnnouncements, 60_000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Countdown formatter (HH:MM:SS)
  function getCountdown(endTime: string) {
    const diff = new Date(endTime).getTime() - now.getTime();
    if (diff <= 0) return "Expired";

    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Remove expired announcements gracefully
  useEffect(() => {
    const filtered = announcements.filter((a) => new Date(a.end_time) > now);
    if (filtered.length !== announcements.length) {
      setAnnouncements(filtered);
    }
  }, [now, announcements]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center p-6 bg-blue-50 border border-blue-200 rounded-2xl shadow-sm">
        <p className="text-blue-600 animate-pulse">Loading announcements...</p>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center p-6 bg-neutral-50 border border-neutral-200 rounded-2xl shadow-sm">
        <p className="text-neutral-500">No active announcements right now 🎉</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 mb-14 px-4 sm:px-6 flex justify-center">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl shadow-lg p-6 sm:p-8 relative overflow-hidden w-full max-w-4xl">

        <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center">
          💫 Highlights
        </h2>

        {/* Cards container */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {announcements.map((a) => {
            const countdown = getCountdown(a.end_time);
            const hasStarted = new Date(a.start_time) <= now;
            const hasExpired = countdown === "Expired";
            const category = getCategory(a); // ✨ NEW

            return (
              <div
                key={a.id}
                className={`
                  relative p-4 bg-white text-blue-800 rounded-xl shadow-md
                  hover:shadow-lg transition duration-500 transform hover:-translate-y-1
                  flex flex-col justify-between
                  h-[200px]  /* consistent height */
                  ${hasExpired ? "opacity-0 scale-95" : "opacity-100"}
                `}
              >
                {/* Top Bar with category gradient */}
                <div
                  className={`h-[4px] w-full rounded-full bg-gradient-to-r ${category.gradient} mb-3`}
                />

                {/* Title with category icon */}
                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                  <span>{category.icon}</span> {a.title}
                </h3>

                <p className="text-sm text-neutral-600 mb-2">
                  {a.message}
                </p>

                <div className="text-xs text-neutral-500 mb-1">
                  {hasStarted ? "🕒 Ends at" : "⏰ Starts at"}{" "}
                  {new Date(a.end_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                {!hasExpired && (
                  <div className="font-mono text-center text-blue-700 text-lg mt-1 bg-blue-50 rounded-lg py-1">
                    ⏳ {countdown}
                  </div>
                )}

                {a.repeat_rule && (
                  <div className="text-xs mt-2 text-green-600 font-medium">
                    🔁 {a.repeat_rule.toUpperCase()} recurrence
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
