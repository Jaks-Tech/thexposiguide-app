import PDFDocument from "pdfkit";

export async function generateAttendancePDF(
  session: any,
  records: any[]
): Promise<Buffer> {
  const doc = new PDFDocument();
  const chunks: Uint8Array[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  // Title
  doc.fontSize(18).text("Attendance Report", { align: "center" });
  doc.moveDown();

  // Session Info
  doc.fontSize(12);
  doc.text(`Year: ${session.year}`);
  doc.text(`Semester: ${session.semester}`);
  doc.text(
    `Time: ${session.class_start_time} - ${session.class_end_time}`
  );
  doc.text(`Total Students: ${records.length}`);

  doc.moveDown();

  // Table header
  doc.text("No.    Name                Admission Number");
  doc.moveDown(0.5);

  // Records
  records.forEach((r, i) => {
    doc.text(
      `${i + 1}.     ${r.name}        ${r.admission_number}`
    );
  });

  doc.end();

  await new Promise((resolve) => doc.on("end", resolve));

  return Buffer.concat(chunks);
}