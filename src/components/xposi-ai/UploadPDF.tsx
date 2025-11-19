"use client";
import { useState } from "react";

export default function UploadPDF({ onUploaded }: { onUploaded: (id: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/xposi-ai/upload-pdf", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    onUploaded(data.pdf_id);

    setLoading(false);
  }

  return (
    <div className="p-4 border rounded-xl bg-white shadow">
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
      >
        {loading ? "Processing..." : "Upload PDF"}
      </button>
    </div>
  );
}
