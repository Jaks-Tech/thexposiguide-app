"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("⏳ Updating password...");

    try {
      const res = await fetch("/api/admin-pass", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Password updated successfully!");
        setTimeout(() => router.push("/admin/login"), 2000);
      } else {
        setStatus(`❌ ${data.error || "Update failed"}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("⚠️ Server error");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-700">
          🔑 Change Admin Password
        </h1>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700"
          >
            Change Password
          </button>
        </form>

        {status && (
          <p className="text-center text-sm text-blue-700 font-medium animate-pulse">
            {status}
          </p>
        )}
      </div>
    </main>
  );
}
