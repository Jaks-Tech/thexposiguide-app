"use client";

import { useState, useRef, useEffect } from "react";
import AdminCard from "./AdminCard";
import { 
  UserPlus, Loader2, Mail, GraduationCap, 
  FileUp, Info, Users, Trash2, X, Search 
} from "lucide-react";

export default function AddStudentSection() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showList, setShowList] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- 1. Fetch Students from DB ---
  async function fetchStudents() {
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      if (data.success) setStudents(data.students);
    } catch (err) {
      console.error("Failed to fetch students");
    }
  }

  // Trigger fetch when list is toggled open
  useEffect(() => {
    if (showList) fetchStudents();
  }, [showList]);

  // --- 2. Delete Student Logic ---
  async function deleteStudent(id: string, name: string) {
    if (!confirm(`Are you sure you want to remove ${name}? This cannot be undone.`)) return;
    
    try {
      const res = await fetch("/api/admin/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        setStudents(prev => prev.filter(s => s.id !== id));
        setMessage({ type: "success", text: `🗑️ ${name} has been removed.` });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      alert("Failed to delete student");
    }
  }

  // --- 3. Handle Single Enrollment ---
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      year: formData.get("year"),
      semester: Number(formData.get("semester")),
    };

    try {
      const res = await fetch("/api/admin/students/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "✅ Student enrolled successfully!" });
        (e.target as HTMLFormElement).reset();
        if (showList) fetchStudents(); // Refresh list if it's open
      } else {
        setMessage({ type: "error", text: `❌ ${data.error || "Failed to add student"}` });
      }
    } catch (err) {
      setMessage({ type: "error", text: "❌ Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  // --- 4. Handle Bulk CSV Upload ---
  async function handleBulkUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter(line => line.trim() !== "");
      
      const studentsData = lines.slice(1).map((line) => {
        const [full_name, email, year, semester] = line.split(",").map(item => item.trim());
        return { 
          full_name, 
          email: email.toLowerCase(), 
          year: year.toLowerCase(), 
          semester: Number(semester) 
        };
      });

      try {
        const res = await fetch("/api/admin/students/bulk-add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: studentsData }),
        });
        const data = await res.json();

        if (data.success) {
          setMessage({ type: "success", text: `🚀 Successfully imported ${data.count} students!` });
          if (showList) fetchStudents();
        } else {
          setMessage({ type: "error", text: `❌ ${data.error || "Bulk import failed"}` });
        }
      } catch (err) {
        setMessage({ type: "error", text: "❌ Error during bulk upload." });
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  }

  // Filter students for search
  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminCard title="👤 Student Management">
      <div className="space-y-6">
        
        {/* Header Toggle */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400 font-medium">
            {showList ? `Showing ${filteredStudents.length} students` : "Fill details to enroll a student"}
          </p>
          <button 
            onClick={() => setShowList(!showList)}
            className="flex items-center gap-2 text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg"
          >
            {showList ? <><X className="w-3.5 h-3.5"/> Close List</> : <><Users className="w-3.5 h-3.5"/> View Students</>}
          </button>
        </div>

        {!showList ? (
          /* --- VIEW 1: ENROLLMENT FORM & BULK --- */
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Full Name</label>
                  <div className="relative">
                    <input
                      name="full_name"
                      type="text"
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      required
                    />
                    
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Email Address</label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      placeholder="e.g. student@example.com"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      required
                    />
                    
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Year</label>
                  <select
                    name="year"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  >
                    <option value="year-1">Year 1</option>
                    <option value="year-2">Year 2</option>
                    <option value="year-3">Year 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Semester</label>
                  <select
                    name="semester"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GraduationCap className="w-5 h-5" />}
                Enroll Student
              </button>
            </form>

            <div className="relative flex items-center py-6">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <div className="flex flex-col items-center">
                <input type="file" ref={fileInputRef} onChange={handleBulkUpload} accept=".csv" className="hidden" />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-sm transition-colors"
                >
                  <FileUp className="w-4 h-4" />
                  Bulk Import via CSV
                </button>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> format: full_name, email, year, semester
                </p>
            </div>
          </div>
        ) : (

/* --- VIEW 2: STUDENT LIST TABLE --- */
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Search Bar */}
            <div className="relative">
              
              <input 
                type="text" 
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-inner bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Student Info</th>
                      <th className="px-4 py-3">Level</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => {
                        const isConfirming = deletingId === s.id;

                        return (
                          <tr key={s.id} className={`transition-colors ${isConfirming ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}`}>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900">{s.full_name}</div>
                              <div className="text-[11px] text-slate-400">{s.email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase">
                                  Y{s.year?.split("-")[1]}
                                </span>
                                <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold uppercase">
                                  S{s.semester}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isConfirming ? (
                                <div className="flex items-center justify-end gap-2 animate-in fade-in zoom-in duration-200">
                                  <button 
                                    onClick={() => setDeletingId(null)}
                                    className="px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm"
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    onClick={() => {
                                      deleteStudent(s.id, s.full_name);
                                      setDeletingId(null);
                                    }}
                                    className="px-3 py-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
                                  >
                                    Confirm
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setDeletingId(s.id)}
                                  className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete Student"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-12 text-center text-slate-400 italic">
                          No students found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium animate-in fade-in zoom-in duration-300 ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </AdminCard>
  );
}