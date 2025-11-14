"use client";

import AdminCard from "./AdminCard";

interface AddLinkSectionProps {
  linkData: {
    name: string;
    url: string;
    category: string;
  };
  setLinkData: (data: any) => void;
  handleLinkSubmit: (e: React.FormEvent) => void;
}

export default function AddLinkSection({
  linkData,
  setLinkData,
  handleLinkSubmit,
}: AddLinkSectionProps) {
  return (
    <section className="border border-neutral-200 p-6 rounded-xl">
      <h2 className="text-xl font-semibold text-blue-700 mb-4 text-center border-b pb-2">
        🌐 Add Useful Link
      </h2>

      <AdminCard title="Add New Link">
        <form onSubmit={handleLinkSubmit} className="space-y-4">

          {/* Link Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Link Name</label>
            <input
              type="text"
              placeholder="e.g. Anatomy Playlist"
              value={linkData.name}
              onChange={(e) =>
                setLinkData({ ...linkData, name: e.target.value })
              }
              className="block w-full border border-neutral-300 rounded-md p-2"
              required
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={linkData.url}
              onChange={(e) =>
                setLinkData({ ...linkData, url: e.target.value })
              }
              className="block w-full border border-neutral-300 rounded-md p-2"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              placeholder="YouTube, TikTok, Website..."
              value={linkData.category}
              onChange={(e) =>
                setLinkData({ ...linkData, category: e.target.value })
              }
              className="block w-full border border-neutral-300 rounded-md p-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700"
          >
            Add Link
          </button>
        </form>
      </AdminCard>
    </section>
  );
}
