"use client";

import { useState } from "react";
import StudentForm from "@/components/attendance/StudentForm";
import { useRouter, useSearchParams } from "next/navigation";

export default function AttendanceFormClient() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (data: {
    name: string;
    admissionNumber: string;
  }) => {
    if (!sessionId) {
      alert("Invalid session");
      return;
    }

    if (submitted) return;

    setLoading(true);
    setSubmitted(true);

    try {
      const res = await fetch("/api/attendance/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          ...data,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 400) {
          alert("⚠️ You already submitted attendance");
        } else {
          alert(result.error || "Submission failed");
        }

        setLoading(false);
        setSubmitted(false);
        return;
      }

      router.push(
        `/attendance/success?name=${encodeURIComponent(
          data.name
        )}&admission=${encodeURIComponent(
          data.admissionNumber
        )}&time=${Date.now()}`
      );
    } catch (err) {
      console.error(err);
      alert("❌ Network error");
      setLoading(false);
      setSubmitted(false);
    }
  };

  return <StudentForm onSubmit={handleSubmit} loading={loading} />;
}