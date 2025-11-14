"use client";
import AdminCard from "./AdminCard";

export default function DeleteLinkSection({ links, handleLinkDelete }: any) {
  return (
    <AdminCard title="🗑️ Delete Useful Link">
      <form onSubmit={handleLinkDelete} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <select
            id="delLinkName"
            className="border rounded-md p-2 w-full"
          >
            <option value="">Select link...</option>
            {links.map((l: any) => (
              <option key={l.id} value={l.name}>
                {l.name} ({l.category || "General"})
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-red-600 text-white rounded-md font-semibold py-2 hover:bg-red-700"
          >
            Delete Link
          </button>
        </div>
      </form>
    </AdminCard>
  );
}
