import { Resend } from 'resend';

// Make sure RESEND_API_KEY is in your .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export const EmailService = {
  /**
   * Sends a personalized timetable to a Teacher
   */
// Inside EmailService object...
async sendTeacherSchedule(email: string, name: string, scheduleHtml: string) {
  try {
    const data = await resend.emails.send({
      from: 'Academic Portal <notifications@xposiguide.co.ke>', 
      to: email,
      subject: `[REVISED] Teaching Schedule Update: ${name}`, // Changed subject to show it's a revision
      html: `
        <div style="font-family: sans-serif;">
          <h2 style="color: #4f46e5;">Schedule Modification Notice</h2>
          <p>Hello ${name}, your teaching allocation has been updated by the HOD.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          ${scheduleHtml}
        </div>
      `,
    });
    return data;
  } catch (error) {
    throw error;
  }
},

  /**
   * Sends a personalized timetable to a Student Group
   */
  async sendStudentTimetable(email: string, groupName: string, timetableHtml: string) {
    try {
      const data = await resend.emails.send({
        // Updated to use your official domain
        from: 'Registrar Office <registry@xposiguide.co.ke>',
        to: email,
        subject: `[Update] ${groupName} Academic Timetable`,
        html: timetableHtml, // Templates.ts already provides the full table grid
      });

      console.log(`✅ Timetable sent to ${groupName} (${email}). ID: ${data.data?.id}`);
      return data;
    } catch (error) {
      console.error(`❌ Failed sending to Students (${groupName}):`, error);
      throw error;
    }
  }
};