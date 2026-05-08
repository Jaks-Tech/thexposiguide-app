"use client";

import { useEffect, useState } from "react";

type Props = {
  expiresAt: string; // ISO string
  onExpire?: () => void;
};

export default function CountdownTimer({ expiresAt, onExpire }: Props) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(expiresAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        onExpire?.();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  return (
    <div className="text-center text-lg font-semibold text-red-600">
      ⏳ Time Remaining: {timeLeft}
    </div>
  );
}