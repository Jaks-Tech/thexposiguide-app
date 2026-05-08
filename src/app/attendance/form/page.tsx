import { Suspense } from "react";
import AttendanceFormClient from "./AttendanceFormClient";

export default function FormPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading form...</div>}>
      <AttendanceFormClient />
    </Suspense>
  );
}