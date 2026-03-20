"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Announcement {
  id: string;
  title: string;
  message: string;
  start_time: string;
  end_time: string;
  repeat_rule?: string | null;
  type?: string;
  link?: string; // 🔥 NEW (for navigation)
}

/* -------------------------------------------
   CATEGORY DETECTOR
------------------------------------------- */
function getCategory(a: Announcement) {
  const t = a.title.toLowerCase();

  if (a.type === "assignment")
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
   WIDGET
------------------------------------------- */
export default function AnnouncementsWidget() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const router = useRouter();

  /* Live Clock */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* Load data */
  useEffect(() => {
    async function loadAll() {
      try {
        // 🔹 1. Fetch announcements (API)
        const res = await fetch("/api/announcements/active?includeUpcoming=true");
        const data = await res.json();

        const baseAnnouncements: Announcement[] = [
          ...(data.active || []),
          ...(data.upcoming || []),
        ];

        // 🔹 2. Fetch assignments (Supabase)
        const { data: assignments } = await supabase
          .from("assignments")
          .select("id, title, deadline, unit_name, created_at");

        let assignmentAnnouncements: Announcement[] = [];

        if (assignments) {
          assignmentAnnouncements = assignments.map((a) => ({
            id: `assignment-${a.id}`,
            title: a.title,
            message: `New assignment for ${a.unit_name || "your unit"}`,
            start_time: a.created_at || new Date().toISOString(),
            end_time:
              a.deadline ||
              new Date(Date.now() + 86400000).toISOString(),
            type: "assignment",
            link: "/assignments", // 🔥 clickable
          }));
        }

        // 🔹 3. Merge
        const merged = [...assignmentAnnouncements, ...baseAnnouncements];

        // 🔹 4. Sort
        merged.sort(
          (a, b) =>
            new Date(b.start_time).getTime() -
            new Date(a.start_time).getTime()
        );

        setAnnouncements(merged);
      } catch (err) {
        console.error("❌ Load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
    const interval = setInterval(loadAll, 60_000);
    return () => clearInterval(interval);
  }, []);

  /* Countdown */
  const formatCountdown = (endTime: string) => {
    const diff = new Date(endTime).getTime() - now.getTime();
    if (diff <= 0) return "Expired";

    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  /* Remove expired */
  useEffect(() => {
    setAnnouncements((prev) =>
      prev.filter((a) => new Date(a.end_time) > now)
    );
  }, [now]);

  /* Loading */
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center p-6 bg-blue-50 border border-blue-200 rounded-2xl shadow-sm">
        <p className="text-blue-600 animate-pulse">Loading updates...</p>
      </div>
    );
  }

  /* Empty */
  if (announcements.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center p-6 bg-neutral-50 border border-neutral-200 rounded-2xl shadow-sm">
        <p className="text-neutral-500">No updates right now 🎉</p>
      </div>
    );
  }

  /* Render */
  return (
    <div className="w-full max-w-5xl mx-auto mt-10 mb-14 px-4 sm:px-6 flex justify-center">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-4xl">
        
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center">
          💫 Highlights
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((a) => {
            const countdown = formatCountdown(a.end_time);
            const category = getCategory(a);

            return (
              <div
                key={a.id}
                onClick={() => a.link && router.push(a.link)}
                className="
                  cursor-pointer
                  p-4 bg-white text-blue-800 rounded-xl shadow-md
                  hover:shadow-lg hover:-translate-y-1 transition
                  flex flex-col justify-between h-[200px]
                "
              >
                {/* Category bar */}
                <div className={`h-[4px] w-full rounded-full bg-gradient-to-r ${category.gradient} mb-3`} />

                <h3 className="font-bold text-lg flex items-center gap-2 mb-1">
                  <span>{category.icon}</span> {a.title}
                </h3>

                <p className="text-sm text-neutral-600 line-clamp-2">
                  {a.message}
                </p>

                <div className="text-xs text-neutral-500 mt-2">
                  🕒 Until {new Date(a.end_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div className="font-mono text-center text-blue-700 text-lg bg-blue-50 rounded-lg py-1 mt-2">
                  ⏳ {countdown}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}