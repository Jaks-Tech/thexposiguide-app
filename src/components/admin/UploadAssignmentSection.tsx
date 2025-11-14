"use client";
import AdminCard from "./AdminCard";

export default function UploadAssignmentSection() {
  return (
    <AdminCard title="📘 Upload Assignment">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);

          const res = await fetch("/api/assignments/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          alert(data.success ? "✅ Assignment uploaded!" : `❌ ${data.error}`);
        }}
        className="space-y-4"
      >
        <input
          type="text"
          name="title"
          placeholder="Assignment Title"
          required
          className="border rounded-md p-2 w-full"
        />

        <textarea
          name="description"
          placeholder="Short description (optional)"
          className="border rounded-md p-2 w-full"
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Year</label>
            <select
              name="year"
              className="border rounded-md p-2 w-full"
              required
            >
              <option value="year-1">Year 1</option>
              <option value="year-2">Year 2</option>
              <option value="year-3">Year 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm">Deadline</label>
            <input
              type="datetime-local"
              name="deadline"
              className="border rounded-md p-2 w-full"
            />
          </div>
        </div>

        <input
          type="file"
          name="file"
          accept="*/*"
          required
          className="border rounded-md p-2 w-full"
        />

        <button
          type="submit"
          className="bg-green-600 text-white rounded-md py-2 w-full hover:bg-green-700"
        >
          Upload Assignment
        </button>
      </form>
    </AdminCard>
  );
}
