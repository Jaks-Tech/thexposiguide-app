import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { randomUUID } from "crypto";
import { sendNotification } from "@/lib/mailer"; 

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // 1. Extract Fields
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const rawYear = formData.get("year") as string | null;
    const semesterRaw = formData.get("semester") as string | null;
    const semester = semesterRaw ? Number(semesterRaw) : null;
    const unitName = formData.get("unit_name") as string | null;
    const deadline = formData.get("deadline") as string | null;

    // Normalize year
    let year = rawYear ? rawYear.toLowerCase().trim() : null;
    if (year && !year.startsWith("year-")) {
      const digit = year.replace(/\D/g, ""); 
      year = `year-${digit}`;
    }

    // Validation
    if (!title || !year || !semester || !unitName) {
      return NextResponse.json(
        { error: `Missing fields: title:${!!title}, year:${!!year}, sem:${!!semester}` },
        { status: 400 }
      );
    }

    let fileUrl: string | null = null;
    let filePath: string | null = null;

    // 2. Upload File
    if (file && file.size > 0) {
      const ext = file.name.split(".").pop() || "pdf";
      const uniqueName = `${randomUUID()}.${ext}`;
      filePath = `assignments/${year}/sem-${semester}/${uniqueName}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabaseAdmin.storage
        .from("xposilearn")
        .upload(filePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true
        });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: pub } = supabaseAdmin.storage
        .from("xposilearn")
        .getPublicUrl(filePath);

      fileUrl = pub?.publicUrl || null;
    }

    // 3. Insert into DB
    const { error: dbError } = await supabaseAdmin.from("assignments").insert([
      { 
        title, 
        description, 
        year, 
        semester, 
        unit_name: unitName, 
        deadline, 
        file_url: fileUrl, 
        path: filePath 
      }
    ]);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 4. Send Notifications
    try {
      const { data: targetedStudents, error: studentError } = await supabaseAdmin
        .from("students")
        .select("email")
        .eq("year", year)
        .eq("semester", semester);

      if (studentError) throw studentError;

      if (targetedStudents && targetedStudents.length > 0) {
        const emailList = targetedStudents.map((s) => s.email);

        const formattedDeadline = deadline 
          ? new Date(deadline).toLocaleDateString("en-GB", { 
              day: "numeric", 
              month: "short", 
              year: "numeric" 
            }) 
          : "Not specified";

        // ✅ Styled HTML Email
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
            <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">

              <h2 style="color:#2b6cb0; margin-bottom:10px;">📝 New Assignment</h2>

              <p style="font-size:16px; margin:5px 0;">
                <strong>Unit:</strong> ${unitName}
              </p>

              <p style="font-size:16px; margin:5px 0;">
                <strong>Title:</strong> ${title}
              </p>

              <hr style="border:none; border-top:1px solid #eee; margin:15px 0;" />

              <p style="font-size:15px; color:#555;">
                ${description || "Check the portal for full details."}
              </p>

              <p style="margin-top:15px; font-size:15px;">
                <strong>📅 Deadline:</strong> 
                <span style="color:#e53e3e;">${formattedDeadline}</span>
              </p>

              <div style="margin-top:20px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/assignments"
                  style="display:inline-block; padding:10px 16px; background:#2b6cb0; color:#fff; text-decoration:none; border-radius:6px;">
                  View Assignment
                </a>
              </div>

              <p style="margin-top:25px; font-size:12px; color:#888;">
                You are receiving this because you are enrolled in ${unitName}.
              </p>

            </div>
          </div>
        `;

        // 🚀 Send email
        sendNotification({
          to: emailList,
          subject: `New Assignment: ${unitName} - ${title}`,
          type: "Assignment",
          title: title,
          content: htmlContent, // ✅ NOW HTML
          link: `${process.env.NEXT_PUBLIC_SITE_URL}/assignments`,
          attachment: fileUrl && file ? { 
            name: file.name, 
            url: fileUrl 
          } : undefined
        });

        console.log(`✅ Notifications sent to ${emailList.length} students`);
      }
    } catch (mailErr) {
      console.error("⚠️ Notification Error:", mailErr);
    }

    return NextResponse.json({
      success: true,
      message: "✅ Assignment uploaded and notifications sent!",
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}