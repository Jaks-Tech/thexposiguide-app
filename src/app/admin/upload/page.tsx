"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  // 🔐 Redirect if not logged in
  useEffect(() => {
    const isAuth = localStorage.getItem("admin-auth");
    if (!isAuth) router.push("/admin/login");
  }, [router]);

  // ===== STATE =====
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState("notes");
  const [year, setYear] = useState("year-1");
  const [module, setModule] = useState("upper");
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Link management
  const [linkData, setLinkData] = useState({ name: "", url: "", category: "" });
  const [links, setLinks] = useState<any[]>([]);

  // ===== LOAD LINKS =====
  async function refreshLinks() {
    try {
      const res = await fetch("/api/get-links");
      const data = await res.json();
      if (data.links) setLinks(data.links);
    } catch (err) {
      console.error("Error fetching links:", err);
    }
  }

  useEffect(() => {
    refreshLinks();
  }, []);

  // ===== FILE UPLOAD =====
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file to upload.");

    setIsUploading(true);
    setStatus("📤 Uploading...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    if (category === "notes" || category === "papers") {
      formData.append("year", year);
    } else if (category === "module") {
      formData.append("module", module);
      if (image) formData.append("image", image);
    }

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setStatus(`✅ Uploaded successfully! (${file.name})`);
        setFile(null);
        setImage(null);

        const fileInput = document.getElementById("fileInput") as HTMLInputElement;
        const imageInput = document.getElementById("imageInput") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        if (imageInput) imageInput.value = "";
      } else {
        setStatus(`❌ Error: ${data.error || "Upload failed"}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setStatus("❌ Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setStatus(""), 6000);
    }
  };

  // ===== ADD LINK =====
  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("⏳ Adding link...");
    try {
      const res = await fetch("/api/add-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkData),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("✅ Link added successfully!");
        setLinkData({ name: "", url: "", category: "" });
        refreshLinks();
      } else setStatus(`❌ Error: ${data.error || "Failed to add link"}`);
    } catch {
      setStatus("❌ Network error while adding link.");
    } finally {
      setTimeout(() => setStatus(""), 5000);
    }
  };

  // ===== DELETE LINK =====
  const handleLinkDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    const select = document.getElementById("delLinkName") as HTMLSelectElement;
    const name = select.value;
    if (!name) return alert("Please select a link to delete.");
    if (!confirm(`Delete the link "${name}"?`)) return;
    setStatus("⏳ Deleting link...");

    try {
      const res = await fetch("/api/delete-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("✅ Link deleted successfully!");
        refreshLinks();
      } else setStatus(`❌ Error: ${data.error || "Failed to delete link"}`);
    } catch (err) {
      console.error("Error deleting link:", err);
      setStatus("❌ Failed to delete link.");
    } finally {
      setTimeout(() => setStatus(""), 5000);
    }
  };

  // ===== DELETE FILE =====
  const handleFileDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    const category = (document.getElementById("delCategory") as HTMLSelectElement).value;
    const filename = (document.getElementById("delFilename") as HTMLSelectElement).value;
    const year = (document.getElementById("delYear") as HTMLSelectElement)?.value;
    const module = (document.getElementById("delModule") as HTMLSelectElement)?.value;

    if (!filename) return alert("Please select a file to delete.");
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    setStatus("⏳ Deleting file...");

    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, filename, year, module }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("✅ File deleted successfully!");
        const fileSelect = document.getElementById("delFilename") as HTMLSelectElement;
        fileSelect.innerHTML = "<option value=''>Select...</option>";
      } else setStatus(`❌ Error: ${data.error}`);
    } catch (err) {
      console.error("Error deleting file:", err);
      setStatus("❌ Deletion failed.");
    } finally {
      setTimeout(() => setStatus(""), 5000);
    }
  };

  // ====== UI ======
  return (
    <main className="relative max-w-4xl mx-auto py-12 px-6 bg-white shadow-lg rounded-xl space-y-10">
      <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">
        🛠 The XPosiGuide Admin Dashboard
      </h1>

      {/* ================== UPLOAD SECTION ================== */}
      <section className="border border-neutral-200 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-blue-700 mb-4 text-center border-b pb-2">
          📚 Upload Notes, Past Papers, or Module Markdown
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <input
            id="fileInput"
            type="file"
            accept={category === "module" ? ".md" : "*/*"}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="block w-full border border-neutral-300 rounded-md p-2"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full border border-neutral-300 rounded-md p-2"
              >
                <option value="notes">Module Notes</option>
                <option value="papers">Past Papers</option>
                <option value="module">Module Markdown</option>
              </select>
            </div>

            {(category === "notes" || category === "papers") && (
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="block w-full border border-neutral-300 rounded-md p-2"
                >
                  <option value="year-1">Year 1</option>
                  <option value="year-2">Year 2</option>
                  <option value="year-3">Year 3</option>
                </select>
              </div>
            )}

            {category === "module" && (
              <div>
                <label className="block text-sm font-medium mb-1">Module</label>
                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  className="block w-full border border-neutral-300 rounded-md p-2"
                >
                  <option value="upper">Upper Extremities</option>
                  <option value="lower">Lower Extremities</option>
                  <option value="pelvic">Pelvic Girdle</option>
                </select>
              </div>
            )}
          </div>

          {category === "module" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Upload Module Image (Thumbnail)
              </label>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="block w-full border border-neutral-300 rounded-md p-2"
              />
              {image && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                  <p className="text-sm text-gray-600">
                    {image.name.length > 20 ? image.name.slice(0, 20) + "..." : image.name}
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className={`w-full font-semibold py-2 rounded-md transition ${
              isUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </section>

      {/* ================== ADD USEFUL LINK ================== */}
      <section className="border border-neutral-200 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-blue-700 mb-4 text-center border-b pb-2">
          🌐 Add Useful Educational Link
        </h2>
        <form onSubmit={handleLinkSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Link Name"
            value={linkData.name}
            onChange={(e) => setLinkData({ ...linkData, name: e.target.value })}
            required
            className="block w-full border border-neutral-300 rounded-md p-2"
          />
          <input
            type="url"
            placeholder="https://..."
            value={linkData.url}
            onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
            required
            className="block w-full border border-neutral-300 rounded-md p-2"
          />
          <input
            type="text"
            placeholder="Category (YouTube, TikTok, etc)"
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
      </section>

      {/* ================== DELETE LINK ================== */}
      <section className="border border-neutral-200 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-red-600 mb-4 text-center border-b pb-2">
          🗑️ Delete Useful Link
        </h2>
        <form onSubmit={handleLinkDelete} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <select
              id="delLinkName"
              className="block w-full border border-neutral-300 rounded-md p-2"
            >
              <option value="">Select link...</option>
              {links.map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name} ({l.category || "General"})
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700"
            >
              Delete Link
            </button>
          </div>
        </form>
      </section>

      {/* ================== DELETE FILE ================== */}
      <section className="border border-neutral-200 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-red-600 mb-4 text-center border-b pb-2">
          🗑️ Delete Uploaded File
        </h2>
        <form onSubmit={handleFileDelete} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                id="delCategory"
                className="block w-full border border-neutral-300 rounded-md p-2"
              >
                <option value="notes">Module Notes</option>
                <option value="papers">Past Papers</option>
                <option value="module">Module Markdown</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">File Name</label>
              <select
                id="delFilename"
                className="block w-full border border-neutral-300 rounded-md p-2"
              >
                <option value="">Select...</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <select id="delYear" defaultValue="year-1" className="block w-full border border-neutral-300 rounded-md p-2">
                <option value="year-1">Year 1</option>
                <option value="year-2">Year 2</option>
                <option value="year-3">Year 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Module</label>
              <select id="delModule" defaultValue="upper" className="block w-full border border-neutral-300 rounded-md p-2">
                <option value="upper">Upper Extremities</option>
                <option value="lower">Lower Extremities</option>
                <option value="pelvic">Pelvic Girdle</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700"
          >
            Delete File
          </button>
        </form>
      </section>

      {status && (
        <p className="text-center text-blue-700 font-medium animate-pulse">
          {status}
        </p>
      )}

      {/* ================== LOGOUT ================== */}
      <div className="flex justify-center pt-8">
        <button
          onClick={() => {
            if (confirm("Are you sure you want to logout?")) {
              localStorage.removeItem("admin-auth");
              router.push("/admin/login");
            }
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-2.5 px-6 rounded-full shadow-md hover:scale-105 transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
