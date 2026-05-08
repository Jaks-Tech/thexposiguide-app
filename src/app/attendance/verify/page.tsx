"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LocationStatus from "@/components/attendance/LocationStatus";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Checking location...</div>}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("session");
  const code = searchParams.get("code");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Checking location...");

  const handleLocationReady = async ({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      const res = await fetch("/api/attendance/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          code,
          latitude,
          longitude,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Validation failed");
        setLoading(false);
        return;
      }

      router.push(`/attendance/form?session=${sessionId}`);
    } catch (err) {
      console.error(err);
      setMessage("Network error");
      setLoading(false);
    }
  };

  if (!sessionId || !code) {
    return <p className="p-6 text-center text-red-500">Invalid attendance link</p>;
  }

  return (
    <div className="p-6 text-center">
      <LocationStatus onLocationReady={handleLocationReady} />

      <p className="mt-4 text-sm text-gray-600">{message}</p>
      {loading && (
        <p className="mt-2 text-xs text-gray-400">
          Please keep this page open.
        </p>
      )}
    </div>
  );
}
