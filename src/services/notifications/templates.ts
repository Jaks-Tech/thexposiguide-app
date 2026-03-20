// Templates 
/**
 * KMTC SaaS Notification Templates
 * Generates professional HTML for email dispatches
 */

export const EmailTemplates = {
  /**
   * Generates a clean HTML table for the Student Timetable
   */
  generateStudentTable: (year: string, semester: string, allocations: any[]) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const slots = [
      "08:00", "09:00", "10:30", "11:30", "14:00", "15:00"
    ];

    let tableRows = "";

    days.forEach((day) => {
      tableRows += `<tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">${day}</td>`;
      
      slots.forEach((slot) => {
        const match = allocations.find(a => a.day_of_week === day && a.start_time === slot);
        if (match) {
          tableRows += `
            <td style="padding: 10px; border: 1px solid #ddd; font-size: 12px;">
              <div style="font-weight: bold; color: #2563eb;">${match.units.name}</div>
              <div style="color: #64748b; font-size: 10px;">${match.room_name}</div>
              <div style="color: #94a3b8; font-size: 9px;">${match.teachers.full_name}</div>
            </td>`;
        } else {
          tableRows += `<td style="padding: 10px; border: 1px solid #ddd; color: #cbd5e1; font-size: 10px;">--</td>`;
        }
      });
      tableRows += "</tr>";
    });

    return `
      <div style="font-family: sans-serif; max-width: 800px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 20px;">
        <h2 style="color: #1e293b; margin-bottom: 5px;">Year ${year} - Semester ${semester}</h2>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Official KMTC Academic Timetable Update</p>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: #2563eb; color: white;">
              <th style="padding: 10px; border: 1px solid #2563eb;">Day</th>
              ${slots.map(s => `<th style="padding: 10px; border: 1px solid #2563eb;">${s}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div style="margin-top: 20px; font-size: 11px; color: #94a3b8; text-align: center;">
          Sent automatically via XPosiGuide Admin Console
        </div>
      </div>
    `;
  },

  /**
   * Generates a summary for the Teacher's private schedule
   */
  generateTeacherSummary: (name: string, allocations: any[]) => {
    let listItems = allocations.map(a => `
      <li style="margin-bottom: 10px; padding: 15px; background: #f8fafc; border-radius: 12px; list-style: none; border-left: 4px solid #2563eb;">
        <strong style="color: #1e293b;">${a.units.name}</strong><br/>
        <span style="font-size: 13px; color: #64748b;">${a.day_of_week} at ${a.start_time} — Room: ${a.room_name}</span><br/>
        <span style="font-size: 11px; color: #94a3b8;">Group: Year ${a.units.year} Sem ${a.units.semester}</span>
      </li>
    `).join('');

    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #1e293b;">Duty Allocation: ${name}</h2>
        <p style="color: #64748b;">Your teaching load for the current academic block has been finalized:</p>
        <ul style="padding: 0;">${listItems}</ul>
        <p style="font-size: 12px; color: #ef4444; font-weight: bold;">Note: Please contact the HOD for any rescheduling requests.</p>
      </div>
    `;
  }
};