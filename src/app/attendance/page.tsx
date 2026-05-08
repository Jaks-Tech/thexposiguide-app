"use client";

import { Suspense } from "react";
import CodeInput from "@/components/attendance/CodeInput";
import { useRouter, useSearchParams } from "next/navigation";

export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading attendance...</div>}>
      <AttendanceContent />
    </Suspense>
  );
}

function AttendanceContent() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session");

  const handleSubmit = (code: string) => {
    if (!sessionId) return;

    router.push(
      `/attendance/verify?session=${sessionId}&code=${code}`
    );
  };

  return <CodeInput onSubmit={handleSubmit} />;
}
