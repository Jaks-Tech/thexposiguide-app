import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAttendanceEmail(
  to: string,
  session: any,
  records: any[],
  pdfBuffer: Buffer
) {
  try {
    const response = await resend.emails.send({
      from: "Attendance System <onboarding@resend.dev>", // change later
      to,
      subject: "Attendance Report",
      html: `
        <h2>Attendance Summary</h2>
        <p><strong>Year:</strong> ${session.year}</p>
        <p><strong>Semester:</strong> ${session.semester}</p>
        <p><strong>Time:</strong> ${session.class_start_time} - ${session.class_end_time}</p>
        <p><strong>Total Students:</strong> ${records.length}</p>
      `,
      attachments: [
        {
          filename: "attendance.pdf",
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    return response;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}