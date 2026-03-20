import { supabaseAdmin } from "@/lib/supabaseServer";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Megaphone,
  AlertCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AnnouncementDetailPage(props: PageProps) {
  const resolvedParams = await props.params;

  // Decode slug
  const decodedTitle = decodeURIComponent(resolvedParams.slug);

  const { data: announcement, error } = await supabaseAdmin
    .from("announcements")
    .select("*")
    .eq("title", decodedTitle)
    .single();

  if (error || !announcement) {
    notFound();
  }

  const now = new Date();
  const nowTime =
    new Date(now.getTime() - now.getTimezoneOffset() * 60000).getTime();

  const isExpired =
    new Date(announcement.end_time).getTime() < nowTime;

  return (
    <main className="relative min-h-screen px-4 py-12 md:py-16">

      {/* 🌈 Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-200/30 blur-[120px] rounded-full -z-10" />

      <div className="max-w-4xl mx-auto">

        {/* 🔙 Back */}
        <Link
          href="/announcements"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          Back to Updates
        </Link>

        {/* 📣 Main Card */}
        <article className="relative bg-white/70 backdrop-blur border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">

          {/* Glow */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-xl" />

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-blue-600 mb-3">
              <Megaphone className="w-5 h-5" />
              <span className="text-sm font-semibold">Announcement</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              {announcement.title}
            </h1>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-6 text-sm text-slate-500 mb-8">

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Posted{" "}
                {new Date(announcement.start_time).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                Valid until{" "}
                {new Date(announcement.end_time).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

          </div>

          {/* Expired Warning */}
          {isExpired && (
            <div className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 mb-6">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                This announcement has expired
              </span>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-slate max-w-none text-[15px] md:text-base leading-relaxed whitespace-pre-wrap">
            {announcement.message}
          </div>
        </article>
      </div>
    </main>
  );
}