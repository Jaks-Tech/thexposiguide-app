import { Suspense } from "react";
import LiveSessionClient from "./LiveSessionClient";

export default function LiveSessionPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading session...</div>}>
      <LiveSessionClient />
    </Suspense>
  );
}