import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER_EMAIL = "notifications@xposiguide.co.ke";
const REPLY_TO_EMAIL = "jakstech2030@gmail.com";

const LOGO_URL = "https://xposiguide.co.ke/assets/logo.png";

interface NotificationPayload {
  to: string[];
  subject: string;
  type: 'Assignment' | 'Announcement';
  title: string;
  content: string;
  link?: string;
  attachment?: { name: string; url: string };
}

export async function sendNotification({
  to,
  subject,
  type,
  title,
  content,
  link,
  attachment
}: NotificationPayload) {
  if (!to || to.length === 0) return;

  const isAnnouncement = type === "Announcement";

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body style="margin:0; padding:0; background:#f4f6f8;">
    
    <div style="max-width:600px; margin:30px auto; font-family:Arial, sans-serif;">
      
      <div style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.05);">

        <!-- HEADER -->
        <div style="background:${isAnnouncement 
          ? '#1e293b' 
          : 'linear-gradient(90deg,#4f46e5,#7c3aed)'}; padding:20px; text-align:center;">

          <img 
            src="${LOGO_URL}" 
            alt="XPosiGuide Logo"
            width="50"
            height="50"
            style="display:block; margin:0 auto 10px auto; border-radius:50%; object-fit:cover;"
          />

          <h1 style="color:#ffffff; margin:0; font-size:18px;">
            ${isAnnouncement ? '📢 Announcement' : '📚 New Assignment'}
          </h1>
        </div>

        <!-- BODY -->
        <div style="padding:24px; color:#1e293b;">

          ${
            isAnnouncement
              ? `
          <!-- ANNOUNCEMENT BADGE -->
          <div style="margin-bottom:12px;">
            <span style="background:#e2e8f0; color:#1e293b; font-size:11px; padding:4px 10px; border-radius:999px; font-weight:bold;">
              Announcement
            </span>
          </div>
          `
              : ""
          }

          <h2 style="margin:0 0 10px 0; font-size:18px; color:#0f172a;">
            ${title}
          </h2>

          <div style="font-size:14px; line-height:1.7; color:#475569;">
            ${content}
          </div>

          ${
            attachment
              ? `
          <div style="margin-top:20px; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
            <p style="margin:0 0 6px; font-size:12px; color:#64748b;">Attachment</p>
            <a href="${attachment.url}" style="color:#4f46e5; font-weight:bold; text-decoration:none;">
              📎 ${attachment.name}
            </a>
          </div>
          `
              : ""
          }

          ${
            link
              ? `
          <div style="margin-top:28px; text-align:center;">
            <a href="${link}" 
              style="display:inline-block; padding:12px 22px; background:${isAnnouncement ? '#1e293b' : '#4f46e5'}; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:bold;">
              ${isAnnouncement ? 'Check All Announcements' : 'View Assignment'}
            </a>
          </div>
          `
              : ""
          }

        </div>

        <!-- FOOTER -->
        <div style="background:#f8fafc; padding:16px; text-align:center; font-size:11px; color:#94a3b8;">
          © ${new Date().getFullYear()} XPosiGuide Portal <br/>
          Replies go to <span style="color:#4f46e5;">${REPLY_TO_EMAIL}</span>
        </div>

      </div>

    </div>
  </body>
  </html>
  `;

  try {
    const batchData = to.map(email => ({
      from: `TheXPosiGuide <${SENDER_EMAIL}>`,
      to: email,
      reply_to: REPLY_TO_EMAIL,
      subject: subject,
      html: htmlContent,
      headers: {
        'X-Entity-Ref-ID': title.replace(/[^\x00-\x7F]/g, "").substring(0, 50)
      }
    }));

    const chunks = [];
    for (let i = 0; i < batchData.length; i += 100) {
      chunks.push(batchData.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      const { error } = await resend.batch.send(chunk);

      if (error) {
        console.error("❌ Resend Batch Error:", error);
      } else {
        console.log(`✅ Batch sent: ${chunk.length}`);
      }

      await new Promise(r => setTimeout(r, 300));
    }
  } catch (error) {
    console.error("❌ Critical Mailer Failure:", error);
  }
}