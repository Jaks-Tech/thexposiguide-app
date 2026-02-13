import { Suspense } from "react";
import ProjectionStudioClient from "./ProjectionStudioClient";

export default function ProjectionStudioPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <ProjectionStudioClient />
    </Suspense>
  );
}
