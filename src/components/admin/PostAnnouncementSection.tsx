"use client";

import AdminCard from "./AdminCard";

export default function PostAnnouncementSection() {
  return (
    <AdminCard title="🗣️ Post Announcement">
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const title = (document.getElementById("announceTitle") as HTMLInputElement).value.trim();
          const message = (document.getElementById("announceMsg") as HTMLTextAreaElement).value.trim();
          const startInput = (document.getElementById("announceStart") as HTMLInputElement).value;
          const endInput = (document.getElementById("announceEnd") as HTMLInputElement).value;

          if (!title || !message || !startInput || !endInput) {
            return alert("⚠️ Please fill in all fields before posting.");
          }

          const start_time = new Date(startInput).toISOString();
          const end_time = new Date(endInput).toISOString();

          if (new Date(end_time) <= new Date(start_time)) {
            return alert("⚠️ End time must be after start time.");
          }

          const button = (e.target as HTMLFormElement).querySelector("button")!;
          button.disabled = true;
          button.textContent = "Posting...";

          try {
            const res = await fetch("/api/announcements/post", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title, message, start_time, end_time }),
            });

            const data = await res.json();

            if (data.success) {
              alert("✅ Announcement posted successfully!");
              (e.target as HTMLFormElement).reset();
            } else {
              alert(`❌ Failed to post: ${data.error || "Unknown error"}`);
            }
          } catch (err) {
            console.error("❌ Error posting announcement:", err);
            alert("❌ Network error while posting announcement.");
          } finally {
            button.disabled = false;
            button.textContent = "Post Announcement";
          }
        }}
        className="space-y-4"
      >
        <input
          id="announceTitle"
          type="text"
          placeholder="Announcement Title"
          className="block w-full border border-neutral-300 rounded-md p-2"
          required
        />

        <textarea
          id="announceMsg"
          placeholder="Enter announcement message"
          className="block w-full border border-neutral-300 rounded-md p-2 h-28"
          required
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 font-medium">Start Time</label>
            <input
              id="announceStart"
              type="datetime-local"
              className="w-full border border-neutral-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">End Time</label>
            <input
              id="announceEnd"
              type="datetime-local"
              className="w-full border border-neutral-300 rounded-md p-2"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          Post Announcement
        </button>
      </form>
    </AdminCard>
  );
}
