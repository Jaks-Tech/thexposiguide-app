"use client";

import AdminCard from "./AdminCard";

export default function RecurringAnnouncementSection() {
  return (
    <AdminCard title="🔁 Schedule Recurring Announcement">
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const title = (document.getElementById("recTitle") as HTMLInputElement).value;
          const message = (document.getElementById("recMessage") as HTMLTextAreaElement).value;
          const start = (document.getElementById("recStart") as HTMLInputElement).value;
          const end = (document.getElementById("recEnd") as HTMLInputElement).value;
          const rule = (document.getElementById("recRule") as HTMLSelectElement).value;

          const repeatDays = Array.from(
            document.querySelectorAll("input[name='repeatDays']:checked")
          ).map((el: any) => el.value);

          const res = await fetch("/api/announcements/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              message,
              start_time: start,
              end_time: end,
              repeat_rule: rule,
              repeat_days: repeatDays,
            }),
          });

          const data = await res.json();
          alert(data.success ? "✅ Recurring announcement scheduled!" : `❌ ${data.error}`);
        }}
        className="space-y-4"
      >
        <input
          id="recTitle"
          type="text"
          placeholder="Class or Announcement Title"
          className="block w-full border border-neutral-300 rounded-md p-2"
          required
        />

        <textarea
          id="recMessage"
          placeholder="Describe your recurring announcement..."
          className="block w-full border border-neutral-300 rounded-md p-2"
          required
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Start Time</label>
            <input
              id="recStart"
              type="datetime-local"
              className="w-full border border-neutral-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">End Time</label>
            <input
              id="recEnd"
              type="datetime-local"
              className="w-full border border-neutral-300 rounded-md p-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Recurrence</label>
          <select id="recRule" className="w-full border border-neutral-300 rounded-md p-2">
            <option value="">None (One-time)</option>
            <option value="daily">Every Day</option>
            <option value="weekly">Every Week</option>
            <option value="custom">Custom Days</option>
          </select>
        </div>

        {/* DAYS CHECKBOXES */}
        <div className="flex flex-wrap gap-2 mt-2">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
            (day) => (
              <label key={day} className="flex items-center gap-1 text-sm">
                <input type="checkbox" name="repeatDays" value={day} /> {day}
              </label>
            )
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700"
        >
          Schedule Recurring Announcement
        </button>
      </form>
    </AdminCard>
  );
}
