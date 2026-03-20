"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

// --- Components ---
import UploadFileSection from "@/components/admin/UploadFileSection";
import AddLinkSection from "@/components/admin/AddLinkSection";
import PostAnnouncementSection from "@/components/admin/PostAnnouncementSection";
import RecurringAnnouncementSection from "@/components/admin/RecurringAnnouncementSection";
import EditAnnouncementSection from "@/components/admin/EditAnnouncementSection";
import UploadAssignmentSection from "@/components/admin/UploadAssignmentSection";
import DeleteAssignmentSection from "@/components/admin/DeleteAssignmentSection";
import DeleteAnnouncementSection from "@/components/admin/DeleteAnnouncementSection";
import DeleteLinkSection from "@/components/admin/DeleteLinkSection";
import DeleteFileSection from "@/components/admin/DeleteFileSection";
import Logout from "@/components/admin/Logout";
import ReturnToTop from "@/components/ReturnToTop";
import AddStudentSection from "@/components/admin/AddStudentSection";
import { logActivity } from "@/lib/logActivity";

// --- Timeplanner Components ---
import AllocationBoard from "@/components/admin/scheduler/AllocationBoard";

const menuItems = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "planner", label: "Academic Timetable", icon: "📅" }, // NEW TIMEPLANNER TAB
  { id: "students", label: "Add Students", icon: "👤" },
  { id: "upload-files", label: "Upload Files (Notes, Past Papers, MD files)", icon: "📂" },
  { id: "links", label: "Add Useful Links", icon: "🌐" },
  { id: "assignments", label: "Upload Assignments", icon: "📘" },
  { id: "announcements", label: "Make Announcements", icon: "📢" },
  { id: "recurring", label: "Post Recurring Announcements", icon: "🔁" },
  { id: "edit-announce", label: "Edit Announcements", icon: "✏️" },
  { id: "delete-items", label: "Delete Items (all files above)", icon: "🗑️" },
  { id: "billing", label: "Subscription & Plan", icon: "💳" },
];

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-blue-700 text-white shadow-lg animate-[fadeInOut_4s_ease]">
      {message}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);

  /* ---------------- SAAS STATE ---------------- */
  const [orgData, setOrgData] = useState({ name: "Loading...", plan: "Free" });
  const [isPro, setIsPro] = useState(false);

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    const isAuth = localStorage.getItem("admin-auth");
    if (!isAuth) {
        router.push("/admin/login");
    } else {
        fetch("/api/saas/organization")
          .then(res => res.json())
          .then(data => {
              setOrgData({ name: data.name, plan: data.plan });
              setIsPro(data.plan === "Pro" || data.plan === "Enterprise");
          });
    }
  }, [router]);

  /* ---------------- SHARED STATE ---------------- */
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState("notes");
  const [year, setYear] = useState("year-1");
  const [module, setModule] = useState("upper");
  const [isUploading, setIsUploading] = useState(false);
  const [semester, setSemester] = useState(1);
  const [unitName, setUnitName] = useState("");
  const [linkData, setLinkData] = useState({ name: "", url: "", category: "" });
  const [links, setLinks] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [stats, setStats] = useState({
    activeUsers: 0,
    notes: 0,
    papers: 0,
    modules: 0,
    assignments: 0,
    announcements: 0,
  });

  // --- NEW TEACHER FORM STATE ---
  const [teacherForm, setTeacherForm] = useState({ full_name: "", email: "", department: "" });

  /* ---------------- STATS FETCH ---------------- */
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setStats({
            activeUsers: data.activeUsers ?? 0,
            notes: data.notes,
            papers: data.papers,
            modules: data.modules,
            assignments: data.assignments,
            announcements: data.announcements,
          });
        }
      } catch (err) {
        console.error("Failed loading stats", err);
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------- HELPERS ---------------- */
  function pushActivity(message: string) {
    setActivityLog((prev) => [`${new Date().toLocaleTimeString()} — ${message}`, ...prev].slice(0, 8));
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  /* ---------------- HANDLERS ---------------- */
  async function handleTeacherEnroll(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/timeplanner/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Lecturer Enrolled successfully! ✅");
        setTeacherForm({ full_name: "", email: "", department: "" });
        pushActivity(`Enrolled teacher: ${teacherForm.full_name}`);
      } else {
        showToast(data.error || "Enrollment failed");
      }
    } catch (err) {
      showToast("Server error during enrollment");
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!files.length) return showToast("Select at least one file first.");
    if (!isPro && stats.notes > 50) return showToast("Storage limit reached. Upgrade to Pro!");

    setIsUploading(true);
    try {
      for (const f of files) {
        setUploadProgress((prev) => ({ ...prev, [f.name]: 10 }));
        const formData = new FormData();
        formData.append("file", f);
        formData.append("category", category);
        formData.append("year", year);
        formData.append("semester", String(semester));
        formData.append("unit_name", unitName || "");
        if (category === "module") formData.append("module", module);
        if (image) formData.append("image", image);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) {
          setUploadProgress((prev) => ({ ...prev, [f.name]: 100 }));
          showToast(`Uploaded: ${f.name}`);
          pushActivity(`Uploaded file: ${f.name}`);
        }
      }
      setFiles([]);
      setImage(null);
    } catch (err) {
      showToast("Upload error.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleLinkDelete(e: React.FormEvent) {
    e.preventDefault();
    const select = document.getElementById("delLinkName") as HTMLSelectElement | null;
    if (!select?.value) return showToast("Select a link to delete.");
    const name = select.value;
    if (!confirm(`Delete link "${name}"?`)) return;
    try {
      const res = await fetch("/api/delete-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if ((await res.json()).success) {
        showToast("Link deleted.");
        await logActivity(`Deleted link: ${name}`);
        const res2 = await fetch("/api/get-links");
        const data2 = await res2.json();
        if (data2.links) setLinks(data2.links);
      }
    } catch { showToast("Delete error."); }
  }

  async function handleFileDelete(e: React.FormEvent) {
    e.preventDefault();
    const fileSelect = document.getElementById("delFilename") as HTMLSelectElement | null;
    if (!fileSelect?.value) return showToast("Select a file to delete.");
    const fileId = fileSelect.value;
    if (!confirm("Delete this file?")) return;
    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fileId }),
      });
      if ((await res.json()).success) {
        showToast("File deleted.");
        await logActivity(`Deleted file ID: ${fileId}`);
      }
    } catch { showToast("Delete error."); }
  }

  const chartData = [
    { name: "Notes", value: stats.notes, color: "#3b82f6" },
    { name: "Papers", value: stats.papers, color: "#8b5cf6" },
    { name: "Modules", value: stats.modules, color: "#f97316" },
    { name: "Assign", value: stats.assignments, color: "#ec4899" },
    { name: "Announce", value: stats.announcements, color: "#6366f1" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <style jsx global>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(8px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; }
          100% { opacity: 0; transform: translateY(8px); }
        }
      `}</style>

      {/* SIDEBAR */}
      <aside className={`hidden lg:flex flex-col ${collapsedSidebar ? "w-20" : "w-72"} bg-white border-r border-slate-200 shadow-sm sticky top-0 h-screen transition-all duration-300`}>
        <div className="flex flex-col px-6 py-8 border-b border-slate-50 gap-2">
          <div className="flex items-center justify-between">
            {!collapsedSidebar && <span className="font-black text-blue-700 text-xl tracking-tighter">XPosiGuide</span>}
            <button onClick={() => setCollapsedSidebar(!collapsedSidebar)} className="text-slate-400 hover:text-blue-600 transition-colors">
              {collapsedSidebar ? "»" : "«"}
            </button>
          </div>
          {!collapsedSidebar && (
              <div className="mt-2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{orgData.name}</p>
                  <p className="text-[9px] font-medium text-blue-400">{orgData.plan} Plan</p>
              </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-sm font-bold ${
                activeTab === item.id 
                ? "bg-blue-600 text-white shadow-xl shadow-blue-100" 
                : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsedSidebar && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-50">
             <Logout />
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-8 md:p-14 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          {activeTab === "overview" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <header className="relative text-center mb-16 px-8 py-14 rounded-[3.5rem] bg-white border border-slate-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.02)] max-w-4xl mx-auto">
                <div className="absolute inset-0 -z-10 rounded-[3.5rem] ring-1 ring-slate-100 scale-[1.01]" />
                <div className="absolute inset-0 -z-10 rounded-[3.5rem] ring-[18px] ring-slate-50/40 scale-[1.04] blur-sm" />
                <div className="absolute inset-0 -z-10 rounded-[3.5rem] ring-[36px] ring-blue-50/15 scale-[1.08] blur-2xl" />

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-widest border border-emerald-100/50 mb-6 uppercase shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {orgData.name} — System Live
                </div>

                <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight mb-4">
                  System <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Analytics</span>
                </h1>

                <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-medium">
                  Visualizing your radiography portal's health and content distribution.
                </p>
              </header>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold mb-8 text-slate-800 uppercase tracking-widest text-[11px]">Content Distribution</h3>
                <div className="w-full h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                        dy={10}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={50}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {[
                  { label: "Active Users", value: stats.activeUsers, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Total Notes", value: stats.notes, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Past Papers", value: stats.papers, color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "Projections", value: stats.modules, color: "text-orange-600", bg: "bg-orange-50" },
                  { label: "Assignments", value: stats.assignments, color: "text-pink-600", bg: "bg-pink-50" },
                  { label: "Announcements", value: stats.announcements, color: "text-indigo-600", bg: "bg-indigo-50" },
                ].map((s) => (
                  <div key={s.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">{s.label}</p>
                    <p className={`text-5xl font-black ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PLANNER & LECTURER MGMT */}
          {activeTab === "planner" && (
            <div className="space-y-10 animate-in fade-in duration-500">
              {/* Part A: Enrollment Section */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Lecturer Onboarding</h3>
                <form onSubmit={handleTeacherEnroll} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" placeholder="Full Name" value={teacherForm.full_name}
                    className="p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold outline-none"
                    onChange={(e) => setTeacherForm({...teacherForm, full_name: e.target.value})}
                    required
                  />
                  <input 
                    type="email" placeholder="Email Address" value={teacherForm.email}
                    className="p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold outline-none"
                    onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                    required
                  />
                  <div className="flex gap-2">
                    <input 
                      type="text" placeholder="Department" value={teacherForm.department}
                      className="flex-1 p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold outline-none"
                      onChange={(e) => setTeacherForm({...teacherForm, department: e.target.value})}
                      required
                    />
                    <button className="px-6 bg-blue-600 text-white font-bold rounded-2xl text-xs hover:bg-blue-700">ENROLL</button>
                  </div>
                </form>
              </div>

              {/* Part B: The Allocation Board */}
              <AllocationBoard />
            </div>
          )}

          {/* TAB: OTHER SECTIONS */}
          {activeTab === "billing" && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm animate-in fade-in duration-500">
               <h2 className="text-3xl font-black mb-6">Subscription Management</h2>
               <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 mb-8">
                  <p className="text-sm font-bold text-blue-800">Current Plan: <span className="uppercase">{orgData.plan}</span></p>
                  <p className="text-xs text-blue-600 mt-1">Your organization is currently on the {orgData.plan} tier.</p>
               </div>
               <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all">
                   Upgrade to Enterprise
               </button>
            </div>
          )}

          {activeTab === "students" && <section className="animate-in fade-in duration-500"><AddStudentSection /></section>}

          {activeTab === "upload-files" && (
            <section className="animate-in fade-in duration-500">
              <UploadFileSection
                files={files} setFiles={setFiles} image={image} setImage={setImage}
                category={category} setCategory={setCategory} year={year} setYear={setYear}
                semester={semester} setSemester={setSemester} unitName={unitName} setUnitName={setUnitName}
                module={module} setModule={setModule} isUploading={isUploading}
                handleUpload={handleUpload} uploadProgress={uploadProgress}
              />
            </section>
          )}

          {activeTab === "links" && (
            <section className="animate-in fade-in duration-500">
              <AddLinkSection
                linkData={linkData} setLinkData={setLinkData}
                handleLinkSubmit={async (e: React.FormEvent) => {
                  e.preventDefault();
                  const res = await fetch("/api/add-link", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(linkData),
                  });
                  if ((await res.json()).success) {
                    showToast("Link added! ✅");
                    setLinkData({ name: "", url: "", category: "" });
                    await logActivity(`Added link: ${linkData.name}`);
                  }
                }}
              />
            </section>
          )}

          {activeTab === "assignments" && <section className="animate-in fade-in duration-500"><UploadAssignmentSection /></section>}
          {activeTab === "announcements" && <section className="animate-in fade-in duration-500"><PostAnnouncementSection /></section>}
          {activeTab === "recurring" && <section className="animate-in fade-in duration-500"><RecurringAnnouncementSection /></section>}
          {activeTab === "edit-announce" && <section className="animate-in fade-in duration-500"><EditAnnouncementSection /></section>}
          
          {activeTab === "delete-items" && (
            <div className="grid md:grid-cols-2 gap-10 animate-in fade-in duration-500">
              <DeleteFileSection handleFileDelete={handleFileDelete} />
              <DeleteLinkSection links={links} handleLinkDelete={handleLinkDelete} />
              <DeleteAnnouncementSection />
              <DeleteAssignmentSection />
            </div>
          )}
        </div>
      </main>

      <Toast message={toast} />
      <ReturnToTop />
    </div>
  );
}