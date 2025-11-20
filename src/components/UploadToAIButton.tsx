"use client";

import { useState } from "react";
import XPosiAIClient from "@/app/xposi-ai/XPosiAIClient";

export default function UploadToAIButton({ fileUrl }: { fileUrl: string }) {
  const [ready, setReady] = useState(false);

  if (ready) {
    return <XPosiAIClient fileUrl={fileUrl} />;
  }

  return (
    <button
      onClick={() => setReady(true)}
      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg"
    >
      Load File Into XPosi AI
    </button>
  );
}
