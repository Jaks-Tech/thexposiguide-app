"use client";
import { useState, useEffect } from "react";
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
  semester,
  setSemester,
  unitName,
  setUnitName,
  isUploading,
  handleUpload,
  uploadProgress,
}: any) {
  const [isDragging, setIsDragging] = useState(false);

  // NEW STATE → Units pulled from DB
  const [units, setUnits] = useState<string[]>([]);
  const [useCustomUnit, setUseCustomUnit] = useState(false);

  /* ------------------------------------------------------
     LOAD UNITS when Year or Semester changes
  ------------------------------------------------------ */
  useEffect(() => {
    async function loadUnits() {
      if (!(category === "notes" || category === "papers")) return;

      if (!year || !semester) return;

      try {
        const res = await fetch(
          `/api/units?year=${encodeURIComponent(year)}&semester=${semester}`
        );
        const data = await res.json();

        if (data.units) {
          const names = data.units.map((u: any) => u.name);
          setUnits(names);
        }
      } catch (err) {
        console.error("Failed loading units:", err);
      }
    }

    loadUnits();
  }, [category, year, semester]);

  function handleFileSelect(fileList: FileList | null) {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    setFiles((prev: File[]) => [...prev, ...newFiles]);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }

  return (
    <AdminCard title="📚 Upload Notes, Past Papers, or Module Markdown">
      <form onSubmit={handleUpload} className="space-y-4">

        {/* DRAG DROP */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput")?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition
            ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-neutral-300 bg-neutral-50 hover:border-blue-400 hover:bg-blue-50/40"
            }`}
        >
          <p className="text-sm text-neutral-700">
            Drag & drop files here, or{" "}
            <span className="font-semibold text-blue-600 underline">
              browse
            </span>
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

        {/* FILE LIST */}
        {files?.length > 0 && (
          <div className="space-y-2 bg-white border p-3 rounded-xl max-h-64 overflow-y-auto">
            {files.map((f: File, i: number) => (
              <div key={i} className="flex items-center gap-3 py-1 border-b last:border-b-0">
                <div className="w-10 h-10 bg-neutral-100 rounded-md flex items-center justify-center">
                  {f.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(f)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs">{f.name.split(".").pop()}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFiles((prev: File[]) => prev.filter((_, idx) => idx !== i))
                  }
                  className="text-xs px-2 py-1 border rounded-md"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CATEGORY + YEAR */}
        <div className="grid sm:grid-cols-2 gap-4">

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setUseCustomUnit(false);
              }}
              className="border rounded-md p-2 w-full"
            >
              <option value="notes">Module Notes</option>
              <option value="papers">Past Papers</option>
              <option value="module">Module Markdown</option>
            </select>
          </div>

          {/* YEAR */}
          {(category === "notes" || category === "papers") && (
            <div>
              <label className="block text-sm mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setUseCustomUnit(false);
                }}
                className="border rounded-md p-2 w-full"
              >
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}
        </div>

        {/* SEMESTER */}
        {(category === "notes" || category === "papers") && (
          <div>
            <label className="block text-sm mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => {
                setSemester(Number(e.target.value));
                setUseCustomUnit(false);
              }}
              className="border rounded-md p-2 w-full"
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>
        )}

        {/* UNIT NAME (Dropdown from DB) */}
        {(category === "notes" || category === "papers") && (
          <div>
            <label className="block text-sm mb-1">Unit Name</label>

            {/* If DB has units → show dropdown */}
            {units.length > 0 && !useCustomUnit && (
              <select
                value={unitName}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setUseCustomUnit(true);
                    setUnitName("");
                  } else {
                    setUnitName(e.target.value);
                  }
                }}
                className="border rounded-md p-2 w-full"
              >
                <option value="">Select Unit…</option>

                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}

                <option value="__custom__">➕ Custom Unit</option>
              </select>
            )}

            {/* Manual Input */}
            {(units.length === 0 || useCustomUnit) && (
              <input
                type="text"
                value={unitName}
                placeholder="Enter unit name"
                onChange={(e) => setUnitName(e.target.value)}
                className="border rounded-md p-2 w-full mt-1"
              />
            )}
          </div>
        )}

        {/* MODULE FOR MARKDOWN */}
        {category === "module" && (
          <div>
            <label className="block text-sm mb-1">Module</label>
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="border rounded-md p-2 w-full"
            >
              <option value="upper">Upper Extremities</option>
              <option value="lower">Lower Extremities</option>
              <option value="pelvic">Pelvic Girdle</option>
            </select>
          </div>
        )}

        {/* THUMBNAIL FOR MARKDOWN */}
        {category === "module" && (
          <div>
            <label className="block text-sm mb-1">Module Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="border rounded-md p-2 w-full"
            />
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isUploading || !files.length}
          className={`w-full py-2 rounded-md font-semibold ${
            isUploading || !files.length
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
