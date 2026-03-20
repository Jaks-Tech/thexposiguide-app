import { supabaseAdmin } from "@/lib/supabaseServer";
import Link from "next/link";
import { BookOpen, Clock, FileText, FileX, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const { data: assignments, error } = await supabaseAdmin
    .from("assignments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex items-center gap-3 bg-red-50 text-red-700 px-6 py-4 rounded-xl border border-red-100 shadow-sm">
          <FileX className="w-5 h-5" />
          <p className="font-medium">Error loading assignments: {error.message}</p>
        </div>
      </div>
    );
  }

  const now = new Date();

  // 🛡️ Filter assignments to only show those that haven't expired yet
  const activeAssignments = assignments?.filter((assignment) => {
    if (!assignment.deadline) return true; // Keep if no deadline is set
    return new Date(assignment.deadline) >= now; // Keep if deadline is in the future or exactly now
  }) || [];

  return (
    <main className="relative min-h-screen py-16 px-4">
      {/* 🌈 Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50" />

      {/* ✨ Soft Glow Accent */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-200/30 blur-[120px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto">
        <header className="mb-16">
          <div className="max-w-3xl mx-auto text-center p-8 md:p-10 rounded-3xl bg-white/50 backdrop-blur-xl border border-slate-200/60 shadow-sm">
            <div className="inline-flex items-center justify-center p-4 bg-white/70 backdrop-blur rounded-2xl shadow-sm mb-4 border border-slate-200">
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              Course{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Assignments
              </span>
            </h1>

            <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
              Access course assignments, detailed instructions, and submission deadlines to stay on track with your academic work.
            </p>
          </div>
        </header>

        {activeAssignments.length === 0 ? (
          /* ✨ Empty State (Triggered if no assignments or all expired) */
          <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-3xl p-16 text-center shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No active assignments!
            </h3>
            <p className="text-slate-500">
              You're all caught up with your coursework. Enjoy your free time.
            </p>
          </div>
        ) : (
          /* 🗂️ Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeAssignments.map((assignment) => {
              // Note: hasDeadlinePassed will always be false here because of the filter, 
              // but we'll keep the logic clean in case you change the filter later.
              const hasDeadlinePassed =
                assignment.deadline && new Date(assignment.deadline) < now;

              return (
                <article
                  key={assignment.id}
                  className="group relative flex flex-col p-6 rounded-2xl bg-white/70 backdrop-blur border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-xl" />

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {assignment.year.replace("-", " ")}
                    </span>
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Sem {assignment.semester}
                    </span>
                    <span
                      className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full truncate max-w-[140px]"
                      title={assignment.unit_name}
                    >
                      {assignment.unit_name}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-grow flex flex-col mb-4">
                    <Link href={`/assignments/${encodeURIComponent(assignment.title)}`}>
                      <h2 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition">
                        {assignment.title}
                      </h2>
                    </Link>

                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-4">
                      {assignment.description || "No description provided."}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
                    {/* Deadline */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>Due Date</span>
                      </div>

                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          hasDeadlinePassed
                            ? "bg-red-100 text-red-600"
                            : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        {assignment.deadline
                          ? new Date(assignment.deadline).toLocaleDateString()
                          : "No deadline"}
                      </span>
                    </div>

                    {/* Button */}
                    <Link
                    href={`/assignments/${encodeURIComponent(assignment.title)}`}
                    className="relative z-10 flex items-center justify-center gap-2 
                                w-full bg-gradient-to-r from-indigo-600 to-purple-600 
                                hover:opacity-95 active:scale-[0.98] text-white font-medium 
                                py-3 rounded-xl transition-all shadow-md group/btn"
                    >
                    <span className="relative z-20 flex items-center gap-2">
                        View Full Details
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}