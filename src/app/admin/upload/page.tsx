"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import ActiveUsersCard from "@/components/admin/ActiveUsersCard";
import { logActivity } from "@/lib/logActivity";   // ✅ ADDED

type Stats = {
  activeUsers: number;
  notes: number;
  papers: number;
  modules: number;
  assignments: number;
  announcements: number;
};

const menuItems = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "upload-files", label: "Upload Files", icon: "📂" },
  { id: "links", label: "Useful Links", icon: "🌐" },
  { id: "assignments", label: "Assignments", icon: "📘" },
  { id: "announcements", label: "Announcements", icon: "📢" },
  { id: "recurring", label: "Recurring", icon: "🔁" },
  { id: "edit-announce", label: "Edit Announcements", icon: "✏️" },
  { id: "delete-items", label: "Delete Items", icon: "🗑️" },
];

// Toast message
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

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    const isAuth = localStorage.getItem("admin-auth");
    if (!isAuth) router.push("/admin/login");
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

  /* ---------------- STATS ---------------- */
  const [stats, setStats] = useState({
    activeUsers: 0,
    notes: 0,
    papers: 0,
    modules: 0,
    assignments: 0,
    announcements: 0,
  });

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

  /* ---------------- SCROLL SPY ---------------- */
  const [activeSection, setActiveSection] = useState("overview");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const handleScroll = () => {
      let current = "overview";
      for (const item of menuItems) {
        const el = sectionRefs.current[item.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180 && rect.bottom >= 180) {
            current = item.id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------------- HELPERS ---------------- */
  function pushActivity(message: string) {
    setActivityLog((prev) => {
      const next = [`${new Date().toLocaleTimeString()} — ${message}`, ...prev];
      return next.slice(0, 8);
    });
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }


async function handleUpload(e: React.FormEvent) {
  e.preventDefault();
  if (!files.length) return showToast("Select at least one file first.");

  setIsUploading(true);
  setUploadProgress({});

  try {
    for (const f of files) {
      // start progress at 10%
      setUploadProgress((prev) => ({ ...prev, [f.name]: 10 }));

      const formData = new FormData();

      // REQUIRED
      formData.append("file", f);
      formData.append("category", category);

      // NEW REQUIRED FIELDS
      formData.append("year", year);                   // now "year-1" correctly
      formData.append("semester", String(semester));   // 1 or 2
      formData.append("unit_name", unitName || "");    // "MPC I" etc.

      // MODULE SECTION (Markdown)
      if (category === "module") {
        formData.append("module", module);
      }

      // OPTIONAL IMAGE
      if (image) {
        formData.append("image", image);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setUploadProgress((prev) => ({ ...prev, [f.name]: 100 }));
        showToast(`Uploaded: ${f.name}`);
        pushActivity(`Uploaded file: ${f.name}`);
      } else {
        setUploadProgress((prev) => ({ ...prev, [f.name]: 100 }));
        showToast(`Upload failed: ${f.name}`);
      }
    }

    setFiles([]);
    setImage(null);
  } catch (err) {
    console.error(err);
    showToast("Upload error.");
  } finally {
    setIsUploading(false);
  }
}


  /* ---------------- DELETE LINK ---------------- */
  async function handleLinkDelete(e: React.FormEvent) {
    e.preventDefault();
    const select = document.getElementById("delLinkName") as HTMLSelectElement | null;

    if (!select?.value) return showToast("Select a link to delete.");

    const name = select.value;

    if (!confirm(`Delete link "${name}"?`)) return;

    showToast("Deleting...");

    try {
      const res = await fetch("/api/delete-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (data.success) {
        showToast("Link deleted.");
        pushActivity(`Deleted link: ${name}`);

        await logActivity(`Deleted link: ${name}`);  // ✅ ADDED

        const res2 = await fetch("/api/get-links");
        const data2 = await res2.json();
        if (data2.links) setLinks(data2.links);
      }
    } catch {
      showToast("Delete error.");
    }
  }

  /* ---------------- DELETE FILE ---------------- */
  async function handleFileDelete(e: React.FormEvent) {
    e.preventDefault();

    const fileSelect = document.getElementById("delFilename") as HTMLSelectElement | null;

    if (!fileSelect?.value) return showToast("Select a file to delete.");

    const fileId = fileSelect.value;

    if (!confirm("Delete this file?")) return;

    showToast("Deleting...");

    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fileId }),
      });

      const data = await res.json();

      if (data.success) {
        showToast("File deleted.");
        pushActivity(`Deleted file ID: ${fileId}`);

        await logActivity(`Deleted file ID: ${fileId}`);  // ✅ ADDED
      }
    } catch {
      showToast("Delete error.");
    }
  }

  /* ---------------- SIDEBAR STATE ---------------- */
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);

  /* ---------------- PAGE ---------------- */
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-slate-900">

      <style jsx global>{`
        html { scroll-behavior: smooth; }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(8px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; }
          100% { opacity: 0; transform: translateY(8px); }
        }
      `}</style>

      {/* SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col ${
          collapsedSidebar ? "w-20" : "w-72"
        } bg-white border-r border-slate-200 shadow-lg sticky top-0 h-screen transition-all duration-300`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
          <span
            className={`font-bold text-blue-700 transition-all ${
              collapsedSidebar ? "opacity-0 w-0" : "opacity-100"
            }`}
          >
            XPosi Admin
          </span>
          <button
            onClick={() => setCollapsedSidebar((p) => !p)}
            className="text-slate-500 hover:text-blue-600 text-xl"
          >
            {collapsedSidebar ? "»" : "«"}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            const active = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all border-l-4 text-sm ${
                  active
                    ? "bg-blue-100 border-blue-600 text-blue-700 shadow-sm"
                    : "border-transparent text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsedSidebar && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-6 md:px-10 py-10 max-w-[1200px] mx-auto space-y-16">

        {/* Header */}
        <header className="text-center w-full flex flex-col items-center justify-center">
          <h1 className="text-4xl font-extrabold text-blue-700">🛠 XPosiGuide Admin</h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage content, links, assignments, and announcements from a single workspace.
          </p>
        </header>


        {/* ---------------- OVERVIEW ---------------- */}
        <AdminSection
          id="overview"
          title="📊 Upload Stats"
          sectionRefs={sectionRefs}
          activeSection={activeSection}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Active Users", value: stats.activeUsers },
              { label: "Notes", value: stats.notes },
              { label: "Past Papers", value: stats.papers },
              { label: "Projections", value: stats.modules },
              { label: "Assignments", value: stats.assignments },
              { label: "Announcements", value: stats.announcements },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4"
              >
                <p className="text-xs uppercase text-slate-500">{s.label}</p>
                <p className="text-2xl font-extrabold text-blue-700">{s.value}</p>

                {/* OPTIONAL small hint for active users only */}
                {s.label === "Active Users (Realtime)" && (
                  <p className="text-[10px] mt-1 text-slate-400">
                    Counted within last 2 minutes
                  </p>
                )}
              </div>
            ))}
          </div>
        </AdminSection>


        {/* ---------------- UPLOAD FILES ---------------- */}
        <AdminSection
          id="upload-files"
          title="📂 Upload Files"
          sectionRefs={sectionRefs}
          activeSection={activeSection}
        >
        <UploadFileSection
          files={files}
          setFiles={setFiles}
          image={image}
          setImage={setImage}

          category={category}
          setCategory={setCategory}

          year={year}
          setYear={setYear}

          semester={semester}
          setSemester={setSemester}

          unitName={unitName}
          setUnitName={setUnitName}

          module={module}
          setModule={setModule}

          isUploading={isUploading}
          handleUpload={handleUpload}
          uploadProgress={uploadProgress}
        />


        </AdminSection>

          <AddLinkSection
            linkData={linkData}
            setLinkData={setLinkData}
            handleLinkSubmit={async (e: React.FormEvent) => {
              e.preventDefault();

              try {
                const res = await fetch("/api/add-link", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(linkData),
                });

                const data = await res.json();

                if (data.success) {
                  showToast("Link added successfully! ✅");

                  // reset input fields
                  setLinkData({ name: "", url: "", category: "" });

                  // log activity
                  await logActivity(`Added link: ${linkData.name}`);

                  // update dropdowns
                  const res2 = await fetch("/api/get-links");
                  const data2 = await res2.json();
                  if (data2.links) setLinks(data2.links);
                } else {
                  showToast(`Error: ${data.error}`);
                }
              } catch (err) {
                console.error(err);
                showToast("Network error while adding link ❌");
              }
            }}
          />


        {/* ---------------- ASSIGNMENTS ---------------- */}
        <AdminSection
          id="assignments"
          title="📘 Upload Assignment"
          sectionRefs={sectionRefs}
          activeSection={activeSection}
        >
          <UploadAssignmentSection />
        </AdminSection>

        {/* ---------------- ANNOUNCEMENTS ---------------- */}
        <AdminSection
          id="announcements"
          title="📢 Post Announcement"
          sectionRefs={sectionRefs}
          activeSection={activeSection}
        >
          <PostAnnouncementSection />
        </AdminSection>

        {/* ---------------- RECURRING ---------------- */}
        <AdminSection
          id="recurring"
          title="🔁 Recurring Scheduler"
          sectionRefs={sectionRefs}
          activeSection={activeSection}
        >
          <RecurringAnnouncementSection />
        </AdminSection>

        {/* ---------------- EDIT ANNOUNCEMENTS ---------------- */}
        <AdminSection
          id="edit-announce"
          title="✏️ Edit Announcements"
          sectionRefs={sectionRefs}
          activeSection={activeSection}
        >
          <EditAnnouncementSection />
        </AdminSection>

        {/* ---------------- DELETE ITEMS ---------------- */}
        <AdminSection
          id="delete-items"
          title="🗑️ Delete Items"
          sectionRefs={sectionRefs}
          activeSection={activeSection}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <DeleteFileSection handleFileDelete={handleFileDelete} />
            <DeleteLinkSection links={links} handleLinkDelete={handleLinkDelete} />
            <DeleteAnnouncementSection />
            <DeleteAssignmentSection />
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2 text-slate-800">
              Recent Activity
            </h3>

            {activityLog.length === 0 ? (
              <p className="text-sm text-slate-500">No recent actions yet.</p>
            ) : (
              <ul className="text-sm text-slate-700 space-y-1 bg-white rounded-xl p-3 border border-slate-200 max-h-40 overflow-y-auto">
                {activityLog.map((entry, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 text-xs">•</span>
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        {/* LOGOUT BUTTON BELOW RECENT ACTIVITY */}
        <div className="mt-6">
          <Logout/>
        </div>
        </AdminSection>

        <ReturnToTop />
        
      </main>

      <Toast message={toast} />
      
    </div>
  );
}

/* ---------------- SECTION WRAPPER ---------------- */
function AdminSection({
  id,
  title,
  children,
  sectionRefs,
  activeSection,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  sectionRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>;
  activeSection: string;
}) {
  const isActive = activeSection === id;

  return (
    <section
      id={id}
      ref={(el) => {
        if (el) sectionRefs.current[id] = el;
      }}
      className="scroll-mt-32"
    >
      <h2
        className={`text-2xl font-bold mb-4 transition-all ${
          isActive ? "text-blue-700 scale-[1.02]" : "text-slate-700"
        }`}
      >
        {title}
      </h2>

      <div
        className={`rounded-2xl border shadow-lg p-6 md:p-7 bg-white transition-all ${
          isActive ? "border-blue-300" : "border-slate-200"
        }`}
      >
        {children}
      </div>
    </section>
  );
}
