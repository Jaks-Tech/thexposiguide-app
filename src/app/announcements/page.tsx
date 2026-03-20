import { supabaseAdmin } from "@/lib/supabaseServer";
import { Bell, Calendar, Clock, Megaphone, Info } from "lucide-react";

import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  // 1. Added .eq("is_active", true) to ensure we only get active records
  const { data, error } = await supabaseAdmin
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("start_time", { ascending: false });

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex items-center gap-3 bg-red-50 text-red-700 px-6 py-4 rounded-xl border border-red-100 shadow-sm">
          <Info className="w-5 h-5" />
          <p className="font-medium">
            We couldn't load the announcements right now.
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const nowTime = now.getTime();

  // 🛡️ FIXED Logic: 
  // We only care if the announcement hasn't expired yet!
  const activeAnnouncements = (data || []).filter((a) => {
    const end = new Date(a.end_time).getTime();
    return nowTime <= end; // As long as "now" is before the "end", show it!
  });

  return (
    <main className="relative min-h-screen px-4 py-12 md:py-20">
      {/* 🌈 Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-200/30 blur-[120px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto">
        <header className="mb-16">
          <div className="relative max-w-3xl mx-auto text-center p-8 md:p-10 rounded-3xl bg-white/50 backdrop-blur-xl border border-slate-200/60 shadow-sm">
            {/* ✨ subtle glow on hover */}
            <div className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-xl" />

            <div className="relative">
              <div className="inline-flex items-center justify-center p-4 bg-white/70 backdrop-blur rounded-2xl shadow-sm mb-4 border border-slate-200">
                <Megaphone className="w-8 h-8 text-blue-600" />
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                Latest{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Updates
                </span>
              </h1>

              <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
                Stay updated with important academic announcements, assignment deadlines, and system notices.
              </p>
            </div>
          </div>
        </header>

        {activeAnnouncements.length === 0 ? (
          /* ✨ Empty State */
          <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-3xl p-16 text-center shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              You're all caught up!
            </h3>
            <p className="text-slate-500">
              There are no active announcements at the moment.
            </p>
            
          </div>
          
        ) : (
          /* 🗂️ Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeAnnouncements.map((announcement) => {
              const startTime = new Date(announcement.start_time).getTime();
              const endTime = new Date(announcement.end_time).getTime();
              
              // Use Math.abs to handle upcoming announcements properly for the "New" badge
              const isNew = Math.abs(nowTime - startTime) < 48 * 60 * 60 * 1000;
              const isEndingSoon = endTime - nowTime < 24 * 60 * 60 * 1000;

              return (
                <Link
                  key={announcement.id}
                  href={`/announcements/${encodeURIComponent(announcement.title)}`}
                  className="group block h-full"
                >
                  <article className="relative flex flex-col p-6 rounded-2xl bg-white/70 backdrop-blur border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer h-full">
                    {/* Glow effect needs to be behind the text */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-xl pointer-events-none" />

                    <div className="relative z-10 flex justify-between items-start mb-4 gap-3">
                      <h2 className="text-lg font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition">
                        {announcement.title}
                      </h2>

                      <div className="flex flex-col gap-1 items-end shrink-0">
                        {isNew && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase shadow-sm">
                            New
                          </span>
                        )}
                        {isEndingSoon && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase shadow-sm">
                            Soon
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="relative z-10 text-slate-600 text-sm leading-relaxed mb-6 line-clamp-5 flex-grow">
                      {announcement.message}
                    </p>

                    <div className="relative z-10 mt-auto pt-4 border-t border-slate-200/60 space-y-2 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>
                          {new Date(announcement.start_time).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>
                          Until{" "}
                          {new Date(announcement.end_time).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
            
          </div>
        )}
      </div>
    </main>
  );
}