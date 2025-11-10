"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  // ✅ Redirect to login if not authenticated
  useEffect(() => {
    const isAuth = localStorage.getItem("admin-auth");
    if (!isAuth) {
      router.push("/admin/login");
    }
  }, [router]);

  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState("notes");
  const [year, setYear] = useState("year-1");
  const [module, setModule] = useState("upper");
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [linkData, setLinkData] = useState({ name: "", url: "", category: "" });

  /** 📥 Load links into delete dropdown */
  async function refreshLinks() {
    const select = document.getElementById("delLinkName") as HTMLSelectElement;
    if (!select) return;
    select.innerHTML = "<option>Loading...</option>";
    try {
      const res = await fetch("/api/get-links");
      const data = await res.json();
      if (data.links?.length) {
        select.innerHTML = data.links
          .map(
            (l: any) =>
              `<option value="${l.name}">${l.name} (${l.category || "General"})</option>`
          )
          .join("");
      } else {
        select.innerHTML = "<option>No links found</option>";
      }
    } catch (err) {
      console.error("Error fetching links:", err);
      select.innerHTML = "<option>Error loading links</option>";
    }
  }

  useEffect(() => {
    refreshLinks();
  }, []);

  /** 📤 Handle Upload */
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

        const fileInput = document.getElementById("fileInput") as HTMLInputElement | null;
        const imageInput = document.getElementById("imageInput") as HTMLInputElement | null;

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

  /** 🌐 Handle Useful Link Submission */
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
      } else {
        setStatus(`❌ Error: ${data.error || "Failed to add link"}`);
      }
    } catch {
      setStatus("❌ Network error while adding link.");
    } finally {
      setTimeout(() => setStatus(""), 6000);
    }
  };

  return (
    <main className="relative max-w-4xl mx-auto py-12 px-6 bg-white shadow-lg rounded-xl space-y-10">
      <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">
        🛠 The XPosiGuide Admin
      </h1>

      {/* === Upload Section === */}
      <section className="border border-neutral-200 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-blue-700 mb-4 text-center border-b border-blue-100 pb-2">
          📚 Upload Notes, Past Papers, or Module Markdown
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Select File
            </label>
            <input
              id="fileInput"
              type="file"
              accept={category === "module" ? ".md" : "*/*"}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              className="block w-full border border-neutral-300 rounded-md p-2"
            />
          </div>

          {/* Category, Year or Module */}
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
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Upload Module Image (Card Thumbnail)
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
                    {image.name.length > 20
                      ? image.name.slice(0, 20) + "..."
                      : image.name}
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

      {/* 🌐 Add Useful Link */}
      <section className="border border-neutral-200 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-blue-700 mb-4 text-center border-b border-blue-100 pb-2">
          🌐 Add Useful Link
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
            placeholder="Category (TikTok, YouTube, etc)"
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

      {/* 🗑️ Delete Useful Link */}
      <section className="border border-neutral-200 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-red-600 mb-4 text-center border-b border-red-100 pb-2">
          🗑️ Delete Useful Link
        </h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const name = (
              document.getElementById("delLinkName") as HTMLSelectElement
            ).value;
            if (!name) return alert("Please select a link to delete.");
            if (!confirm(`Delete the link "${name}"?`)) return;

            setStatus("⏳ Deleting link...");

            const res = await fetch("/api/delete-link", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name }),
            });
            const data = await res.json();
            if (data.success) {
              setStatus("✅ Link deleted successfully!");
              await refreshLinks();
            } else {
              setStatus(`❌ Error: ${data.error}`);
            }
          }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Link Name</label>
              <select
                id="delLinkName"
                className="block w-full border border-neutral-300 rounded-md p-2"
              >
                <option value="">Select a link...</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700"
              >
                Delete Link
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 🗑️ Delete File Section */}
      <section className="border border-neutral-200 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-red-600 mb-4 text-center border-b border-red-100 pb-2">
          🗑️ Delete Uploaded File
        </h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const category = (document.getElementById("delCategory") as HTMLSelectElement).value;
            const filename = (document.getElementById("delFilename") as HTMLSelectElement).value;
            const year = (document.getElementById("delYear") as HTMLSelectElement)?.value;
            const module = (document.getElementById("delModule") as HTMLSelectElement)?.value;

            if (!filename) return alert("Please select a file to delete.");
            if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

            setStatus("⏳ Deleting...");

            const res = await fetch("/api/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ category, filename, year, module }),
            });

            const data = await res.json();
            if (data.success) {
              setStatus("✅ File deleted successfully!");
              // Refresh file list
              const res2 = await fetch("/api/list-files", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category, year, module }),
              });
              const newData = await res2.json();
              const fileSelect = document.getElementById("delFilename") as HTMLSelectElement;
              fileSelect.innerHTML = newData.files?.length
                ? newData.files.map((f: string) => `<option value="${f}">${f}</option>`).join("")
                : "<option value=''>No files found</option>";
            } else {
              setStatus(`❌ Error: ${data.error}`);
            }
          }}
          className="space-y-4"
        >
          {/* Category and Filename */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                id="delCategory"
                className="block w-full border border-neutral-300 rounded-md p-2"
                onChange={async (e) => {
                  const val = e.target.value;
                  const yearSelect = document.getElementById("delYear") as HTMLSelectElement;
                  const moduleSelect = document.getElementById("delModule") as HTMLSelectElement;
                  const fileSelect = document.getElementById("delFilename") as HTMLSelectElement;
                  fileSelect.innerHTML = "<option value=''>Select...</option>";

                  if (val === "notes" || val === "papers") {
                    yearSelect.disabled = false;
                    moduleSelect.disabled = true;
                  } else if (val === "module") {
                    yearSelect.disabled = true;
                    moduleSelect.disabled = false;
                  } else {
                    yearSelect.disabled = true;
                    moduleSelect.disabled = true;
                  }
                }}
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

          {/* Year/Module Selectors */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <select
                id="delYear"
                defaultValue="year-1"
                onChange={async () => {
                  const category = (document.getElementById("delCategory") as HTMLSelectElement).value;
                  const year = (document.getElementById("delYear") as HTMLSelectElement).value;
                  const res = await fetch("/api/list-files", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ category, year }),
                  });
                  const data = await res.json();
                  const fileSelect = document.getElementById("delFilename") as HTMLSelectElement;
                  fileSelect.innerHTML = data?.files?.length
                    ? data.files.map((f: string) => `<option value="${f}">${f}</option>`).join("")
                    : "<option value=''>No files found</option>";
                }}
                className="block w-full border border-neutral-300 rounded-md p-2"
              >
                <option value="year-1">Year 1</option>
                <option value="year-2">Year 2</option>
                <option value="year-3">Year 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Module</label>
              <select
                id="delModule"
                defaultValue="upper"
                onChange={async () => {
                  const category = (document.getElementById("delCategory") as HTMLSelectElement).value;
                  const module = (document.getElementById("delModule") as HTMLSelectElement).value;
                  const fileSelect = document.getElementById("delFilename") as HTMLSelectElement;
                  fileSelect.innerHTML = "<option>Loading...</option>";

                  try {
                    const res = await fetch("/api/list-files", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ category, module }),
                    });
                    const data = await res.json();
                    fileSelect.innerHTML = data?.files?.length
                      ? data.files.map((f: string) => `<option value="${f}">${f}</option>`).join("")
                      : "<option value=''>No files found</option>";
                  } catch (err) {
                    console.error("Error fetching file list:", err);
                    fileSelect.innerHTML = "<option value=''>Error loading files</option>";
                  }
                }}
                className="block w-full border border-neutral-300 rounded-md p-2"
              >
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

      {/* 🔐 Logout Button (moved to bottom) */}
        <div className="flex justify-center pt-8">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to logout?")) {
                localStorage.removeItem("admin-auth");
                router.push("/admin/login");
              }
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-2.5 px-6 rounded-full shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-7.5A2.25 2.25 0 003.75 5.25v13.5A2.25 2.25 0 006 21h7.5a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>

    </main>
  );
}
