import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
  attachments?: Array<{
    filename: string;
    content: string; // base64
  }>;
}

export async function sendEmail({ to, subject, react, attachments }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Build-a-thon <noreply@babsongenerator.com>",
      to,
      subject,
      react,
      attachments,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send exception:", error);
    return { success: false, error };
  }
}
