"use client";
import { useEffect, useState } from "react";
import AdminCard from "@/components/admin/AdminCard";
export default function DeleteAnnouncementSection() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  // 🧠 Load announcements on mount
  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      setLoading(true);
      const res = await fetch("/api/announcements/active?includeUpcoming=true");
      const data = await res.json();
      const list = [...(data.active || []), ...(data.upcoming || []), ...(data.recurring || [])];
      setAnnouncements(list);
    } catch (err) {
      console.error("❌ Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  }

  // 🗑️ Handle delete
  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return alert("Please select an announcement to delete.");
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      setStatus("Deleting...");
      const res = await fetch("/api/announcements/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("✅ Announcement deleted!");
        await loadAnnouncements();
        setSelectedId("");
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error("Error deleting announcement:", err);
      setStatus("❌ Failed to delete.");
    } finally {
      setTimeout(() => setStatus(""), 5000);
    }
  }

  return (
    <section className="border border-neutral-200 p-6 rounded-xl">
      <h2 className="text-xl font-semibold text-red-600 mb-4 text-center border-b pb-2">
        🗑️ Delete Announcement
      </h2>
      <AdminCard title="Announcements">

      <form onSubmit={handleDelete} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Announcement</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="block w-full border border-neutral-300 rounded-md p-2"
            disabled={loading}
          >
            {loading ? (
              <option>Loading...</option>
            ) : announcements.length === 0 ? (
              <option value="">No active, upcoming, or recurring announcements</option>
            ) : (
              <>
                <option value="">Select announcement...</option>
                {announcements.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({new Date(a.start_time).toLocaleDateString()}{" "}
                    {a.repeat_rule ? `• ${a.repeat_rule}` : ""})
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !announcements.length}
          className="w-full bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400"
        >
          Delete Announcement
        </button>
      </form>
      </AdminCard>
      {status && (
        <p className="text-center mt-4 text-sm font-medium text-blue-600 animate-pulse">
          {status}
        </p>
      )}
    </section>
  );
}
