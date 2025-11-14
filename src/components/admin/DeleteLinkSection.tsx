"use client";

import { useEffect, useState } from "react";
import AdminCard from "./AdminCard";

export default function DeleteLinkSection({
  links,
  handleLinkDelete,
}: {
  links: any[];
  handleLinkDelete: (e: React.FormEvent) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [linkList, setLinkList] = useState<any[]>([]);

  // 🔥 Load all links from API
  async function fetchLinks() {
    setLoading(true);

    const select = document.getElementById("delLinkName") as HTMLSelectElement | null;

    if (select) {
      select.innerHTML = "<option>Loading...</option>";
    }

    try {
      const res = await fetch("/api/get-links");
      const data = await res.json();

      if (!data || !data.links) {
        if (select) select.innerHTML = "<option>No links found</option>";
        setLinkList([]);
        setLoading(false);
        return;
      }

      setLinkList(data.links);

      if (select) {
        select.innerHTML = "<option value=''>Select link...</option>";

        data.links.forEach((l: any) => {
          const opt = document.createElement("option");
          opt.value = l.name;
          opt.textContent = `${l.name} (${l.category || "General"})`;
          select.appendChild(opt);
        });
      }
    } catch (err) {
      if (select) select.innerHTML = "<option>Error loading links</option>";
    } finally {
      setLoading(false);
    }
  }

  // Load on mount
  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <section className="border border-neutral-200 p-6 rounded-xl mt-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4 text-center border-b pb-2">
        🗑️ Delete Link
      </h2>

      <AdminCard title="Delete Link">
        <form onSubmit={handleLinkDelete} className="space-y-4">

          {/* Select Link */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Link</label>

            <select
              id="delLinkName"
              className="block w-full border border-neutral-300 rounded-md p-2 bg-white"
            >
              <option>Loading...</option>
            </select>
          </div>

          {/* Delete Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700 transition disabled:opacity-60"
          >
            {loading ? "Loading..." : "Delete Link"}
          </button>
        </form>
      </AdminCard>
    </section>
  );
}
