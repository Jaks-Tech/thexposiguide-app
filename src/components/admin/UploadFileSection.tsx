"use client";
import { useState } from "react";
import AdminCard from "./AdminCard";

export default function UploadFileSection({
  file,
  setFile,
  image,
  setImage,
  category,
  setCategory,
  year,
  setYear,
  module,
  setModule,
  isUploading,
  setIsUploading,
  setStatus,
  handleUpload,
}: any) {
  return (
    <AdminCard title="📚 Upload Notes, Past Papers, or Module Markdown">
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
                <option value="other">Other</option>
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
    </AdminCard>
  );
}
