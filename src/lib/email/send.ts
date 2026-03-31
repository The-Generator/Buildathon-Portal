import { Resend } from "resend";
import { render } from "@react-email/render";

interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  console.log(`[EMAIL] Attempting to send "${subject}" to ${to}`);
  console.log(`[EMAIL] RESEND_API_KEY present: ${!!process.env.RESEND_API_KEY}`);
  console.log(`[EMAIL] EMAIL_FROM: ${process.env.EMAIL_FROM}`);

  try {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.error("[EMAIL] RESEND_API_KEY is not set!");
      return { success: false, error: "RESEND_API_KEY is not set" };
    }

    const resend = new Resend(key);
    const html = await render(react);
    console.log(`[EMAIL] HTML rendered, length: ${html.length}`);

    const { data, error } = await resend.emails.send({
      from: `Babson Generator <${process.env.EMAIL_FROM}>`,
      replyTo: "alaraia1@babson.edu",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[EMAIL] Resend API error:", JSON.stringify(error));
      return { success: false, error };
    }

    console.log("[EMAIL] Sent successfully, id:", data?.id);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL] Exception:", error);
    return { success: false, error };
  }
}
