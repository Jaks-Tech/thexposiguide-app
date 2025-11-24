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
          alert(
            data.success
              ? "✅ Assignment uploaded!"
              : `❌ ${data.error}`
          );
        }}
        className="space-y-4"
      >
        {/* Assignment Title */}
        <input
          type="text"
          name="title"
          placeholder="Assignment Title"
          required
          className="border rounded-md p-2 w-full"
        />

        {/* Short description (shown on card) */}
        <textarea
          name="description"
          placeholder="Short description to show in the assignment card"
          className="border rounded-md p-2 w-full"
        />

        {/* Year + Semester */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Year</label>
            <select
              name="year"
              className="border rounded-md p-2 w-full"
              required
            >
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm">Semester</label>
            <select
              name="semester"
              className="border rounded-md p-2 w-full"
              required
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
        </div>

        {/* Unit Name */}
        <div>
          <label className="block text-sm">Unit Name</label>
          <input
            type="text"
            name="unit_name"
            placeholder="e.g. MPC I, Anatomy II"
            required
            className="border rounded-md p-2 w-full"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm">Deadline</label>
          <input
            type="datetime-local"
            name="deadline"
            className="border rounded-md p-2 w-full"
          />
        </div>

        {/* FILE (NOW OPTIONAL) */}
        <div>
          <label className="block text-sm">Optional File Upload</label>
          <input
            type="file"
            name="file"
            accept="*/*"
            className="border rounded-md p-2 w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can leave this empty if the assignment has no file.
          </p>
        </div>

        {/* Submit */}
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
