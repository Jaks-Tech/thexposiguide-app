"use client";
import { useEffect, useState } from "react";
import AdminCard from "@/components/admin/AdminCard";
export default function EditAnnouncementSection() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    message: "",
    start_time: "",
    end_time: "",
    repeat_rule: "",
    repeat_days: [] as string[],
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      const res = await fetch("/api/announcements/active?includeUpcoming=true");
      const data = await res.json();
      const list = [...(data.active || []), ...(data.upcoming || []), ...(data.recurring || [])];
      setAnnouncements(list);
    } catch (err) {
      console.error("❌ Failed to load announcements:", err);
    }
  }

  // 🧭 When selecting an announcement
  function handleSelect(id: string) {
    const a = announcements.find((x) => x.id === id);
    if (!a) return;
    setSelected(a);
    setForm({
      title: a.title,
      message: a.message,
      start_time: a.start_time?.slice(0, 16),
      end_time: a.end_time?.slice(0, 16),
      repeat_rule: a.repeat_rule || "",
      repeat_days: a.repeat_days || [],
    });
  }

  // ✏️ Handle field change
  function handleChange(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // 💾 Save edited announcement
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return alert("Select an announcement to edit.");

    try {
      setStatus("Saving changes...");
      const res = await fetch("/api/announcements/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, ...form }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("✅ Announcement updated!");
        await loadAnnouncements();
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error("Update failed:", err);
      setStatus("❌ Failed to update announcement.");
    } finally {
      setTimeout(() => setStatus(""), 4000);
    }
  }

  return (
    <section className="border border-neutral-200 p-6 rounded-xl">
      <h2 className="text-xl font-semibold text-blue-700 mb-4 text-center border-b pb-2">
        ✏️ Edit Announcement
      </h2>
      <AdminCard title="Edit Announcement">
      <form onSubmit={handleUpdate} className="space-y-4">
        {/* Select existing */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Announcement</label>
          <select
            onChange={(e) => handleSelect(e.target.value)}
            className="block w-full border border-neutral-300 rounded-md p-2"
          >
            <option value="">Select...</option>
            {announcements.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.repeat_rule || "One-time"})
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Title"
              className="block w-full border border-neutral-300 rounded-md p-2"
              required
            />

            <textarea
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Message"
              className="block w-full border border-neutral-300 rounded-md p-2"
              required
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Start</label>
                <input
                  type="datetime-local"
                  value={form.start_time}
                  onChange={(e) => handleChange("start_time", e.target.value)}
                  className="block w-full border border-neutral-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">End</label>
                <input
                  type="datetime-local"
                  value={form.end_time}
                  onChange={(e) => handleChange("end_time", e.target.value)}
                  className="block w-full border border-neutral-300 rounded-md p-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Repeat Rule</label>
              <select
                value={form.repeat_rule}
                onChange={(e) => handleChange("repeat_rule", e.target.value)}
                className="block w-full border border-neutral-300 rounded-md p-2"
              >
                <option value="">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom Days</option>
              </select>
            </div>

            {form.repeat_rule === "custom" && (
              <div className="flex flex-wrap gap-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <label key={day} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={form.repeat_days.includes(day)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...form.repeat_days, day]
                          : form.repeat_days.filter((d) => d !== day);
                        handleChange("repeat_days", updated);
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700"
            >
              Save Changes
            </button>
          </>
        )}
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
