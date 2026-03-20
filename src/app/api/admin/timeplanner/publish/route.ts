import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { EmailService } from "@/services/notifications/email-service";
import { EmailTemplates } from "@/services/notifications/templates";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // 1. Fetch ALL allocations for context
    const { data: allAllocations, error: allocError } = await supabase
      .from("allocations")
      .select(`
        *,
        teachers (full_name, email),
        units (name, year, semester)
      `);

    if (allocError || !allAllocations || allAllocations.length === 0) {
      return NextResponse.json({ error: "No allocations found" }, { status: 404 });
    }

    // Identify Drafts
    const pendingDrafts = allAllocations.filter(a => !a.is_published);
    if (pendingDrafts.length === 0) {
      return NextResponse.json({ message: "No new changes to publish." });
    }

    // Define the Public Portal URL for the "View & Download" link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://xposiguide.co.ke';
    const portalUrl = `${baseUrl}/student-tt`;

    // 2. BROADCAST TO STUDENTS (Grouped by Class)
    const affectedGroups = Array.from(new Set(pendingDrafts.map(a => `${a.units.year}|${a.units.semester}`)));

    for (const groupKey of affectedGroups) {
      const [displayYear, semesterStr] = groupKey.split("|");
      const semester = parseInt(semesterStr);
      const sanitizedYear = displayYear.toLowerCase().replace(" ", "-");

      const { data: students } = await supabase
        .from("students")
        .select("email")
        .eq("year", sanitizedYear)
        .eq("semester", semester);

      if (students && students.length > 0) {
        const groupSchedule = allAllocations.filter(a => 
          a.units.year === displayYear && a.units.semester === semester
        );
        
        // Build the HTML Table and append the Web Link + Print Instruction
        const gridHtml = EmailTemplates.generateStudentTable(displayYear, semesterStr, groupSchedule);
        
        const finalEmailBody = `
          <div style="font-family: sans-serif; max-width: 800px; margin: auto; border: 2px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
            <div style="background: #1e3a8a; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; text-transform: uppercase;">Timetable Published</h1>
            </div>
            <div style="padding: 20px;">
              ${gridHtml}
              <div style="margin-top: 30px; text-align: center; border-top: 2px dashed #cbd5e1; pt: 20px;">
                <p style="color: #64748b; font-size: 14px;">You can view the high-resolution grid and download your copy below:</p>
                <a href="${portalUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; margin: 10px 0;">
                  🌐 VIEW & DOWNLOAD ON WEB
                </a>
                <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">Tip: Use 'Print to PDF' in your browser on the portal to save for offline use.</p>
              </div>
            </div>
          </div>
        `;

        for (const student of students) {
          await EmailService.sendStudentTimetable(
            student.email, 
            `OFFICIAL: ${displayYear} Timetable Update`, 
            finalEmailBody
          );
        }
      }
    }

    // 3. BROADCAST TO TEACHERS
    const affectedTeachers = Array.from(new Set(pendingDrafts.map(a => a.teachers.email)));
    
    for (const tEmail of affectedTeachers) {
      const teacherInfo = allAllocations.find(a => a.teachers.email === tEmail)?.teachers;
      if (!teacherInfo) continue;

      const teacherLoad = allAllocations.filter(a => a.teachers.email === tEmail);
      const teacherHtml = EmailTemplates.generateTeacherSummary(teacherInfo.full_name, teacherLoad);
      
      const teacherEmailBody = `
        <div style="font-family: sans-serif; padding: 20px;">
          ${teacherHtml}
          <div style="margin-top: 20px; text-align: center;">
            <a href="${portalUrl}" style="color: #2563eb; font-weight: bold; text-decoration: underline;">
              Access Faculty Portal to Download Schedule
            </a>
          </div>
        </div>
      `;

      await EmailService.sendTeacherSchedule(tEmail, teacherInfo.full_name, teacherEmailBody);
    }

    // 4. MARK AS PUBLISHED
    await supabase
      .from("allocations")
      .update({ is_published: true })
      .eq("is_published", false);

    return NextResponse.json({ 
      success: true, 
      message: `Sync Complete: ${affectedGroups.length} classes notified.` 
    });

  } catch (err: any) {
    console.error("Critical Publishing Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}