"use client";
import { useState } from "react";
import AdminCard from "./AdminCard";

export default function UploadFileSection({
  files,
  setFiles,
  image,
  setImage,
  category,
  setCategory,
  year,
  setYear,
  module,
  setModule,
  isUploading,
  handleUpload,
  uploadProgress,
}: any) {
  const [isDragging, setIsDragging] = useState(false);

  function handleFileSelect(fileList: FileList | null) {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    // append to existing queue
    setFiles((prev: File[]) => [...prev, ...newFiles]);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function removeFile(idx: number) {
    setFiles((prev: File[]) => prev.filter((_, i) => i !== idx));
  }

  return (
    <AdminCard title="📚 Upload Notes, Past Papers, or Module Markdown">
      <form onSubmit={handleUpload} className="space-y-4">

        {/* DRAG & DROP AREA + FILE INPUT */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
            transition
            ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-neutral-300 bg-neutral-50 hover:border-blue-400 hover:bg-blue-50/40"
            }
          `}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <p className="text-sm text-neutral-700">
            Drag &amp; drop files here, or{" "}
            <span className="font-semibold text-blue-600 underline">
              browse
            </span>
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            You can select multiple files at once.
          </p>

          <input
            id="fileInput"
            type="file"
            accept={category === "module" ? ".md" : "*/*"}
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>

        {/* FILE LIST + PER-FILE PROGRESS + REMOVE */}
        {files?.length > 0 && (
          <div className="space-y-2 bg-white border border-neutral-200 rounded-xl p-3 max-h-64 overflow-y-auto">
            {files.map((f: File, i: number) => {
              const isImage = f.type.startsWith("image/");
              const isPdf =
                f.type === "application/pdf" ||
                f.name.toLowerCase().endsWith(".pdf");
              const progress = uploadProgress?.[f.name] ?? 0;

              return (
                <div
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-3 py-1 border-b last:border-b-0 border-neutral-100"
                >
                  {/* THUMBNAIL / ICON */}
                  <div className="w-10 h-10 rounded-md bg-neutral-100 flex items-center justify-center overflow-hidden">
                    {isImage ? (
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="w-full h-full object-cover"
                      />
                    ) : isPdf ? (
                      <span className="text-red-600 text-xs font-semibold">
                        PDF
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-500">FILE</span>
                    )}
                  </div>

                  {/* NAME + SIZE + PROGRESS */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">
                      {f.name}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {(f.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    <div className="mt-1 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          progress === 100
                            ? "bg-emerald-500"
                            : progress > 0
                            ? "bg-blue-500"
                            : "bg-neutral-300"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* REMOVE BUTTON */}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    disabled={isUploading}
                    className="text-xs px-2 py-1 rounded-md border border-neutral-300 text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* CATEGORY / YEAR / MODULE FIELDS */}
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

        {/* MODULE IMAGE (THUMBNAIL) */}
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
                <p className="text-sm text-gray-600 truncate max-w-[150px]">
                  {image.name}
                </p>
              </div>
            )}
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isUploading || !files?.length}
          className={`w-full font-semibold py-2 rounded-md transition ${
            isUploading || !files?.length
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
