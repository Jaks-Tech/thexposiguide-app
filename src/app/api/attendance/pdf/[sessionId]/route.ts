import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import PDFDocument from "pdfkit";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Fetch session and records in parallel
    const [sessionRes, recordsRes] = await Promise.all([
      supabaseAdmin
        .from("attendance_sessions")
        .select("*")
        .eq("id", sessionId)
        .single(),

      supabaseAdmin
        .from("attendance_records")
        .select("name, admission_number, timestamp")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: true }),
    ]);

    const { data: session, error: sessionError } = sessionRes;
    const { data: records, error: recordsError } = recordsRes;

    if (sessionError || !session) throw new Error("Session not found");
    if (recordsError) throw recordsError;

    const pdfBuffer = await new Promise<Uint8Array>((resolve, reject) => {
      const fontRegular = path.join(process.cwd(), "public/fonts/Inter-Regular.ttf");
      const fontBold = path.join(process.cwd(), "public/fonts/Inter-Bold.ttf");

      const doc = new PDFDocument({
        margin: 0,
        size: "A4",
        font: fontRegular,
      });

      doc.registerFont("Regular", fontRegular);
      doc.registerFont("Bold", fontBold);

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks))));
      doc.on("error", reject);

      // --- DESIGN SYSTEM ---
      const marginX = 50;
      const colors = {
        primary: "#2563EB",
        slate900: "#0F172A",
        slate500: "#64748B",
        slate100: "#F1F5F9",
        border: "#E2E8F0"
      };

      // 1. TOP BRAND BAR
      doc.rect(0, 0, 600, 40).fill(colors.primary);

      // 2. HEADER
      doc.fillColor(colors.slate900).font("Bold").fontSize(26).text("Attendance Report", marginX, 80);
      doc.fontSize(10).font("Regular").fillColor(colors.slate500).text(
        `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 
        marginX, 110
      );

      // 3. STAT BOXES (Improved Spacing)
      const boxWidth = 155;
      const boxHeight = 55;
      const startY = 150; 

      // Box 1: Year
      doc.roundedRect(marginX, startY, boxWidth, boxHeight, 10).fill(colors.slate100);
      doc.fillColor(colors.slate500).font("Bold").fontSize(8).text("ACADEMIC YEAR", marginX + 15, startY + 15);
      doc.fillColor(colors.slate900).font("Bold").fontSize(13).text(`Year ${session.year}`, marginX + 15, startY + 30);

      // Box 2: Semester
      doc.roundedRect(220, startY, boxWidth, boxHeight, 10).fill(colors.slate100);
      doc.fillColor(colors.slate500).font("Bold").fontSize(8).text("SEMESTER", 235, startY + 15);
      doc.fillColor(colors.slate900).font("Bold").fontSize(13).text(`Semester ${session.semester}`, 235, startY + 30);

      // Box 3: Total Students
      doc.roundedRect(390, startY, boxWidth, boxHeight, 10).fill("#EFF6FF");
      doc.fillColor(colors.primary).font("Bold").fontSize(8).text("TOTAL STUDENTS", 405, startY + 15);
      doc.fillColor(colors.primary).font("Bold").fontSize(15).text(`${records?.length || 0}`, 405, startY + 30);

      // 4. TABLE SECTION
      const tableTop = 245; 
      doc.fillColor(colors.slate900).font("Bold").fontSize(14).text("Attendance Log", marginX, tableTop);
      
      // Table Header Row
      const headerY = tableTop + 30;
      doc.rect(marginX, headerY, 495, 35).fill(colors.slate900);
      
      doc.fillColor("#FFFFFF").font("Bold").fontSize(9);
      doc.text("#", marginX + 15, headerY + 13);
      doc.text("STUDENT NAME", marginX + 40, headerY + 13);
      doc.text("ADMISSION NO.", 300, headerY + 13);
      doc.text("CHECK-IN TIME", 450, headerY + 13, { align: "right", width: 80 });

      // 5. TABLE BODY
      let currentY = headerY + 35;
      doc.font("Regular").fontSize(9).fillColor(colors.slate900);

      if (!records || records.length === 0) {
        doc.moveDown(3).fillColor(colors.slate500).text("No students registered for this session.", { align: "center" });
      } else {
        records.forEach((r, i) => {
          // Page bleed check
          if (currentY > 750) {
            doc.addPage({ margin: 0 }); // Manual margin control
            // Redraw brand bar and header on new page if desired, 
            // or just reset currentY:
            currentY = 50; 
          }

          // Alternating row background
          if (i % 2 === 0) {
            doc.rect(marginX, currentY, 495, 30).fill("#FAFAFA");
          }

          doc.fillColor(colors.slate500).font("Regular").text(`${i + 1}`, marginX + 15, currentY + 10);
          doc.fillColor(colors.slate900).font("Bold").text(r.name, marginX + 40, currentY + 10);
          doc.fillColor(colors.slate500).font("Regular").text(r.admission_number, 300, currentY + 10);
          
          const time = new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          doc.text(time, 450, currentY + 10, { align: "right", width: 80 });

          // Border bottom
          doc.moveTo(marginX, currentY + 30).lineTo(545, currentY + 30).strokeColor(colors.slate100).stroke();
          
          currentY += 30;
        });
      }

      // 6. FOOTER (Global Page Numbers)
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fillColor(colors.slate500).fontSize(8).text(
          `Official Attendance Record - Page ${i + 1} of ${pages.count}`,
          0,
          doc.page.height - 30,
          { align: "center", width: doc.page.width }
        );
      }

      doc.end();
    });

    // --- RESPONSE ---
    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        // Clean Filename: Attendance_Year2_Sem2.pdf
        "Content-Disposition": `attachment; filename=Attendance_Year${session.year}_Sem${session.semester}.pdf`,
      },
    });
  } catch (err: any) {
    console.error("PDF Generation Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}