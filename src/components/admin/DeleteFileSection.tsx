"use client";
import AdminCard from "@/components/admin/AdminCard";
export default function DeleteFileSection({ handleFileDelete }: any) {
  return (
    <AdminCard title="🗑️ Delete Uploaded File">
      <form onSubmit={handleFileDelete} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select id="delCategory" className="border p-2 rounded-md w-full">
              <option value="notes">Notes</option>
              <option value="papers">Past Papers</option>
              <option value="module">Module</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">File Name</label>
            <select id="delFilename" className="border p-2 rounded-md w-full">
              <option value="">Select...</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Year</label>
            <select id="delYear" className="border p-2 rounded-md w-full">
              <option value="year-1">Year 1</option>
              <option value="year-2">Year 2</option>
              <option value="year-3">Year 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Module</label>
            <select id="delModule" className="border p-2 rounded-md w-full">
              <option value="upper">Upper</option>
              <option value="lower">Lower</option>
              <option value="pelvic">Pelvic</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="bg-red-600 text-white rounded-md font-semibold py-2 hover:bg-red-700 w-full"
        >
          Delete File
        </button>
      </form>
    </AdminCard>
  );
}
