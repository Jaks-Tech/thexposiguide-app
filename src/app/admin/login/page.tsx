"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  /** 🔐 Handle Login Submission */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("🔍 Verifying...");

    try {
      const res = await fetch("/api/verify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("admin-auth", "true");
        setStatus("✅ Login successful! Redirecting...");
        setTimeout(() => router.push("/admin/upload"), 1000);
      } else {
        setStatus("❌ Incorrect password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setStatus("⚠️ Server error, please try again later");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatus(""), 5000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-700">
          🔐 Admin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 font-semibold rounded-md transition ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Verifying..." : "Login"}
          </button>
        </form>

        {status && (
          <p className="text-center text-sm text-blue-700 font-medium animate-pulse">
            {status}
          </p>
        )}

        <p className="text-xs text-center text-gray-500 mt-4">
          © {new Date().getFullYear()} The XPosiGuide — Admin Access Only
        </p>
      </div>
    </main>
  );
}
