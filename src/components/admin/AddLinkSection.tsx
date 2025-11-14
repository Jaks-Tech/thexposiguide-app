"use client";
import AdminCard from "./AdminCard";

export default function AddLinkSection({ linkData, setLinkData, handleLinkSubmit }: any) {
  return (
    <AdminCard title="🌐 Add Useful Educational Link">
      <form onSubmit={handleLinkSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Link Name"
          value={linkData.name}
          onChange={(e) => setLinkData({ ...linkData, name: e.target.value })}
          className="block w-full border border-neutral-300 rounded-md p-2"
          required
        />

        <input
          type="url"
          placeholder="https://..."
          value={linkData.url}
          onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
          className="block w-full border border-neutral-300 rounded-md p-2"
          required
        />

        <input
          type="text"
          placeholder="Category (YouTube, TikTok...)"
          value={linkData.category}
          onChange={(e) =>
            setLinkData({ ...linkData, category: e.target.value })
          }
          className="block w-full border border-neutral-300 rounded-md p-2"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700"
        >
          Add Link
        </button>
      </form>
    </AdminCard>
  );
}
