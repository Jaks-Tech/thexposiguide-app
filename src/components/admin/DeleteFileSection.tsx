"use client";
import { useEffect, useState } from "react";
import AdminCard from "./AdminCard";

export default function DeleteFileSection({
  handleFileDelete,
}: {
  handleFileDelete: (e: React.FormEvent) => void;
}) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // IMPORTANT: Year must match DB stored values: year-1 / year-2 / year-3 / other
  const [filters, setFilters] = useState({
    category: "notes",
    year: "year-1",
    semester: 1,
    unit_name: "",
    module: "upper",
  });

  async function loadFiles() {
    setLoading(true);

    try {
      const res = await fetch("/api/list-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });

      const data = await res.json();
      if (data.files) setFiles(data.files);
    } catch (err) {
      console.error("❌ Failed to load files:", err);
    }

    setLoading(false);
  }

  // Reload list when filters change
  useEffect(() => {
    loadFiles();
  }, [filters]);

  return (
    <section className="border border-neutral-200 p-6 rounded-xl mt-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4 text-center border-b pb-2">
        🗑️ Delete File
      </h2>

      <AdminCard title="Delete File">

        {/* ---------------- FILTERS ---------------- */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={filters.category}
              className="block w-full border border-neutral-300 rounded-md p-2"
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  category: e.target.value,
                  year: "year-1",
                  semester: 1,
                  unit_name: "",
                }))
              }
            >
              <option value="notes">Module Notes</option>
              <option value="papers">Past Papers</option>
              <option value="module">Module Markdown</option>
            </select>
          </div>

          {/* YEAR */}
          {(filters.category === "notes" || filters.category === "papers") && (
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <select
                value={filters.year}
                className="block w-full border border-neutral-300 rounded-md p-2"
                onChange={(e) =>
                  setFilters((p) => ({ ...p, year: e.target.value }))
                }
              >
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Other">Other</option>

              </select>
            </div>
          )}

          {/* SEMESTER */}
          {(filters.category === "notes" || filters.category === "papers") && (
            <div>
              <label className="block text-sm font-medium mb-1">Semester</label>
              <select
                value={filters.semester}
                className="block w-full border border-neutral-300 rounded-md p-2"
                onChange={(e) =>
                  setFilters((p) => ({ ...p, semester: Number(e.target.value) }))
                }
              >
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
              </select>
            </div>
          )}

          {/* UNIT NAME */}
          {(filters.category === "notes" || filters.category === "papers") && (
            <div>
              <label className="block text-sm font-medium mb-1">Unit Name</label>
              <input
                value={filters.unit_name}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, unit_name: e.target.value }))
                }
                placeholder="e.g., MPC I"
                className="block w-full border border-neutral-300 rounded-md p-2"
              />
            </div>
          )}

          {/* MODULE (markdown only) */}
          {filters.category === "module" && (
            <div>
              <label className="block text-sm font-medium mb-1">Module</label>
              <select
                value={filters.module}
                className="block w-full border border-neutral-300 rounded-md p-2"
                onChange={(e) =>
                  setFilters((p) => ({ ...p, module: e.target.value }))
                }
              >
                <option value="upper">Upper Extremities</option>
                <option value="lower">Lower Extremities</option>
                <option value="pelvic">Pelvic Girdle</option>
              </select>
            </div>
          )}
        </div>

        {/* ---------------- FILE LIST ---------------- */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Files</label>
          <select
            id="delFilename"
            disabled={loading}
            className="block w-full border border-neutral-300 rounded-md p-2"
          >
            <option value="">
              {loading ? "Loading..." : "Select file..."}
            </option>

            {!loading && files.length === 0 && (
              <option value="">No files found</option>
            )}

            {files.map((f) => (
              <option key={f.id} value={f.id}>
                {filters.category === "module"
                  ? f.filename
                  : `${f.year} › S${f.semester} › ${f.unit_name || "Unknown"} › ${f.filename}`}
              </option>
            ))}
          </select>
        </div>

        {/* ---------------- DELETE BUTTON ---------------- */}
        <form onSubmit={handleFileDelete}>
          <button
            type="submit"
            className="w-full bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700"
          >
            Delete File
          </button>
        </form>

      </AdminCard>
    </section>
  );
}
