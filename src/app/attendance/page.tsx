"use client";

import CodeInput from "@/components/attendance/CodeInput";
import { useRouter, useSearchParams } from "next/navigation";

export default function AttendancePage() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session");

  const handleSubmit = (code: string) => {
    router.push(
      `/attendance/verify?session=${sessionId}&code=${code}`
    );
  };

  return <CodeInput onSubmit={handleSubmit} />;
}