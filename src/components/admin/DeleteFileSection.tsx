"use client";
import { useEffect, useState } from "react";
import AdminCard from "./AdminCard";

export default function DeleteFileSection({
  handleFileDelete,
}: {
  handleFileDelete: (e: React.FormEvent) => void;
}) {
  const [files, setFiles] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    category: "notes",
    year: "year-1",
    module: "upper",
  });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadFiles();
  }, [filters]);

  return (
    <section className="border border-neutral-200 p-6 rounded-xl mt-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4 text-center border-b pb-2">
        🗑️ Delete File
      </h2>

      <AdminCard title="Delete File">

        {/* Filters */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="block w-full border border-neutral-300 rounded-md p-2"
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
            >
              <option value="notes">Module Notes</option>
              <option value="papers">Past Papers</option>
              <option value="module">Module Markdown</option>
            </select>
          </div>

          {/* File Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">File Name</label>
            <select
              id="delFilename"
              className="block w-full border border-neutral-300 rounded-md p-2"
              disabled={loading}
            >
              <option value="">
                {loading ? "Loading..." : "Select file..."}
              </option>

              {!loading && files.length === 0 && (
                <option value="">No files found</option>
              )}

              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.filename}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Year & Module (only when needed) */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <select
              className="block w-full border border-neutral-300 rounded-md p-2"
              value={filters.year}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, year: e.target.value }))
              }
            >
              <option value="year-1">Year 1</option>
              <option value="year-2">Year 2</option>
              <option value="year-3">Year 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Module</label>
            <select
              className="block w-full border border-neutral-300 rounded-md p-2"
              value={filters.module}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, module: e.target.value }))
              }
            >
              <option value="upper">Upper</option>
              <option value="lower">Lower</option>
              <option value="pelvic">Pelvic</option>
            </select>
          </div>
        </div>

        {/* Delete Button */}
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
