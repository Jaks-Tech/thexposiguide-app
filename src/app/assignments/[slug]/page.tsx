import { supabaseAdmin } from "@/lib/supabaseServer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, Calendar, Clock, Download, 
  FileText, BookOpen, AlertCircle, CheckCircle2 
} from "lucide-react";

import FilePreview from "@/components/assignments/FilePreview"; 
// 1. Import your new AI Help Button component
import AIHelpButton from "@/components/assignments/AIHelpButton"; 

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AssignmentDetailPage(props: PageProps) {
  const resolvedParams = await props.params;
  const decodedTitle = decodeURIComponent(resolvedParams.slug);

  const { data: assignment, error } = await supabaseAdmin
    .from("assignments")
    .select("*")
    .eq("title", decodedTitle) 
    .single();

  if (error || !assignment) {
    notFound();
  }

  const now = new Date();
  const hasDeadlinePassed = assignment.deadline && new Date(assignment.deadline) < now;

  let customDownloadUrl = assignment.file_url;
  let customFileName = "Assignment";

  if (assignment.file_url) {
    try {
      const urlObj = new URL(assignment.file_url);
      const ext = urlObj.pathname.split('.').pop() || "pdf";
      const safeTitle = assignment.title.replace(/[/\\?%*:|"<>]/g, '-').trim();
      customFileName = `${safeTitle}.${ext}`;
      urlObj.searchParams.set("download", customFileName);
      customDownloadUrl = urlObj.toString();
    } catch (err) {
      console.error("Error formatting download URL:", err);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 md:py-16 min-h-screen">
      
      <Link 
        href="/assignments" 
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Assignments
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Main Content & Preview */}
        <div className="lg:col-span-2 space-y-8">
          <header className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              {assignment.title}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Posted on {new Date(assignment.created_at).toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}</span>
            </div>
          </header>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Assignment Details
            </h3>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px] md:text-base mb-8">
              {assignment.description || "No specific details were provided for this assignment."}
            </div>
          </div>

           {/* 🚀 2. THE AI HELP BUTTON PLACEMENT */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Generate assignment guide</p>
                <AIHelpButton assignment={assignment} />
            </div>

          {assignment.file_url && (
            <FilePreview fileUrl={assignment.file_url} />
          )}
        </div>

        {/* RIGHT COLUMN: Action Sidebar */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">
              Course Information
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Unit</p>
                  <p className="text-sm font-bold text-slate-900">{assignment.unit_name}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wider w-1/2 text-center">
                  {assignment.year?.replace("-", " ")}
                </span>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wider w-1/2 text-center">
                  Sem {assignment.semester}
                </span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">
              Status & Deadline
            </h3>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${hasDeadlinePassed ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {hasDeadlinePassed ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Deadline</p>
                  {assignment.deadline ? (
                    <p className={`text-sm font-bold ${hasDeadlinePassed ? 'text-red-600' : 'text-slate-900'}`}>
                      {new Date(assignment.deadline).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-slate-900">No deadline set</p>
                  )}
                  {hasDeadlinePassed && <p className="text-xs text-red-500 mt-0.5">Overdue.</p>}
                </div>
              </div>

              {/* DOWNLOAD BUTTON */}
              <div className="pt-2 border-t border-slate-50">
                {assignment.file_url ? (
                  <a 
                    href={customDownloadUrl} 
                    download={customFileName}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-300 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download Resource
                  </a>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 w-full bg-slate-50 text-slate-400 py-4 px-4 rounded-xl border border-slate-100 border-dashed">
                    <CheckCircle2 className="w-5 h-5 mb-1" />
                    <span className="text-sm font-medium">No attachments</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}