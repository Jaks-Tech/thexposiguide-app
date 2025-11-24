"use client";
import { useEffect, useState } from "react";
import AdminCard from "./AdminCard";

export default function DeleteAssignmentSection() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);

  // Load assignment list
  async function loadAssignments() {
    try {
      const res = await fetch("/api/assignments/list");
      const data = await res.json();

      if (data.assignments) setAssignments(data.assignments);
    } catch (err) {
      console.error("❌ Failed to load assignments:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignments();
  }, []);

  // Handle deletion
  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedId) return alert("Please select an assignment.");

    if (!confirm("Are you sure you want to delete this assignment?")) return;

    const res = await fetch("/api/assignments/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedId }),
    });

    const data = await res.json();

    alert(data.success ? "✅ Assignment deleted!" : `❌ ${data.error}`);

    // Refresh list
    await loadAssignments();
    setSelectedId("");
  }

  return (
    <section className="border border-neutral-200 p-6 rounded-xl mt-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4 text-center border-b pb-2">
        🗑️ Delete Assignment
      </h2>

      <AdminCard title="Delete Assignment">
        <form onSubmit={handleDelete} className="space-y-4">

          {/* DROPDOWN */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Assignment
            </label>

            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="block w-full border border-neutral-300 rounded-md p-2"
              disabled={loading}
            >
              <option value="">
                {loading ? "Loading..." : "Select assignment..."}
              </option>

              {!loading && assignments.length === 0 && (
                <option value="">No assignments found</option>
              )}

              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {/* 👇 New structured label */}
                  {`${a.year || "Other"} › S${a.semester || "?"} › ${
                    a.unit_name || "Unknown Unit"
                  } › ${a.title}`}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700"
          >
            Delete Assignment
          </button>
        </form>
      </AdminCard>
    </section>
  );
}
