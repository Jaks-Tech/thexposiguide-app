"use client";

import AIAnswerBox from "@/components/AIAnswerBox";

export default function XPosiAIClient({ content }: { content: string }) {
  return (
    <div className="mt-10">
      <AIAnswerBox content={content} />
    </div>
  );
}
