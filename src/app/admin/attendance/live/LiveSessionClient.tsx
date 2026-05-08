"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SessionCard from "@/components/attendance/SessionCard";
import CountdownTimer from "@/components/attendance/CountdownTimer";

type Session = {
  id: string;
  expires_at: string;
};

export default function LiveSessionClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/attendance/report/${sessionId}`);
        const data = await res.json();

        setSession(data.session);
      } catch (error) {
        console.error("Failed to fetch session", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="p-6 text-center text-red-600">
        ❌ No session ID provided
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-center">Loading session...</div>;
  }

  if (!session) {
    return (
      <div className="p-6 text-center text-red-600">
        ❌ Session not found
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center p-6">
      <SessionCard />

      <CountdownTimer
        expiresAt={session.expires_at}
        onExpire={() => alert("Session expired")}
      />
    </div>
  );
}